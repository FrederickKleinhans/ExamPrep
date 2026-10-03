import type { StateCreator } from 'zustand';
import type {
  CertificationManifest,
  Confidence,
  ExamResult,
  ExamSession,
  Question,
  QuestionBank,
  StudySessionResult,
  UserProgress,
} from '../types';

export interface DataSlice {
  manifest: CertificationManifest | null;
  questionBank: QuestionBank | null;
  progress: UserProgress;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  selectCertification: (certId: string) => Promise<void>;
  selectTrack: (trackId: string) => Promise<void>;
  refreshProgress: () => void;
  dismissError: () => void;
  retryLastLoad: () => Promise<void>;
  toggleBookmark: (questionId: string) => void;
}

export interface StudySlice {
  studySessionHistory: string[];
  studySessionResults: StudySessionResult[];
  studyPoolQuestionIds: string[] | null;
  currentStudyQuestion: Question | null;
  studyFilter: string;
  studyGroup: number;
  studySessionLimit: number;
  isStudyExhausted: boolean;
  showExplanation: boolean;
  selectedAnswer: string | string[] | null;
  isAnswerCorrect: boolean | null;
  questionStartTime: number;
  setStudyFilter: (filter: string) => Promise<void>;
  setStudySessionLimit: (limit: number) => void;
  rotateStudyGroup: () => void;
  getNextStudyQuestion: () => void;
  submitStudyAnswer: (answer: string | string[], confidence?: Confidence) => void;
  resetStudySession: () => void;
  retryMissedQuestions: () => Promise<void>;
}

export interface ExamSlice {
  examSession: ExamSession | null;
  hasActiveSession: () => boolean;
  startExam: (options?: { topicIds?: string[]; questionCount?: number }) => Promise<void>;
  submitExamAnswer: (questionId: string, answer: string | string[]) => void;
  toggleExamFlag: (questionId: string) => void;
  navigateExam: (index: number) => void;
  finishExam: () => ExamResult | null;
  clearExam: () => void;
}

export type Store = DataSlice & StudySlice & ExamSlice;
export type StoreSlice<T> = StateCreator<Store, [], [], T>;
