import {
  CertificationProgress,
  Confidence,
  ExamResult,
  QuestionStat,
  Sm2Schedule,
  StudyStreak,
  UserProgress,
} from '../types';
import { pushProgress } from './SyncService';

// ── Sync helpers ───────────────────────────────────────────────────────────

/**
 * The authenticated user ID set after sign-in.
 * When null, sync is skipped (guest mode).
 */
let _syncUserId: string | null = null;

/** Called by useAuth when a session is established or cleared. */
export function setSyncUserId(userId: string | null): void {
  _syncUserId = userId;
}

/** Saves to localStorage and fires a background push to Supabase if signed in. */
function saveAndSync(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress to localStorage:', error);
  }
  if (_syncUserId) {
    // Fire-and-forget — UI never waits for this
    void pushProgress(_syncUserId, progress);
  }
}

const STORAGE_KEY = 'certready_progress';
const LEGACY_BACKUP_KEY = 'certready_progress_v1_backup';

// ── SM-2 algorithm ─────────────────────────────────────────────────────────
const SM2_MIN_EASE = 1.3;
const SM2_INITIAL_EASE = 2.5;

/**
 * Pure SM-2 implementation. Returns the next schedule given the current
 * schedule (or null for a first-time answer) and a quality score 0–5.
 *
 * Quality mapping (use AdaptiveEngine.qualityScore to produce this):
 *   5 — correct, high confidence
 *   4 — correct, medium confidence
 *   3 — correct, low confidence
 *   2 — incorrect, high confidence  (knew it was wrong, shows partial recall)
 *   1 — incorrect, medium confidence
 *   0 — incorrect, low confidence   (complete blank)
 *
 * Intervals: first correct → 1 day, second correct → 6 days,
 * subsequent → previous * easeFactor (rounded).
 */
export function computeNextSm2(
  current: Sm2Schedule | null,
  quality: number,
  now: Date = new Date(),
): Sm2Schedule {
  const todayStr = now.toISOString().split('T')[0];

  if (quality < 3) {
    // Incorrect answer — reset repetitions, shrink ease factor slightly
    const easeFactor = current
      ? Math.max(SM2_MIN_EASE, current.easeFactor - 0.2)
      : SM2_INITIAL_EASE;
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 1);
    return {
      repetitions: 0,
      easeFactor,
      intervalDays: 1,
      dueDate: dueDate.toISOString().split('T')[0],
      lastReviewed: todayStr,
    };
  }

  // Correct answer — advance the schedule
  const easeFactor = Math.max(
    SM2_MIN_EASE,
    (current?.easeFactor ?? SM2_INITIAL_EASE) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  const repetitions = (current?.repetitions ?? 0) + 1;
  let intervalDays: number;

  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round((current?.intervalDays ?? 6) * easeFactor);
  }

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return {
    repetitions,
    easeFactor,
    intervalDays,
    dueDate: dueDate.toISOString().split('T')[0],
    lastReviewed: todayStr,
  };
}

type LegacyProgress = Omit<UserProgress, 'version' | 'certifications'> & {
  questionStats?: Record<string, QuestionStat>;
  examHistory?: ExamResult[];
  weakTopics?: string[];
  bookmarks?: string[];
  studyGroupIndex?: Record<string, number>;
};

function generateUserId(): string {
  return `user_${crypto.randomUUID()}`;
}

function createStreak(): StudyStreak {
  return { current: 0, lastStudyDate: '', longest: 0 };
}

function createCertificationProgress(): CertificationProgress {
  return {
    questionStats: {},
    examHistory: [],
    weakTopics: [],
    bookmarks: [],
    studyGroupIndex: 0,
    studyStreak: createStreak(),
    sm2: {},
  };
}

function getDefaultProgress(): UserProgress {
  return {
    version: 2,
    userId: generateUserId(),
    selectedCertification: '',
    studyStreak: createStreak(),
    certifications: {},
  };
}

function isV2Progress(value: unknown): value is UserProgress {
  if (!value || typeof value !== 'object') return false;
  const progress = value as Partial<UserProgress>;
  return progress.version === 2 && typeof progress.userId === 'string' &&
    typeof progress.selectedCertification === 'string' &&
    typeof progress.certifications === 'object' && progress.certifications !== null &&
    Object.values(progress.certifications).every((certification) => {
      if (!certification || typeof certification !== 'object') return false;
      const value = certification as Partial<CertificationProgress>;
      return typeof value.questionStats === 'object' && value.questionStats !== null &&
        Array.isArray(value.examHistory) && Array.isArray(value.weakTopics) &&
        Array.isArray(value.bookmarks) && typeof value.studyGroupIndex === 'number' &&
        typeof value.studyStreak === 'object' && value.studyStreak !== null;
    });
}

function isLegacyProgress(value: unknown): value is LegacyProgress {
  if (!value || typeof value !== 'object') return false;
  const progress = value as Partial<LegacyProgress>;
  return typeof progress.userId === 'string' && typeof progress.selectedCertification === 'string' &&
    typeof progress.studyStreak === 'object' && progress.studyStreak !== null &&
    typeof progress.questionStats === 'object' && progress.questionStats !== null &&
    Array.isArray(progress.examHistory) && Array.isArray(progress.weakTopics) &&
    Array.isArray(progress.bookmarks);
}

function migrateLegacyProgress(legacy: LegacyProgress): UserProgress {
  const certificationId = legacy.selectedCertification || 'az-900';
  const legacyStreak = legacy.studyStreak ?? createStreak();

  return {
    version: 2,
    userId: legacy.userId || generateUserId(),
    selectedCertification: certificationId,
    studyStreak: legacyStreak,
    certifications: {
      [certificationId]: {
        questionStats: legacy.questionStats ?? {},
        examHistory: legacy.examHistory ?? [],
        weakTopics: legacy.weakTopics ?? [],
        bookmarks: legacy.bookmarks ?? [],
        studyGroupIndex: legacy.studyGroupIndex?.[certificationId] ?? 0,
        studyStreak: legacyStreak,
        sm2: {},
      },
    },
  };
}

function updateStreak(streak: StudyStreak): void {
  const today = new Date().toISOString().split('T')[0];
  if (streak.lastStudyDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  streak.current = streak.lastStudyDate === yesterday ? streak.current + 1 : 1;
  streak.lastStudyDate = today;
  streak.longest = Math.max(streak.longest, streak.current);
}

export class ProgressService {
  static getProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isV2Progress(parsed)) return parsed;
        if (isLegacyProgress(parsed)) {
          localStorage.setItem(LEGACY_BACKUP_KEY, stored);
          const migrated = migrateLegacyProgress(parsed);
          this.saveProgress(migrated);
          return migrated;
        }
        throw new Error('Stored progress has an unsupported format');
      }
    } catch (error) {
      console.error('Failed to load progress from localStorage:', error);
    }

    const progress = getDefaultProgress();
    this.saveProgress(progress);
    return progress;
  }

  static saveProgress(progress: UserProgress): void {
    saveAndSync(progress);
  }

  static getCertificationProgress(progress: UserProgress, certificationId: string): CertificationProgress {
    return progress.certifications[certificationId] ?? createCertificationProgress();
  }

  private static ensureCertificationProgress(progress: UserProgress, certificationId: string): CertificationProgress {
    if (!progress.certifications[certificationId]) {
      progress.certifications[certificationId] = createCertificationProgress();
    }
    return progress.certifications[certificationId];
  }

  static updateSelectedCertification(certificationId: string): void {
    const progress = this.getProgress();
    progress.selectedCertification = certificationId;
    this.ensureCertificationProgress(progress, certificationId);
    this.saveProgress(progress);
  }

  static updateSelectedTrack(trackId: string, firstCertId?: string): void {
    const progress = this.getProgress();
    progress.selectedTrackId = trackId;
    if (firstCertId) {
      progress.selectedCertification = firstCertId;
      this.ensureCertificationProgress(progress, firstCertId);
    }
    this.saveProgress(progress);
  }

  static recordAnswer(
    certificationId: string,
    questionId: string,
    isCorrect: boolean,
    timeMs: number,
    confidence: Confidence = 'medium',
  ): void {
    this.recordAnswerPoints(certificationId, questionId, isCorrect ? 1 : 0, 1, timeMs, confidence);
  }

  static recordAnswerPoints(
    certificationId: string,
    questionId: string,
    earned: number,
    total: number,
    timeMs: number,
    confidence: Confidence = 'medium',
  ): void {
    const progress = this.getProgress();
    const certification = this.ensureCertificationProgress(progress, certificationId);
    const existing = certification.questionStats[questionId] as (QuestionStat & { pointsEarned?: number; pointsTotal?: number }) | undefined;

    if (existing) {
      existing.attempts += 1;
      if (earned >= total) existing.correct += 1;
      else existing.incorrect += 1;
      existing.lastAttempted = new Date().toISOString();
      existing.averageTimeMs = Math.round((existing.averageTimeMs * (existing.attempts - 1) + timeMs) / existing.attempts);
      existing.confidence = confidence;
      existing.pointsEarned = (existing.pointsEarned || 0) + earned;
      existing.pointsTotal = (existing.pointsTotal || 0) + total;
    } else {
      certification.questionStats[questionId] = {
        attempts: 1,
        correct: earned >= total ? 1 : 0,
        incorrect: earned >= total ? 0 : 1,
        lastAttempted: new Date().toISOString(),
        averageTimeMs: timeMs,
        confidence,
        pointsEarned: earned,
        pointsTotal: total,
      };
    }

    updateStreak(progress.studyStreak);
    updateStreak(certification.studyStreak);
    this.saveProgress(progress);
  }

  /**
   * Returns the SM-2 schedule for a question, or null if never scheduled.
   */
  static getSm2Schedule(certificationId: string, questionId: string): Sm2Schedule | null {
    const cert = this.getCertificationProgress(this.getProgress(), certificationId);
    return cert.sm2?.[questionId] ?? null;
  }

  /**
   * Computes and persists an updated SM-2 schedule after a study answer.
   *
   * @param certificationId
   * @param questionId
   * @param quality  0–5 SM-2 quality score (see AdaptiveEngine.qualityScore)
   * @param now      Optional date override for deterministic testing
   */
  static updateSm2(
    certificationId: string,
    questionId: string,
    quality: number,
    now: Date = new Date(),
  ): void {
    const progress = this.getProgress();
    const cert = this.ensureCertificationProgress(progress, certificationId);
    if (!cert.sm2) cert.sm2 = {};

    const existing = cert.sm2[questionId];
    const updated = computeNextSm2(existing ?? null, quality, now);
    cert.sm2[questionId] = updated;
    this.saveProgress(progress);
  }

  static saveExamResult(result: ExamResult): void {
    const progress = this.getProgress();
    this.ensureCertificationProgress(progress, result.certificationId).examHistory.push(result);
    this.saveProgress(progress);
  }

  static toggleBookmark(certificationId: string, questionId: string): void {
    const progress = this.getProgress();
    const bookmarks = this.ensureCertificationProgress(progress, certificationId).bookmarks;
    const index = bookmarks.indexOf(questionId);
    if (index >= 0) bookmarks.splice(index, 1);
    else bookmarks.push(questionId);
    this.saveProgress(progress);
  }

  static getStudyGroupIndex(certificationId: string): number {
    return this.getCertificationProgress(this.getProgress(), certificationId).studyGroupIndex;
  }

  static incrementStudyGroupIndex(certificationId: string): number {
    const progress = this.getProgress();
    const certification = this.ensureCertificationProgress(progress, certificationId);
    certification.studyGroupIndex = (certification.studyGroupIndex + 1) % 3;
    this.saveProgress(progress);
    return certification.studyGroupIndex;
  }

  static isBookmarked(certificationId: string, questionId: string): boolean {
    return this.getCertificationProgress(this.getProgress(), certificationId).bookmarks.includes(questionId);
  }

  static resetProgress(): void {
    this.saveProgress(getDefaultProgress());
  }

  static exportProgress(): string {
    return localStorage.getItem(STORAGE_KEY) || JSON.stringify(getDefaultProgress());
  }

  static importProgress(json: string): boolean {
    try {
      const parsed: unknown = JSON.parse(json);
      const progress = isV2Progress(parsed) ? parsed : isLegacyProgress(parsed)
        ? migrateLegacyProgress(parsed)
        : null;
      if (!progress) return false;
      this.saveProgress(progress);
      return true;
    } catch {
      return false;
    }
  }
}
