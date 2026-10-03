import type { ExamSession, StudySessionResult } from '../types';

const EXAM_SESSION_STORAGE_KEY = 'certready_exam_session';
const STUDY_SESSION_STORAGE_KEY = 'certready_study_session';

export interface PersistedStudySession {
  certificationId: string;
  studyFilter: string;
  studySessionLimit: number;
  studySessionHistory: string[];
  studySessionResults: StudySessionResult[];
  currentQuestionId: string | null;
  studyPoolQuestionIds: string[] | null;
  showExplanation: boolean;
  selectedAnswer: string | string[] | null;
  isAnswerCorrect: boolean | null;
  questionStartTime: number;
  isStudyExhausted: boolean;
}

export interface StudySessionState {
  questionBank: { certificationId: string } | null;
  studyFilter: string;
  studySessionLimit: number;
  studySessionHistory: string[];
  studySessionResults: StudySessionResult[];
  currentStudyQuestion: { id: string } | null;
  studyPoolQuestionIds: string[] | null;
  showExplanation: boolean;
  selectedAnswer: string | string[] | null;
  isAnswerCorrect: boolean | null;
  questionStartTime: number;
  isStudyExhausted: boolean;
}

export function isPersistedStudySession(value: unknown): value is PersistedStudySession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<PersistedStudySession>;
  return (
    typeof session.certificationId === 'string' &&
    typeof session.studyFilter === 'string' &&
    typeof session.studySessionLimit === 'number' &&
    Number.isInteger(session.studySessionLimit) &&
    session.studySessionLimit > 0 &&
    Array.isArray(session.studySessionHistory) &&
    Array.isArray(session.studySessionResults) &&
    (session.currentQuestionId === null || typeof session.currentQuestionId === 'string') &&
    (session.studyPoolQuestionIds === null || Array.isArray(session.studyPoolQuestionIds)) &&
    typeof session.showExplanation === 'boolean' &&
    (session.selectedAnswer === null ||
      typeof session.selectedAnswer === 'string' ||
      Array.isArray(session.selectedAnswer)) &&
    (session.isAnswerCorrect === null || typeof session.isAnswerCorrect === 'boolean') &&
    typeof session.questionStartTime === 'number' &&
    Number.isFinite(session.questionStartTime) &&
    typeof session.isStudyExhausted === 'boolean' &&
    session.studySessionHistory.every((id) => typeof id === 'string') &&
    session.studySessionResults.every(
      (result) =>
        Boolean(result) && typeof result.questionId === 'string' && typeof result.isCorrect === 'boolean',
    ) &&
    (session.studyPoolQuestionIds === null ||
      session.studyPoolQuestionIds.every((id) => typeof id === 'string'))
  );
}

export function clearStoredStudySession(): void {
  try {
    sessionStorage.removeItem(STUDY_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear the stored study session:', error);
  }
}

export function readStoredStudySession(certificationId: string): PersistedStudySession | null {
  try {
    const raw = sessionStorage.getItem(STUDY_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isPersistedStudySession(parsed) && parsed.certificationId === certificationId) return parsed;
  } catch (error) {
    console.warn('Failed to restore study session from sessionStorage:', error);
  }
  clearStoredStudySession();
  return null;
}

export function persistStudySession(state: StudySessionState): void {
  if (!state.questionBank) return;
  try {
    const snapshot: PersistedStudySession = {
      certificationId: state.questionBank.certificationId,
      studyFilter: state.studyFilter,
      studySessionLimit: state.studySessionLimit,
      studySessionHistory: state.studySessionHistory,
      studySessionResults: state.studySessionResults,
      currentQuestionId: state.currentStudyQuestion?.id ?? null,
      studyPoolQuestionIds: state.studyPoolQuestionIds,
      showExplanation: state.showExplanation,
      selectedAnswer: state.selectedAnswer,
      isAnswerCorrect: state.isAnswerCorrect,
      questionStartTime: state.questionStartTime,
      isStudyExhausted: state.isStudyExhausted,
    };
    sessionStorage.setItem(STUDY_SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Failed to persist study session to sessionStorage:', error);
  }
}

export function isExamSession(value: unknown): value is ExamSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<ExamSession>;
  return (
    typeof session.id === 'string' &&
    typeof session.certificationId === 'string' &&
    Array.isArray(session.questions) &&
    typeof session.currentIndex === 'number' &&
    Number.isInteger(session.currentIndex) &&
    session.currentIndex >= 0 &&
    session.currentIndex < session.questions.length &&
    typeof session.answers === 'object' &&
    session.answers !== null &&
    Array.isArray(session.flagged) &&
    typeof session.startTime === 'number' &&
    typeof session.timeLimit === 'number' &&
    typeof session.isCompleted === 'boolean'
  );
}

export function restoreExamSession(certificationId: string): ExamSession | null {
  try {
    const stored = sessionStorage.getItem(EXAM_SESSION_STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (isExamSession(parsed) && !parsed.isCompleted && parsed.certificationId === certificationId) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to restore exam session from sessionStorage:', error);
  }
  clearStoredExamSession();
  return null;
}

export function clearStoredExamSession(): void {
  try {
    sessionStorage.removeItem(EXAM_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear the stored exam session:', error);
  }
}

export function persistExamSession(session: ExamSession | null): void {
  try {
    if (session && !session.isCompleted) {
      sessionStorage.setItem(EXAM_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      clearStoredExamSession();
    }
  } catch (error) {
    console.error('Failed to persist the exam session to sessionStorage:', error);
  }
}
