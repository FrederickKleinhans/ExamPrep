import type { StudySessionResult } from '../types';
import { AdaptiveEngine, qualityScore } from '../services/AdaptiveEngine';
import { DataLoader } from '../services/DataLoader';
import { ExamService } from '../services/ExamService';
import { ProgressService } from '../services/ProgressService';
import { TrackingService } from '../services/TrackingService';
import { clearStoredStudySession, persistStudySession } from './sessionPersistence';
import type { StoreSlice, StudySlice } from './storeTypes';

const initialStudyState = {
  studySessionHistory: [] as string[],
  studySessionResults: [] as StudySessionResult[],
  studyPoolQuestionIds: null as string[] | null,
  currentStudyQuestion: null,
  studyFilter: '',
  studyGroup: 0,
  studySessionLimit: 30,
  isStudyExhausted: false,
  showExplanation: false,
  selectedAnswer: null,
  isAnswerCorrect: null,
  questionStartTime: Date.now(),
};

export const createStudySlice: StoreSlice<StudySlice> = (set, get) => ({
  ...initialStudyState,

  setStudyFilter: async (filter) => {
    const { questionBank } = get();
    if (!questionBank) return;
    if (filter === 'all' && get().studyPoolQuestionIds) {
      set({
        studyFilter: 'all',
        studySessionHistory: [],
        studySessionResults: [],
        currentStudyQuestion: null,
        showExplanation: false,
        selectedAnswer: null,
        isAnswerCorrect: null,
        isStudyExhausted: false,
      });
      clearStoredStudySession();
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const chunk = await DataLoader.loadTopicChunk(questionBank.certificationId, filter);
      const loadedQuestions = questionBank.questions.some((question) => question.topicId === filter)
        ? questionBank.questions
        : [...questionBank.questions, ...chunk.questions];
      set({ questionBank: { ...questionBank, questions: loadedQuestions } });
    } catch (error) {
      set({ error: (error as Error).message, studyFilter: filter, isLoading: false });
      return;
    }
    set({
      studyFilter: filter,
      studySessionHistory: [],
      studySessionResults: [],
      studyPoolQuestionIds: null,
      currentStudyQuestion: null,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      isStudyExhausted: false,
      isLoading: false,
    });
    clearStoredStudySession();
  },

  setStudySessionLimit: (limit) => {
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
    clearStoredStudySession();
  },

  rotateStudyGroup: () => {
    const { progress } = get();
    const certId = progress.selectedCertification;
    if (!certId) return;
    const next = ProgressService.incrementStudyGroupIndex(certId);
    set({
      studyGroup: next,
      studySessionHistory: [],
      studySessionResults: [],
      studyPoolQuestionIds: null,
      currentStudyQuestion: null,
      isStudyExhausted: false,
    });
    clearStoredStudySession();
  },

  getNextStudyQuestion: () => {
    const {
      questionBank,
      progress,
      studySessionHistory,
      studyFilter,
      studySessionLimit,
      manifest,
      studyPoolQuestionIds,
    } = get();
    if (!questionBank) return;
    const certificationProgress = ProgressService.getCertificationProgress(
      progress,
      questionBank.certificationId,
    );

    if (studySessionLimit && studySessionHistory.length >= studySessionLimit) {
      set({ currentStudyQuestion: null, isStudyExhausted: true });
      persistStudySession(get());
      return;
    }
    const filtered =
      studyFilter === 'all'
        ? questionBank.questions
        : questionBank.questions.filter((question) => question.topicId === studyFilter);
    const selectedPool = studyPoolQuestionIds
      ? filtered.filter((question) => studyPoolQuestionIds.includes(question.id))
      : filtered;
    const questionsForSession = studyPoolQuestionIds
      ? selectedPool
      : filtered.length > 0
        ? filtered
        : questionBank.questions;
    const certTopics =
      manifest?.certifications.find((certification) => certification.id === questionBank.certificationId)
        ?.topics ?? [];
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
      persistStudySession(get());
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
    persistStudySession(get());
  },

  submitStudyAnswer: (answer, confidence = 'medium') => {
    const {
      currentStudyQuestion,
      questionBank,
      studySessionHistory,
      studySessionResults,
      questionStartTime,
    } = get();
    if (!currentStudyQuestion || !questionBank) return;

    const points = ExamService.calculateQuestionPoints(currentStudyQuestion, answer);
    const isCorrect = points.earned === points.total;
    const timeMs = Date.now() - questionStartTime;
    ProgressService.recordAnswerPoints(
      questionBank.certificationId,
      currentStudyQuestion.id,
      points.earned,
      points.total,
      timeMs,
      confidence,
    );
    ProgressService.updateSm2(
      questionBank.certificationId,
      currentStudyQuestion.id,
      qualityScore(isCorrect, confidence),
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
    persistStudySession(get());
  },

  resetStudySession: () => {
    if (get().studyPoolQuestionIds) {
      set({
        studySessionHistory: [],
        studySessionResults: [],
        currentStudyQuestion: null,
        showExplanation: false,
        selectedAnswer: null,
        isAnswerCorrect: null,
        isStudyExhausted: false,
      });
      clearStoredStudySession();
      return;
    }
    const progress = ProgressService.getProgress();
    const certId = progress.selectedCertification;
    if (certId) {
      const next = ProgressService.incrementStudyGroupIndex(certId);
      set({ studyGroup: next, isStudyExhausted: false });
    }
    set({
      studySessionHistory: [],
      studySessionResults: [],
      studyPoolQuestionIds: null,
      currentStudyQuestion: null,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
    });
    clearStoredStudySession();
  },

  retryMissedQuestions: async () => {
    const { progress } = get();
    const certId = progress.selectedCertification;
    if (!certId) throw new Error('Choose a certification before retrying missed questions.');

    const certificationProgress = ProgressService.getCertificationProgress(progress, certId);
    const missedIds = Object.entries(certificationProgress.questionStats)
      .filter(([, stat]) => stat.incorrect > 0)
      .map(([questionId]) => questionId);
    if (missedIds.length === 0) throw new Error('You have no missed questions to retry yet.');

    const bank = await DataLoader.loadQuestionBank(certId);
    const availableMisses = missedIds.filter((id) => bank.questions.some((question) => question.id === id));
    if (availableMisses.length === 0)
      throw new Error('No missed questions are available in this certification bank.');

    set({
      questionBank: bank,
      studyFilter: 'all',
      studySessionLimit: availableMisses.length,
      studySessionHistory: [],
      studySessionResults: [],
      studyPoolQuestionIds: availableMisses,
      currentStudyQuestion: null,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: null,
      isStudyExhausted: false,
      isLoading: false,
      error: null,
    });
    persistStudySession(get());
    get().getNextStudyQuestion();
  },
});
