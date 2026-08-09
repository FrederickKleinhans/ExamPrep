import { Question, QuestionStat } from '../types';

function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class AdaptiveEngine {
  static selectNextQuestion(
    allQuestions: Question[],
    stats: Record<string, QuestionStat>,
    weakTopics: string[],
    sessionHistory: string[]
  ): Question | null {
    const pool = allQuestions.filter((q) => !sessionHistory.includes(q.id));
    if (pool.length === 0) return null;

    const scored = pool.map((q) => {
      let score = 0;
      const stat = stats[q.id];

      // Priority 1: Weak topic (highest weight)
      if (weakTopics.includes(q.topicId)) score += 100;

      // Priority 2: Never attempted
      if (!stat) score += 80;

      // Priority 3: Previously incorrect
      else if (stat.incorrect > stat.correct) score += 60;

      // Priority 4: Low confidence
      else if (stat.confidence === 'low') score += 40;

      // Priority 5: Last attempted long ago (> 7 days)
      else if (daysSince(stat.lastAttempted) > 7) score += 20;

      // Difficulty jitter: add small random to prevent repetition
      score += Math.random() * 10;

      return { question: q, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Return random from top 20% for variety
    const topTierSize = Math.max(1, Math.ceil(scored.length * 0.2));
    const topTier = scored.slice(0, topTierSize);
    return randomFrom(topTier).question;
  }

  static computeWeakTopics(
    questions: Question[],
    stats: Record<string, QuestionStat>
  ): string[] {
    const topicAccuracy: Record<string, { correct: number; total: number }> = {};

    for (const question of questions) {
      const stat = stats[question.id];
      if (!stat) continue;

      if (!topicAccuracy[question.topicId]) {
        topicAccuracy[question.topicId] = { correct: 0, total: 0 };
      }

      topicAccuracy[question.topicId].correct += stat.correct;
      topicAccuracy[question.topicId].total += stat.attempts;
    }

    // Sort topics by accuracy (lowest first), filter those below 60%
    const weakTopics = Object.entries(topicAccuracy)
      .map(([topicId, { correct, total }]) => ({
        topicId,
        accuracy: total > 0 ? correct / total : 0,
      }))
      .filter((t) => t.accuracy < 0.6)
      .sort((a, b) => a.accuracy - b.accuracy)
      .map((t) => t.topicId);

    return weakTopics;
  }

  static shuffleOptions<T>(options: T[]): T[] {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
