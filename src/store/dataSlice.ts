import type { Question } from '../types';
import { DataLoader } from '../services/DataLoader';
import { ProgressService } from '../services/ProgressService';
import {
  clearStoredExamSession,
  clearStoredStudySession,
  readStoredStudySession,
} from './sessionPersistence';
import type { StoreSlice, DataSlice } from './storeTypes';

export const createDataSlice: StoreSlice<DataSlice> = (set, get) => ({
  manifest: null,
  questionBank: null,
  progress: ProgressService.getProgress(),
  isLoading: false,
  error: null,

  dismissError: () => set({ error: null }),

  retryLastLoad: async () => {
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
      const candidateStudy = certId ? readStoredStudySession(certId) : null;
      const savedStudy =
        candidateStudy &&
        (candidateStudy.studyFilter === 'all'
          ? candidateStudy.studyPoolQuestionIds !== null
          : (certification?.topics.some((topic) => topic.id === candidateStudy.studyFilter) ?? false))
          ? candidateStudy
          : null;
      if (candidateStudy && !savedStudy) clearStoredStudySession();

      let initialQuestions: Question[] | null =
        certId && initialTopicId ? (await DataLoader.loadTopicChunk(certId, initialTopicId)).questions : null;
      if (savedStudy?.studyPoolQuestionIds !== null && savedStudy?.studyPoolQuestionIds !== undefined) {
        initialQuestions = (await DataLoader.loadQuestionBank(certId!)).questions;
      } else if (
        savedStudy &&
        savedStudy.studyFilter !== initialTopicId &&
        savedStudy.studyFilter !== 'all'
      ) {
        const savedChunk = await DataLoader.loadTopicChunk(certId!, savedStudy.studyFilter);
        initialQuestions = [...(initialQuestions ?? []), ...savedChunk.questions];
      }
      const questionBank =
        certification && initialQuestions
          ? { certificationId: certification.id, version: certification.version, questions: initialQuestions }
          : null;
      const studyGroup = certId ? (progress.certifications[certId]?.studyGroupIndex ?? 0) : 0;
      const restoredQuestion = savedStudy?.currentQuestionId
        ? (questionBank?.questions.find((question) => question.id === savedStudy.currentQuestionId) ?? null)
        : null;
      const canRestoreStudy =
        savedStudy &&
        (savedStudy.currentQuestionId !== null
          ? restoredQuestion !== null
          : savedStudy.studySessionHistory.length === 0 || savedStudy.isStudyExhausted);

      set({
        manifest,
        questionBank,
        progress,
        studyFilter: canRestoreStudy ? savedStudy.studyFilter : initialTopicId,
        studySessionLimit: canRestoreStudy ? savedStudy.studySessionLimit : get().studySessionLimit,
        studySessionHistory: canRestoreStudy ? savedStudy.studySessionHistory : [],
        studySessionResults: canRestoreStudy ? savedStudy.studySessionResults : [],
        studyPoolQuestionIds: canRestoreStudy ? savedStudy.studyPoolQuestionIds : null,
        currentStudyQuestion: restoredQuestion,
        showExplanation: canRestoreStudy && restoredQuestion ? savedStudy.showExplanation : false,
        selectedAnswer: canRestoreStudy && restoredQuestion ? savedStudy.selectedAnswer : null,
        isAnswerCorrect: canRestoreStudy && restoredQuestion ? savedStudy.isAnswerCorrect : null,
        questionStartTime: canRestoreStudy ? savedStudy.questionStartTime : Date.now(),
        isStudyExhausted: canRestoreStudy ? savedStudy.isStudyExhausted : false,
        isLoading: false,
        studyGroup,
      });
      if (savedStudy && !canRestoreStudy) clearStoredStudySession();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectCertification: async (certId) => {
    set({ isLoading: true, error: null });
    try {
      const certification = await DataLoader.loadCertification(certId);
      const initialTopicId = certification.topics[0]?.id ?? '';
      const initialChunk = initialTopicId ? await DataLoader.loadTopicChunk(certId, initialTopicId) : null;
      const questionBank = initialChunk
        ? {
            certificationId: certification.id,
            version: certification.version,
            questions: initialChunk.questions,
          }
        : null;
      ProgressService.updateSelectedCertification(certId);
      const progress = ProgressService.getProgress();
      set({
        questionBank,
        progress,
        isLoading: false,
        studyGroup: progress.certifications[certId]?.studyGroupIndex ?? 0,
        examSession: null,
        studySessionHistory: [],
        studySessionResults: [],
        studyPoolQuestionIds: null,
        currentStudyQuestion: null,
        studyFilter: initialTopicId,
        isStudyExhausted: false,
        showExplanation: false,
        selectedAnswer: null,
        isAnswerCorrect: null,
      });
      clearStoredExamSession();
      clearStoredStudySession();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectTrack: async (trackId) => {
    ProgressService.updateSelectedTrack(trackId, undefined);
    set({ progress: ProgressService.getProgress() });
  },

  refreshProgress: () => set({ progress: ProgressService.getProgress() }),

  toggleBookmark: (questionId) => {
    const { questionBank } = get();
    if (!questionBank) return;
    ProgressService.toggleBookmark(questionBank.certificationId, questionId);
    set({ progress: ProgressService.getProgress() });
  },
});
