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
  topicChunks?: TopicChunk[];
  // Enriched from catalog at compile time
  vendor?: string;
  vendorColor?: string;
  level?: CertLevel;
  accessTier?: AccessTier;
  description?: string;
  examDetails?: {
    durationMinutes: number;
    questionCount: number;
    passingScore: number;
    priceUSD: number;
  };
}

export interface TopicChunk {
  topicId: string;
  path: string;
  questionCount: number;
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

export interface QuestionChunk {
  certificationId: string;
  topicId: string;
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
  reviewStatus?: 'draft' | 'peer-reviewed' | 'approved';
  reviewer?: string;
  reviewedAt?: string;
  author?: string;
}

// --- User Progress Types ---

export interface UserProgress {
  version: 2;
  userId: string;
  selectedCertification: string;
  selectedTrackId?: string;
  /** Product-wide study streak across all certifications. */
  studyStreak: StudyStreak;
  certifications: Record<string, CertificationProgress>;
}

export interface CertificationProgress {
  questionStats: Record<string, QuestionStat>;
  examHistory: ExamResult[];
  weakTopics: string[];
  bookmarks: string[];
  studyGroupIndex: number;
  /** Study streak for this certification only. */
  studyStreak: StudyStreak;
  /** SM-2 schedule per question. Keyed by question ID. */
  sm2: Record<string, Sm2Schedule>;
}

// --- SM-2 Scheduling ---

/**
 * Spaced repetition schedule for a single question.
 *
 * Fields follow the SM-2 algorithm:
 * - repetitions: how many times answered correctly in a row
 * - easeFactor: multiplier controlling interval growth (min 1.3, starts at 2.5)
 * - intervalDays: how many days until the next review
 * - dueDate: ISO date string for next scheduled review
 * - lastReviewed: ISO date string of last answer
 */
export interface Sm2Schedule {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  dueDate: string;
  lastReviewed: string;
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

export interface StudySessionResult {
  questionId: string;
  isCorrect: boolean;
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

// --- Career Track Types ---

export type AccessTier = 'free' | 'premium';
export type CertLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CatalogCert {
  id: string;
  code: string;
  name: string;
  vendor: string;
  vendorColor: string;
  level: CertLevel;
  accessTier: AccessTier;
  description: string;
  examDetails: {
    durationMinutes: number;
    questionCount: number;
    passingScore: number;
    priceUSD: number;
  };
  domains: { id: string; label: string; weight: number }[];
  prerequisites: string[];
  nextSteps: string[];
  domain: string;
}

export interface TrackCertEntry {
  certId: string;
  required: boolean;
  note?: string;
  prerequisites?: string[];
}

export interface TrackLevel {
  stage: string;
  label: string;
  description: string;
  certs: TrackCertEntry[];
}

export interface CareerTrack {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  levels: TrackLevel[];
  crossTrackCerts: string[];
  estimatedHoursToComplete: number;
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
