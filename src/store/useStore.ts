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
  showExplanation: boolean;
  selectedAnswer: string | string[] | null;
  isAnswerCorrect: boolean | null;
  questionStartTime: number;

  // Exam Mode
  examSession: ExamSession | null;

  // Actions
  initialize: () => Promise<void>;
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
      set({ manifest, questionBank, progress, isLoading: false });
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

  getNextStudyQuestion: () => {
    const { questionBank, progress, studySessionHistory } = get();
    if (!questionBank) return;

    const weakTopics = AdaptiveEngine.computeWeakTopics(
      questionBank.questions,
      progress.questionStats
    );
    const nextQuestion = AdaptiveEngine.selectNextQuestion(
      questionBank.questions,
      progress.questionStats,
      weakTopics,
      studySessionHistory
    );

    set({
      currentStudyQuestion: nextQuestion,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      questionStartTime: Date.now(),
    });
  },

  submitStudyAnswer: (answer: string | string[], confidence: Confidence = 'medium') => {
    const { currentStudyQuestion, studySessionHistory, questionStartTime } = get();
    if (!currentStudyQuestion) return;

    const isCorrect = ExamService.isQuestionCorrect(currentStudyQuestion, answer);

    const timeMs = Date.now() - questionStartTime;
    ProgressService.recordAnswer(currentStudyQuestion.id, isCorrect, timeMs, confidence);

    set({
      showExplanation: true,
      selectedAnswer: answer,
      isAnswerCorrect: isCorrect,
      studySessionHistory: [...studySessionHistory, currentStudyQuestion.id],
      progress: ProgressService.getProgress(),
    });
  },

  resetStudySession: () => {
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
