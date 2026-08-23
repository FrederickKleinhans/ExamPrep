import { Confidence, Question, QuestionStat, Sm2Schedule, Topic } from '../types';

// ── Quality score mapping ──────────────────────────────────────────────────
//
// Translates (isCorrect, confidence) into an SM-2 quality score 0–5.
//
//  5 — correct + high confidence    (strong recall)
//  4 — correct + medium confidence  (solid recall)
//  3 — correct + low confidence     (recalled but uncertain)
//  2 — incorrect + high confidence  (knew it was wrong — partial recall)
//  1 — incorrect + medium confidence
//  0 — incorrect + low confidence   (complete blank)

export function qualityScore(isCorrect: boolean, confidence: Confidence): number {
  if (isCorrect) {
    if (confidence === 'high') return 5;
    if (confidence === 'medium') return 4;
    return 3;
  } else {
    if (confidence === 'high') return 2;
    if (confidence === 'medium') return 1;
    return 0;
  }
}

// ── Due date helpers ───────────────────────────────────────────────────────

function todayStr(now: Date = new Date()): string {
  return now.toISOString().split('T')[0];
}

function isDue(schedule: Sm2Schedule | undefined, now: Date = new Date()): boolean {
  if (!schedule) return false;
  return schedule.dueDate <= todayStr(now);
}

// ── Selection priority tiers ───────────────────────────────────────────────
//
// Priority (highest first):
//   1. Due questions  — SM-2 scheduled review date has arrived
//   2. Weak + unseen  — topic is weak and question never attempted
//   3. Weak + seen    — topic is weak and question has been attempted
//   4. Unseen         — never attempted, topic not weak
//   5. General        — everything else (lowest priority)
//
// Within each tier, a score based on SM-2 ease factor, accuracy and
// recency breaks ties. A small random jitter prevents deterministic
// repetition at the top of the tier.

type ScoredQuestion = { question: Question; priority: number; score: number };

function priorityTier(
  _question: Question,
  stat: QuestionStat | undefined,
  sm2: Sm2Schedule | undefined,
  isWeakTopic: boolean,
  now: Date,
): number {
  if (isDue(sm2, now)) return 1;
  if (isWeakTopic && !stat) return 2;
  if (isWeakTopic && stat) return 3;
  if (!stat) return 4;
  return 5;
}

function withinTierScore(
  stat: QuestionStat | undefined,
  sm2: Sm2Schedule | undefined,
  topicWeight: number,
): number {
  let score = 0;

  // Higher topic weight → higher priority within tier
  score += topicWeight * 0.5;

  if (!stat) {
    // Never attempted — moderate base score
    score += 50;
  } else {
    // Accuracy-based score: lower accuracy → higher urgency
    const accuracy = stat.attempts > 0 ? stat.correct / stat.attempts : 0;
    score += (1 - accuracy) * 40;

    // Ease factor: lower ease (harder for learner) → higher priority
    if (sm2) score += (2.5 - sm2.easeFactor) * 10;

    // Recency: longer since last review → higher priority
    if (stat.lastAttempted) {
      const daysSince = Math.floor(
        (Date.now() - new Date(stat.lastAttempted).getTime()) / 86_400_000,
      );
      score += Math.min(daysSince, 30); // cap at 30 days
    }
  }

  return score;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── AdaptiveEngine ─────────────────────────────────────────────────────────

export class AdaptiveEngine {
  /**
   * Selects the next question for a study session.
   *
   * @param allQuestions    Questions available in the current filter/topic
   * @param stats           Per-question attempt statistics
   * @param sm2Map          Per-question SM-2 schedules
   * @param weakTopics      Topic IDs identified as weak (accuracy < 60%)
   * @param sessionHistory  Question IDs already answered this session
   * @param topics          Topic definitions (for weight lookup)
   * @param now             Optional date override for deterministic testing
   */
  static selectNextQuestion(
    allQuestions: Question[],
    stats: Record<string, QuestionStat>,
    sm2Map: Record<string, Sm2Schedule>,
    weakTopics: string[],
    sessionHistory: string[],
    topics: Topic[] = [],
    now: Date = new Date(),
  ): Question | null {
    const pool = allQuestions.filter((q) => !sessionHistory.includes(q.id));
    if (pool.length === 0) return null;

    const topicWeightMap = new Map(topics.map((t) => [t.id, t.weight]));

    const scored: ScoredQuestion[] = pool.map((q) => {
      const stat = stats[q.id];
      const sm2 = sm2Map[q.id];
      const isWeak = weakTopics.includes(q.topicId);
      const topicWeight = topicWeightMap.get(q.topicId) ?? 10;

      const priority = priorityTier(q, stat, sm2, isWeak, now);
      const score = withinTierScore(stat, sm2, topicWeight) + Math.random() * 5;

      return { question: q, priority, score };
    });

    // Sort: lowest priority number first, then highest score
    scored.sort((a, b) =>
      a.priority !== b.priority ? a.priority - b.priority : b.score - a.score,
    );

    // Pick randomly from the top tier to avoid always returning the same question
    const topPriority = scored[0].priority;
    const topTier = scored.filter((s) => s.priority === topPriority);
    const topTierSize = Math.max(1, Math.ceil(topTier.length * 0.25));
    return randomFrom(topTier.slice(0, topTierSize)).question;
  }

  /**
   * Computes weak topics by accuracy across all attempted questions.
   * Topics below 60% accuracy are returned sorted worst-first.
   */
  static computeWeakTopics(
    questions: Question[],
    stats: Record<string, QuestionStat>,
  ): string[] {
    const topicAccuracy: Record<string, { earned: number; total: number }> = {};

    for (const question of questions) {
      const stat = stats[question.id];
      if (!stat) continue;

      if (!topicAccuracy[question.topicId]) {
        topicAccuracy[question.topicId] = { earned: 0, total: 0 };
      }

      const earned = stat.pointsEarned ?? stat.correct;
      const total = stat.pointsTotal ?? stat.attempts;

      topicAccuracy[question.topicId].earned += earned;
      topicAccuracy[question.topicId].total += total;
    }

    return Object.entries(topicAccuracy)
      .map(([topicId, { earned, total }]) => ({
        topicId,
        accuracy: total > 0 ? earned / total : 0,
      }))
      .filter((t) => t.accuracy < 0.6)
      .sort((a, b) => a.accuracy - b.accuracy)
      .map((t) => t.topicId);
  }

  /**
   * Returns all due questions for a certification (for a "review due" mode).
   */
  static getDueQuestions(
    questions: Question[],
    sm2Map: Record<string, Sm2Schedule>,
    now: Date = new Date(),
  ): Question[] {
    return questions.filter((q) => isDue(sm2Map[q.id], now));
  }

  /**
   * Returns a human-readable explanation of why a question was selected.
   * Used to surface "why this question?" context in the UI if needed.
   */
  static selectionReason(
    question: Question,
    stats: Record<string, QuestionStat>,
    sm2Map: Record<string, Sm2Schedule>,
    weakTopics: string[],
    now: Date = new Date(),
  ): string {
    const stat = stats[question.id];
    const sm2 = sm2Map[question.id];
    const isWeak = weakTopics.includes(question.topicId);

    if (isDue(sm2, now)) return 'Scheduled for review today';
    if (isWeak && !stat) return 'New question in a weak topic';
    if (isWeak && stat) return 'Weak topic — needs more practice';
    if (!stat) return 'New question — never attempted';
    if (stat.incorrect > stat.correct) return 'Previously answered incorrectly';
    if (stat.confidence === 'low') return 'Low confidence — keep practising';
    return 'General practice';
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
