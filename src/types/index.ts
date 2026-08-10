// ============================================================
// CertReady — TypeScript Interfaces
// ============================================================

// --- Manifest Types ---

export interface CertificationManifest {
  certifications: Certification[];
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  examCode: string;
  version: string;
  questionCount: number;
  passingScore: number;
  timeLimitMinutes: number;
  topics: Topic[];
  icon?: string;
  resources?: CertResource[];
}

export interface CertResource {
  title: string;
  url: string;
}

export interface Topic {
  id: string;
  name: string;
  weight: number;
}

// --- Question Bank Types ---

export interface QuestionBank {
  certificationId: string;
  version: string;
  questions: Question[];
}

export type QuestionType =
  | "single-choice"
  | "multiple-choice"
  | "true-false"
  | "yes-no-statements"    // Microsoft hotspot: Yes/No per statement
  | "dropdown-select"       // Microsoft sentence completion with dropdown
  | "ordering"              // Arrange steps in correct sequence
  | "drag-drop"            // Drag items to correct categories
  | "matching"
  | "scenario";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  type: QuestionType;
  topicId: string;
  difficulty: Difficulty;
  points: number;
  questionText: string;
  scenarioText?: string;
  codeSnippet?: string;
  options: Option[];
  explanation: Explanation;
  metadata: QuestionMetadata;
  // For yes-no-statements type
  statements?: Statement[];
  // For dropdown-select type
  dropdowns?: DropdownQuestion[];
  // For ordering type
  orderItems?: OrderItem[];
  // For drag-drop type
  dragCategories?: DragCategory[];
  dragItems?: DragItem[];
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

// Yes/No Statements (Microsoft hotspot style)
// "For each statement, select Yes if true. Otherwise, select No."
export interface Statement {
  id: string;
  text: string;
  isCorrectYes: boolean; // true = correct answer is "Yes", false = correct answer is "No"
  explanation?: string;
}

// Dropdown Select (sentence completion)
// Fill in blanks within a sentence by choosing from dropdowns
export interface DropdownQuestion {
  id: string;
  prompt: string;         // Text with a blank or the label for this dropdown
  options: string[];      // Available choices
  correctAnswer: string;  // The correct choice
}

// Ordering (arrange in correct sequence)
export interface OrderItem {
  id: string;
  text: string;
  correctPosition: number; // 1-based position
}

// Drag and Drop categories
export interface DragCategory {
  id: string;
  name: string;
  acceptsItemIds: string[]; // which items belong here
}

export interface DragItem {
  id: string;
  text: string;
}

export interface Explanation {
  correct: string;
  incorrect: string;
  examTip: string;
  relatedTopics: string[];
}

export interface QuestionMetadata {
  examObjective: string;
  references: string[];
  lastUpdated: string;
}

// --- User Progress Types ---

export interface UserProgress {
  userId: string;
  selectedCertification: string;
  studyStreak: StudyStreak;
  questionStats: Record<string, QuestionStat>;
  examHistory: ExamResult[];
  weakTopics: string[];
  bookmarks: string[];
  studyGroupIndex?: Record<string, number>;
}

export interface StudyStreak {
  current: number;
  lastStudyDate: string;
  longest: number;
}

export type Confidence = "low" | "medium" | "high";

export interface QuestionStat {
  attempts: number;
  correct: number;
  incorrect: number;
  lastAttempted: string;
  averageTimeMs: number;
  confidence: Confidence;
  // Optional per-selection points accumulated across study attempts
  pointsEarned?: number;
  pointsTotal?: number;
}

export interface ExamResult {
  id: string;
  certificationId: string;
  date: string;
  score: number;
  passed: boolean;
  timeTakenMs: number;
  answers: Record<string, string | string[]>;
  flaggedQuestions: string[];
}

// --- Exam Session Types ---

export interface ExamSession {
  id: string;
  certificationId: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string | string[]>;
  flagged: string[];
  startTime: number;
  timeLimit: number;
  isCompleted: boolean;
}

// --- Study Session Types ---

export interface StudySession {
  certificationId: string;
  questionsAnswered: string[];
  currentQuestion: Question | null;
  showExplanation: boolean;
  selectedAnswer: string | string[] | null;
  isCorrect: boolean | null;
  startTime: number;
}

// --- Store Types ---

export interface AppState {
  // Data
  manifest: CertificationManifest | null;
  questionBank: QuestionBank | null;
  progress: UserProgress;
  
  // UI State
  selectedCertification: string | null;
  isLoading: boolean;
  error: string | null;
}

// --- Learn Content Types ---

export interface LearnContent {
  certificationId: string;
  version: string;
  topics: LearnTopic[];
}

export interface LearnTopic {
  id: string;
  name: string;
  sections: LearnSection[];
}

export interface LearnSection {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  examTips: string[];
}
