import { ExamService } from '../services/ExamService';
import { DataLoader } from '../services/DataLoader';
import { ProgressService } from '../services/ProgressService';
import { TrackingService } from '../services/TrackingService';
import { persistExamSession, restoreExamSession } from './sessionPersistence';
import type { StoreSlice, ExamSlice } from './storeTypes';

export const createExamSlice: StoreSlice<ExamSlice> = (set, get) => ({
  examSession: restoreExamSession(ProgressService.getProgress().selectedCertification),

  hasActiveSession: () => {
    const state = get();
    if (state.examSession && !state.examSession.isCompleted) return true;
    if (state.currentStudyQuestion) return true;
    return state.studySessionHistory.length > 0;
  },

  startExam: async (options) => {
    const { questionBank, manifest, progress } = get();
    if (!questionBank || !manifest) return;
    const cert = manifest.certifications.find(
      (certification) => certification.id === progress.selectedCertification,
    );
    if (!cert) return;

    const fullQuestionBank = await DataLoader.loadQuestionBank(cert.id);
    const selectedQuestions = options?.topicIds
      ? fullQuestionBank.questions.filter((question) => options.topicIds!.includes(question.topicId))
      : fullQuestionBank.questions;
    if (selectedQuestions.length === 0) {
      throw new Error(`No exam questions are available for ${cert.name}.`);
    }

    const session = ExamService.createSession(
      cert.id,
      selectedQuestions,
      cert.timeLimitMinutes,
      options?.questionCount ?? ExamService.DEFAULT_QUESTION_COUNT,
    );
    set({ examSession: session });
    persistExamSession(session);
  },

  submitExamAnswer: (questionId, answer) => {
    const { examSession } = get();
    if (!examSession) return;
    const updatedSession = ExamService.submitAnswer(examSession, questionId, answer);
    set({ examSession: updatedSession });
    persistExamSession(updatedSession);
  },

  toggleExamFlag: (questionId) => {
    const { examSession } = get();
    if (!examSession) return;
    const updatedSession = ExamService.toggleFlag(examSession, questionId);
    set({ examSession: updatedSession });
    persistExamSession(updatedSession);
  },

  navigateExam: (index) => {
    const { examSession } = get();
    if (!examSession) return;
    const updatedSession = ExamService.navigateTo(examSession, index);
    set({ examSession: updatedSession });
    persistExamSession(updatedSession);
  },

  finishExam: () => {
    const { examSession, manifest, progress } = get();
    if (!examSession || !manifest) return null;
    const cert = manifest.certifications.find(
      (certification) => certification.id === progress.selectedCertification,
    );
    if (!cert) return null;

    const result = ExamService.calculateResult(examSession, cert.passingScore);
    ProgressService.saveExamResult(result);
    try {
      TrackingService.examSubmit(result);
    } catch (error) {
      console.error('[ExamStore] Failed to track exam submission:', error);
    }

    set({
      examSession: { ...examSession, isCompleted: true },
      progress: ProgressService.getProgress(),
    });
    persistExamSession(null);
    return result;
  },

  clearExam: () => {
    set({ examSession: null });
    persistExamSession(null);
  },
});
