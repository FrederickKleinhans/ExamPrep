import { UserProgress, QuestionStat, ExamResult, Confidence } from '../types';

const STORAGE_KEY = 'certready_progress';

function generateUserId(): string {
  return 'user_' + crypto.randomUUID();
}

function getDefaultProgress(): UserProgress {
  return {
    userId: generateUserId(),
    selectedCertification: 'az-900',
    studyStreak: {
      current: 0,
      lastStudyDate: '',
      longest: 0,
    },
    questionStats: {},
    examHistory: [],
    weakTopics: [],
    bookmarks: [],
    studyGroupIndex: {},
  };
}

export class ProgressService {
  static getProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage:', e);
    }
    const defaultProgress = getDefaultProgress();
    this.saveProgress(defaultProgress);
    return defaultProgress;
  }

  static saveProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage:', e);
    }
  }

  static updateSelectedCertification(certId: string): void {
    const progress = this.getProgress();
    progress.selectedCertification = certId;
    this.saveProgress(progress);
  }

  static recordAnswer(
    questionId: string,
    isCorrect: boolean,
    timeMs: number,
    confidence: Confidence = 'medium'
  ): void {
    // Backwards-compatible wrapper that records a 1/1 point for boolean correctness
    const earned = isCorrect ? 1 : 0;
    this.recordAnswerPoints(questionId, earned, 1, timeMs, confidence);
  }

  /**
   * Record an answer using earned/total points (supports partial credit).
   */
  static recordAnswerPoints(
    questionId: string,
    earned: number,
    total: number,
    timeMs: number,
    confidence: Confidence = 'medium'
  ): void {
    const progress = this.getProgress();
    const existing = progress.questionStats[questionId] as (QuestionStat & { pointsEarned?: number; pointsTotal?: number }) | undefined;

    if (existing) {
      existing.attempts += 1;
      if (earned >= total) {
        existing.correct += 1;
      } else {
        existing.incorrect += 1;
      }
      existing.lastAttempted = new Date().toISOString();
      existing.averageTimeMs = Math.round(
        (existing.averageTimeMs * (existing.attempts - 1) + timeMs) / existing.attempts
      );
      existing.confidence = confidence;

      existing.pointsEarned = (existing.pointsEarned || 0) + earned;
      existing.pointsTotal = (existing.pointsTotal || 0) + total;
    } else {
      const stat: QuestionStat & { pointsEarned?: number; pointsTotal?: number } = {
        attempts: 1,
        correct: earned >= total ? 1 : 0,
        incorrect: earned >= total ? 0 : 1,
        lastAttempted: new Date().toISOString(),
        averageTimeMs: timeMs,
        confidence,
      };
      stat.pointsEarned = earned;
      stat.pointsTotal = total;
      progress.questionStats[questionId] = stat as QuestionStat;
    }

    this.updateStreak(progress);
    this.saveProgress(progress);
  }

  static updateStreak(progress: UserProgress): void {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = progress.studyStreak.lastStudyDate;

    if (lastDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastDate === yesterday) {
      progress.studyStreak.current += 1;
    } else if (lastDate !== today) {
      progress.studyStreak.current = 1;
    }

    progress.studyStreak.lastStudyDate = today;
    progress.studyStreak.longest = Math.max(
      progress.studyStreak.longest,
      progress.studyStreak.current
    );
  }

  static saveExamResult(result: ExamResult): void {
    const progress = this.getProgress();
    progress.examHistory.push(result);
    this.saveProgress(progress);
  }

  static toggleBookmark(questionId: string): void {
    const progress = this.getProgress();
    const index = progress.bookmarks.indexOf(questionId);
    if (index >= 0) {
      progress.bookmarks.splice(index, 1);
    } else {
      progress.bookmarks.push(questionId);
    }
    this.saveProgress(progress);
  }

  static getStudyGroupIndex(certId: string): number {
    const progress = this.getProgress();
    if (!progress.studyGroupIndex) progress.studyGroupIndex = {};
    const idx = progress.studyGroupIndex[certId];
    return typeof idx === 'number' ? idx : 0;
  }

  static incrementStudyGroupIndex(certId: string): number {
    const progress = this.getProgress();
    if (!progress.studyGroupIndex) progress.studyGroupIndex = {};
    const current = typeof progress.studyGroupIndex[certId] === 'number' ? progress.studyGroupIndex[certId] : 0;
    const next = (current + 1) % 3;
    progress.studyGroupIndex[certId] = next;
    this.saveProgress(progress);
    return next;
  }

  static isBookmarked(questionId: string): boolean {
    const progress = this.getProgress();
    return progress.bookmarks.includes(questionId);
  }

  static getWeakTopics(certTopicIds: string[]): string[] {
    const progress = this.getProgress();
    const topicAccuracy: Record<string, { correct: number; total: number }> = {};

    for (const [, stat] of Object.entries(progress.questionStats)) {
      // We'll compute weak topics based on stats later via AnalyticsService
      // For now just return stored weak topics
      void stat;
    }

    // Return stored weak topics or compute from stats
    if (progress.weakTopics.length > 0) return progress.weakTopics;

    return certTopicIds.filter((topicId) => {
      const acc = topicAccuracy[topicId];
      if (!acc || acc.total === 0) return true; // Never attempted = weak
      return acc.correct / acc.total < 0.6;
    });
  }

  static resetProgress(): void {
    const defaultProgress = getDefaultProgress();
    this.saveProgress(defaultProgress);
  }

  static exportProgress(): string {
    return localStorage.getItem(STORAGE_KEY) || '{}';
  }

  static importProgress(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.userId && data.questionStats) {
        this.saveProgress(data as UserProgress);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
