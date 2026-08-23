import { create } from 'zustand';
import {
  CertificationManifest,
  QuestionBank,
  UserProgress,
  ExamSession,
  Question,
  Confidence,
  ExamResult,
  StudySessionResult,
} from '../types';
import { DataLoader } from '../services/DataLoader';
import { ProgressService } from '../services/ProgressService';
import { AdaptiveEngine, qualityScore } from '../services/AdaptiveEngine';
import { ExamService } from '../services/ExamService';
import { TrackingService } from '../services/TrackingService';

interface Store {
  // Data
  manifest: CertificationManifest | null;
  questionBank: QuestionBank | null;
  progress: UserProgress;
  isLoading: boolean;
  error: string | null;

  // Study Mode
  studySessionHistory: string[];
  studySessionResults: StudySessionResult[];
  currentStudyQuestion: Question | null;
  studyFilter: string;
  studyGroup: number;
  studySessionLimit: number;
  isStudyExhausted: boolean;
  showExplanation: boolean;
  selectedAnswer: string | string[] | null;
  isAnswerCorrect: boolean | null;
  questionStartTime: number;

  // Exam Mode
  examSession: ExamSession | null;

  // Actions
  initialize: () => Promise<void>;
  setStudyFilter: (filter: string) => Promise<void>;
  setStudySessionLimit: (limit: number) => void;
  rotateStudyGroup: () => void;
  selectCertification: (certId: string) => Promise<void>;
  selectTrack: (trackId: string) => Promise<void>;
  refreshProgress: () => void;
  dismissError: () => void;
  retryLastLoad: () => Promise<void>;
  hasActiveSession: () => boolean;

  // Study actions
  getNextStudyQuestion: () => void;
  submitStudyAnswer: (answer: string | string[], confidence?: Confidence) => void;
  resetStudySession: () => void;

  // Exam actions
  startExam: () => void;
  submitExamAnswer: (questionId: string, answer: string | string[]) => void;
  toggleExamFlag: (questionId: string) => void;
  navigateExam: (index: number) => void;
  finishExam: () => ExamResult | null;
  clearExam: () => void;

  // Bookmark actions
  toggleBookmark: (questionId: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  manifest: null,
  questionBank: null,
  progress: ProgressService.getProgress(),
  isLoading: false,
  error: null,

  studySessionHistory: [],
  studySessionResults: [],
  currentStudyQuestion: null,
  studyFilter: '',
  studyGroup: 0,
  studySessionLimit: 30,
  isStudyExhausted: false,
  showExplanation: false,
  selectedAnswer: null,
  isAnswerCorrect: null,
  questionStartTime: Date.now(),

  examSession: null,

  hasActiveSession: () => {
    const s = get();
    // An exam is "in progress" if a session exists and isn't completed/cleared
    if (s.examSession && !s.examSession.isCompleted) return true;
    // A study session is "in progress" if the user has started answering
    if (s.currentStudyQuestion) return true;
    if (s.studySessionHistory.length > 0) return true;
    return false;
  },

  dismissError: () => set({ error: null }),

  retryLastLoad: async () => {
    // Clear the error and re-initialize from the current cert
    set({ error: null });
    await get().initialize();
  },

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const manifest = await DataLoader.loadManifest();
      const progress = ProgressService.getProgress();
      const certId = progress.selectedCertification || null;
      const certification = certId ? await DataLoader.loadCertification(certId) : null;
      const initialTopicId = certification?.topics[0]?.id ?? '';
      const initialChunk = certId && initialTopicId
        ? await DataLoader.loadTopicChunk(certId, initialTopicId)
        : null;
      const questionBank = certification && initialChunk
        ? { certificationId: certification.id, version: certification.version, questions: initialChunk.questions }
        : null;
      let studyGroup = 0;
      if (certId) {
        studyGroup = ProgressService.incrementStudyGroupIndex(certId);
      }
      set({ manifest, questionBank, progress, studyFilter: initialTopicId, isLoading: false, studyGroup, isStudyExhausted: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  selectCertification: async (certId: string) => {
    set({ isLoading: true, error: null });
    try {
      const certification = await DataLoader.loadCertification(certId);
      const initialTopicId = certification.topics[0]?.id ?? '';
      const initialChunk = initialTopicId ? await DataLoader.loadTopicChunk(certId, initialTopicId) : null;
      const questionBank = initialChunk
        ? { certificationId: certification.id, version: certification.version, questions: initialChunk.questions }
        : null;
      ProgressService.updateSelectedCertification(certId);
      const progress = ProgressService.getProgress();
      set({
        questionBank,
        progress,
        isLoading: false,
        // Clear any stale exam session tied to the previous cert —
        // switching certs mid-exam must not leave an orphaned session
        // that points at a question bank we just replaced.
        examSession: null,
        studySessionHistory: [],
        studySessionResults: [],
        currentStudyQuestion: null,
        studyFilter: initialTopicId,
        isStudyExhausted: false,
        showExplanation: false,
        selectedAnswer: null,
        isAnswerCorrect: null,
      });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  selectTrack: async (trackId: string) => {
    // Save the track choice. Do NOT auto-activate a cert — the user must
    // explicitly click Study or Exam from the cert detail page.
    ProgressService.updateSelectedTrack(trackId, undefined);
    set({ progress: ProgressService.getProgress() });
  },

  refreshProgress: () => {
    set({ progress: ProgressService.getProgress() });
  },

  setStudyFilter: async (filter: string) => {
    const { questionBank } = get();
    if (!questionBank) return;
    set({ isLoading: true, error: null });
    try {
      const chunk = await DataLoader.loadTopicChunk(questionBank.certificationId, filter);
      const loadedQuestions = questionBank.questions.some((question) => question.topicId === filter)
        ? questionBank.questions
        : [...questionBank.questions, ...chunk.questions];
      set({ questionBank: { ...questionBank, questions: loadedQuestions } });
    } catch (error) {
      // Graceful fallback: keep the existing question bank so the user
      // can still study, but surface the error in the banner. This is
      // better than wiping the bank on a transient chunk fetch failure.
      set({ error: (error as Error).message });
      set({
        studyFilter: filter,
        isLoading: false,
      });
      return;
    }
    set({
      studyFilter: filter,
      studySessionHistory: [],
      studySessionResults: [],
      currentStudyQuestion: null,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      isStudyExhausted: false,
      isLoading: false,
    });
  },

  setStudySessionLimit: (limit: number) => {
    set({
      studySessionLimit: limit,
      studySessionHistory: [],
      studySessionResults: [],
      currentStudyQuestion: null,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      isStudyExhausted: false,
    });
  },

  rotateStudyGroup: () => {
    const { progress } = get();
    const certId = progress.selectedCertification;
    if (!certId) return;
    const next = ProgressService.incrementStudyGroupIndex(certId);
    set({ studyGroup: next, studySessionHistory: [], currentStudyQuestion: null, isStudyExhausted: false });
  },

  getNextStudyQuestion: () => {
    const { questionBank, progress, studySessionHistory, studyFilter, studySessionLimit, manifest } = get();
    if (!questionBank) return;
    const certificationProgress = ProgressService.getCertificationProgress(
      progress,
      questionBank.certificationId,
    );

    if (studySessionLimit && studySessionHistory.length >= studySessionLimit) {
      set({ currentStudyQuestion: null, isStudyExhausted: true });
      return;
    }
    const filtered = questionBank.questions.filter((question) => question.topicId === studyFilter);
    const questionsForSession = filtered.length > 0 ? filtered : questionBank.questions;

    // Resolve topic weights from manifest for accurate SM-2 tier scoring
    const certTopics = manifest?.certifications.find(
      (c) => c.id === questionBank.certificationId,
    )?.topics ?? [];

    const weakTopics = AdaptiveEngine.computeWeakTopics(
      questionsForSession,
      certificationProgress.questionStats,
    );
    const nextQuestion = AdaptiveEngine.selectNextQuestion(
      questionsForSession,
      certificationProgress.questionStats,
      certificationProgress.sm2 ?? {},
      weakTopics,
      studySessionHistory,
      certTopics,
    );

    if (!nextQuestion) {
      set({ currentStudyQuestion: null, isStudyExhausted: true });
      return;
    }

    set({
      currentStudyQuestion: nextQuestion,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      questionStartTime: Date.now(),
      isStudyExhausted: false,
    });
  },

  submitStudyAnswer: (answer: string | string[], confidence: Confidence = 'medium') => {
    const { currentStudyQuestion, questionBank, studySessionHistory, studySessionResults, questionStartTime } = get();
    if (!currentStudyQuestion) return;
    if (!questionBank) return;

    const points = ExamService.calculateQuestionPoints(currentStudyQuestion, answer);
    const isCorrect = points.earned === points.total;
    const timeMs = Date.now() - questionStartTime;

    // Record stat
    ProgressService.recordAnswerPoints(
      questionBank.certificationId,
      currentStudyQuestion.id,
      points.earned,
      points.total,
      timeMs,
      confidence,
    );

    // Update SM-2 schedule
    const quality = qualityScore(isCorrect, confidence);
    ProgressService.updateSm2(
      questionBank.certificationId,
      currentStudyQuestion.id,
      quality,
    );

    if (!isCorrect) {
      TrackingService.questionMissed(currentStudyQuestion.id, currentStudyQuestion.topicId);
    }

    set({
      showExplanation: true,
      selectedAnswer: answer,
      isAnswerCorrect: isCorrect,
      studySessionHistory: [...studySessionHistory, currentStudyQuestion.id],
      studySessionResults: [...studySessionResults, { questionId: currentStudyQuestion.id, isCorrect }],
      progress: ProgressService.getProgress(),
    });
  },

  resetStudySession: () => {
    const progress = ProgressService.getProgress();
    const certId = progress.selectedCertification;
    if (certId) {
      const next = ProgressService.incrementStudyGroupIndex(certId);
      set({ studyGroup: next, isStudyExhausted: false });
    }
    set({
      studySessionHistory: [],
      studySessionResults: [],
      currentStudyQuestion: null,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
    });
  },

  startExam: () => {
    const { questionBank, manifest, progress } = get();
    if (!questionBank || !manifest) return;

    const cert = manifest.certifications.find(
      (c) => c.id === progress.selectedCertification
    );
    if (!cert) return;

    const session = ExamService.createSession(
      cert.id,
      questionBank.questions,
      cert.timeLimitMinutes,
      cert.questionCount
    );
    set({ examSession: session });
  },

  submitExamAnswer: (questionId: string, answer: string | string[]) => {
    const { examSession } = get();
    if (!examSession) return;
    set({ examSession: ExamService.submitAnswer(examSession, questionId, answer) });
  },

  toggleExamFlag: (questionId: string) => {
    const { examSession } = get();
    if (!examSession) return;
    set({ examSession: ExamService.toggleFlag(examSession, questionId) });
  },

  navigateExam: (index: number) => {
    const { examSession } = get();
    if (!examSession) return;
    set({ examSession: ExamService.navigateTo(examSession, index) });
  },

  finishExam: () => {
    const { examSession, manifest, progress } = get();
    if (!examSession || !manifest) return null;

    const cert = manifest.certifications.find(
      (c) => c.id === progress.selectedCertification
    );
    if (!cert) return null;

    const result = ExamService.calculateResult(examSession, cert.passingScore);
    ProgressService.saveExamResult(result);

    try {
      TrackingService.examSubmit(result);
    } catch {
      // noop
    }

    set({
      examSession: { ...examSession, isCompleted: true },
      progress: ProgressService.getProgress(),
    });

    return result;
  },

  clearExam: () => {
    set({ examSession: null });
  },

  toggleBookmark: (questionId: string) => {
    const { questionBank } = get();
    if (!questionBank) return;
    ProgressService.toggleBookmark(questionBank.certificationId, questionId);
    set({ progress: ProgressService.getProgress() });
  },
}));
