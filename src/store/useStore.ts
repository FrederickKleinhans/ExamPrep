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
import { AdaptiveEngine } from '../services/AdaptiveEngine';
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
  studyFilter: 'all' | 'cloud' | 'architecture' | 'governance' | 'management';
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
  setStudyFilter: (filter: 'all' | 'cloud' | 'architecture' | 'governance' | 'management') => void;
  setStudySessionLimit: (limit: number) => void;
  rotateStudyGroup: () => void;
  selectCertification: (certId: string) => Promise<void>;
  refreshProgress: () => void;

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
  studyFilter: 'all',
  studyGroup: 0,
  studySessionLimit: 30,
  isStudyExhausted: false,
  showExplanation: false,
  selectedAnswer: null,
  isAnswerCorrect: null,
  questionStartTime: Date.now(),

  examSession: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const manifest = await DataLoader.loadManifest();
      const progress = ProgressService.getProgress();
      const certId = progress.selectedCertification || manifest.certifications[0]?.id;
      const questionBank = certId ? await DataLoader.loadQuestionBank(certId) : null;
      // Rotate study group on load so each reload cycles groups
      let studyGroup = 0;
      if (certId) {
        studyGroup = ProgressService.incrementStudyGroupIndex(certId);
      }
      set({ manifest, questionBank, progress, isLoading: false, studyGroup, isStudyExhausted: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  selectCertification: async (certId: string) => {
    set({ isLoading: true, error: null });
    try {
      const questionBank = await DataLoader.loadQuestionBank(certId);
      ProgressService.updateSelectedCertification(certId);
      const progress = ProgressService.getProgress();
      set({
        questionBank,
        progress,
        isLoading: false,
        studySessionHistory: [],
        studySessionResults: [],
        currentStudyQuestion: null,
        studyFilter: 'all',
        isStudyExhausted: false,
        showExplanation: false,
        selectedAnswer: null,
        isAnswerCorrect: null,
      });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  refreshProgress: () => {
    set({ progress: ProgressService.getProgress() });
  },

  setStudyFilter: (filter: 'all' | 'cloud' | 'architecture' | 'governance' | 'management') => {
    set({
      studyFilter: filter,
      studySessionHistory: [],
      studySessionResults: [],
      currentStudyQuestion: null,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      isStudyExhausted: false,
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
    const { questionBank, progress, studySessionHistory, studyFilter, studySessionLimit } = get();
    if (!questionBank) return;

    // If we've reached the session limit, mark session complete (no current question)
    if (studySessionLimit && studySessionHistory.length >= studySessionLimit) {
      set({ currentStudyQuestion: null, isStudyExhausted: true });
      return;
    }
    const filtered = questionBank.questions.filter((q) => {
      if (studyFilter === 'all') return true;
      if (studyFilter === 'cloud') return q.topicId === 'describe-cloud-concepts';
      if (studyFilter === 'architecture') return q.topicId === 'describe-azure-architecture';
      if (studyFilter === 'governance') return q.topicId === 'describe-azure-management';
      if (studyFilter === 'management') return q.topicId === 'describe-azure-management' || q.topicId === 'describe-azure-identity';
      return true;
    });

    const questionsForSession = filtered.length > 0 ? filtered : questionBank.questions;

    const weakTopics = AdaptiveEngine.computeWeakTopics(
      questionsForSession,
      progress.questionStats
    );
    const nextQuestion = AdaptiveEngine.selectNextQuestion(
      questionsForSession,
      progress.questionStats,
      weakTopics,
      studySessionHistory
    );

    if (!nextQuestion) {
      // No available question (filtered/group exhausted)
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
    const { currentStudyQuestion, studySessionHistory, studySessionResults, questionStartTime } = get();
    if (!currentStudyQuestion) return;

    const points = ExamService.calculateQuestionPoints(currentStudyQuestion, answer);
    const isCorrect = points.earned === points.total;

    const timeMs = Date.now() - questionStartTime;
    ProgressService.recordAnswerPoints(currentStudyQuestion.id, points.earned, points.total, timeMs, confidence);

    if (points.earned !== points.total) {
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

    // Track exam submit
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
    ProgressService.toggleBookmark(questionId);
    set({ progress: ProgressService.getProgress() });
  },
}));
