import { create } from 'zustand';
import {
  CertificationManifest,
  QuestionBank,
  UserProgress,
  ExamSession,
  Question,
  Confidence,
  ExamResult,
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
  currentStudyQuestion: Question | null;
  studyFilter: 'all' | 'cloud' | 'management';
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
  setStudyFilter: (filter: 'all' | 'cloud' | 'management') => void;
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

  setStudyFilter: (filter: 'all' | 'cloud' | 'management') => {
    set({
      studyFilter: filter,
      studySessionHistory: [],
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
    const { questionBank, progress, studySessionHistory, studyFilter, studyGroup, studySessionLimit } = get();
    if (!questionBank) return;

    // If we've reached the session limit, mark session complete (no current question)
    if (studySessionLimit && studySessionHistory.length >= studySessionLimit) {
      set({ currentStudyQuestion: null, isStudyExhausted: true });
      return;
    }
    // Apply study filter (cloud / management / all)
    const filtered = questionBank.questions.filter((q) => {
      if (studyFilter === 'all') return true;
      if (studyFilter === 'cloud') {
        return (
          q.topicId.includes('cloud') ||
          q.topicId.includes('architecture') ||
          q.topicId.includes('service')
        );
      }
      // management
      return (
        q.topicId.includes('management') ||
        q.topicId.includes('govern') ||
        q.topicId.includes('identity')
      );
    });

    const candidateQuestions = filtered.length > 0 ? filtered : questionBank.questions;

    // Partition into 3 groups and pick the group for studyGroup
    const grouped = candidateQuestions.filter((_, idx) => idx % 3 === studyGroup);
    const questionsForSession = grouped.length > 0 ? grouped : candidateQuestions;

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
    const { currentStudyQuestion, studySessionHistory, questionStartTime } = get();
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
