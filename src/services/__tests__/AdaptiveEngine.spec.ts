// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { AdaptiveEngine, qualityScore } from '../AdaptiveEngine';
import { computeNextSm2 } from '../ProgressService';
import type { Question, QuestionStat, Sm2Schedule, Topic } from '../../types';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeDate(daysFromNow: number, base: Date = NOW): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

const NOW = new Date('2024-06-01T12:00:00Z');

function makeQuestion(id: string, topicId = 'topic-a'): Question {
  return {
    id,
    type: 'single-choice',
    topicId,
    difficulty: 'medium',
    points: 1,
    questionText: `Question ${id}`,
    options: [
      { id: 'A', text: 'Right', isCorrect: true },
      { id: 'B', text: 'Wrong', isCorrect: false },
    ],
    explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
    metadata: { examObjective: '', references: ['https://example.com'], lastUpdated: '2024-01-01' },
  };
}

function makeStat(correct: number, attempts: number, lastAttempted = '2024-05-01'): QuestionStat {
  return {
    attempts,
    correct,
    incorrect: attempts - correct,
    lastAttempted,
    averageTimeMs: 5000,
    confidence: 'medium',
  };
}

function makeSchedule(
  dueDate: string,
  repetitions = 1,
  easeFactor = 2.5,
  intervalDays = 1,
): Sm2Schedule {
  return { repetitions, easeFactor, intervalDays, dueDate, lastReviewed: '2024-05-31' };
}

const topics: Topic[] = [
  { id: 'topic-a', name: 'Topic A', weight: 60 },
  { id: 'topic-b', name: 'Topic B', weight: 40 },
];

// ── qualityScore ───────────────────────────────────────────────────────────

describe('qualityScore', () => {
  it('returns 5 for correct + high confidence', () => {
    expect(qualityScore(true, 'high')).toBe(5);
  });
  it('returns 4 for correct + medium confidence', () => {
    expect(qualityScore(true, 'medium')).toBe(4);
  });
  it('returns 3 for correct + low confidence', () => {
    expect(qualityScore(true, 'low')).toBe(3);
  });
  it('returns 2 for incorrect + high confidence', () => {
    expect(qualityScore(false, 'high')).toBe(2);
  });
  it('returns 1 for incorrect + medium confidence', () => {
    expect(qualityScore(false, 'medium')).toBe(1);
  });
  it('returns 0 for incorrect + low confidence', () => {
    expect(qualityScore(false, 'low')).toBe(0);
  });
});

// ── computeNextSm2 ─────────────────────────────────────────────────────────

describe('computeNextSm2 — first answer', () => {
  it('incorrect answer sets interval to 1 day and repetitions to 0', () => {
    const result = computeNextSm2(null, 0, NOW);
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.dueDate).toBe(dateStr(makeDate(1)));
    expect(result.lastReviewed).toBe(dateStr(NOW));
  });

  it('correct answer on first repetition sets interval to 1 day', () => {
    const result = computeNextSm2(null, 4, NOW);
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.dueDate).toBe(dateStr(makeDate(1)));
  });
});

describe('computeNextSm2 — second correct answer', () => {
  it('sets interval to 6 days on second repetition', () => {
    const first = computeNextSm2(null, 4, NOW);
    const second = computeNextSm2(first, 4, makeDate(1));
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
    expect(second.dueDate).toBe(dateStr(makeDate(7))); // 1 day later + 6 day interval
  });
});

describe('computeNextSm2 — subsequent correct answers', () => {
  it('interval grows beyond 6 days on third repetition', () => {
    const first  = computeNextSm2(null, 5, NOW);
    const second = computeNextSm2(first, 5, makeDate(1));
    const third  = computeNextSm2(second, 5, makeDate(7));
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBeGreaterThan(6);
  });

  it('ease factor increases with high quality answers', () => {
    const first  = computeNextSm2(null, 5, NOW);
    const second = computeNextSm2(first, 5, makeDate(1));
    expect(second.easeFactor).toBeGreaterThan(2.5);
  });

  it('ease factor decreases after low quality answer', () => {
    const first = computeNextSm2(null, 5, NOW);
    const second = computeNextSm2(first, 5, makeDate(1));
    const third  = computeNextSm2(second, 3, makeDate(7)); // low quality
    expect(third.easeFactor).toBeLessThan(second.easeFactor);
  });
});

describe('computeNextSm2 — incorrect after progress', () => {
  it('resets repetitions to 0 and interval to 1', () => {
    const first  = computeNextSm2(null, 5, NOW);
    const second = computeNextSm2(first, 5, makeDate(1));
    const reset  = computeNextSm2(second, 1, makeDate(7)); // incorrect
    expect(reset.repetitions).toBe(0);
    expect(reset.intervalDays).toBe(1);
  });

  it('reduces ease factor but keeps it above minimum 1.3', () => {
    // Run many incorrect answers — ease factor should floor at 1.3
    let schedule = computeNextSm2(null, 0, NOW);
    for (let i = 0; i < 20; i++) {
      schedule = computeNextSm2(schedule, 0, makeDate(i));
    }
    expect(schedule.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

// ── AdaptiveEngine.selectNextQuestion — priority ordering ──────────────────

describe('AdaptiveEngine.selectNextQuestion — priority tiers', () => {
  const q1 = makeQuestion('q1', 'topic-a'); // due today
  const q2 = makeQuestion('q2', 'topic-a'); // weak topic, never attempted
  const q3 = makeQuestion('q3', 'topic-a'); // weak topic, attempted
  const q4 = makeQuestion('q4', 'topic-b'); // unseen, not weak
  const q5 = makeQuestion('q5', 'topic-b'); // seen, not weak
  const questions = [q1, q2, q3, q4, q5];

  const stats: Record<string, QuestionStat> = {
    'q3': makeStat(1, 3),  // weak topic, seen (33% accuracy)
    'q5': makeStat(3, 4),  // not weak, seen (75% accuracy)
  };

  const sm2Map: Record<string, Sm2Schedule> = {
    'q1': makeSchedule(dateStr(NOW)),        // due today
    'q3': makeSchedule(dateStr(makeDate(5))), // not due
    'q5': makeSchedule(dateStr(makeDate(3))), // not due
  };

  // topic-a has 33% accuracy (q3 only stat) → weak
  const weakTopics = ['topic-a'];

  it('selects the due question (q1) over all others', () => {
    // Run multiple times due to random jitter
    const results = new Set(
      Array.from({ length: 30 }, () =>
        AdaptiveEngine.selectNextQuestion(questions, stats, sm2Map, weakTopics, [], topics, NOW)?.id
      )
    );
    // q1 should appear — may not be every time due to top-tier sampling,
    // but must appear at least once
    expect(results.has('q1')).toBe(true);
    // q5 (lowest priority) should never win when due/weak questions exist
    expect(results.has('q5')).toBe(false);
  });

  it('never selects a question already in session history', () => {
    const history = ['q1', 'q2', 'q3'];
    for (let i = 0; i < 20; i++) {
      const result = AdaptiveEngine.selectNextQuestion(
        questions, stats, sm2Map, weakTopics, history, topics, NOW,
      );
      expect(result).not.toBeNull();
      expect(history).not.toContain(result!.id);
    }
  });

  it('returns null when all questions are in session history', () => {
    const history = questions.map((q) => q.id);
    const result = AdaptiveEngine.selectNextQuestion(
      questions, stats, sm2Map, weakTopics, history, topics, NOW,
    );
    expect(result).toBeNull();
  });
});

// ── AdaptiveEngine.getDueQuestions ─────────────────────────────────────────

describe('AdaptiveEngine.getDueQuestions', () => {
  const questions = [
    makeQuestion('q1'),
    makeQuestion('q2'),
    makeQuestion('q3'),
  ];

  it('returns only questions whose due date is today or in the past', () => {
    const sm2Map: Record<string, Sm2Schedule> = {
      'q1': makeSchedule(dateStr(NOW)),            // due today ✓
      'q2': makeSchedule(dateStr(makeDate(-1))),   // overdue ✓
      'q3': makeSchedule(dateStr(makeDate(3))),    // future ✗
    };
    const due = AdaptiveEngine.getDueQuestions(questions, sm2Map, NOW);
    expect(due.map((q) => q.id).sort()).toEqual(['q1', 'q2']);
  });

  it('returns empty array when nothing is due', () => {
    const sm2Map: Record<string, Sm2Schedule> = {
      'q1': makeSchedule(dateStr(makeDate(5))),
      'q2': makeSchedule(dateStr(makeDate(10))),
    };
    const due = AdaptiveEngine.getDueQuestions(questions, sm2Map, NOW);
    expect(due).toHaveLength(0);
  });

  it('returns empty array when sm2Map is empty', () => {
    const due = AdaptiveEngine.getDueQuestions(questions, {}, NOW);
    expect(due).toHaveLength(0);
  });
});

// ── AdaptiveEngine.computeWeakTopics ──────────────────────────────────────

describe('AdaptiveEngine.computeWeakTopics', () => {
  const questions = [
    makeQuestion('q1', 'topic-a'),
    makeQuestion('q2', 'topic-a'),
    makeQuestion('q3', 'topic-b'),
    makeQuestion('q4', 'topic-b'),
  ];

  it('identifies topics below 60% accuracy as weak', () => {
    const stats: Record<string, QuestionStat> = {
      'q1': makeStat(1, 3), // topic-a: 1/3 = 33%
      'q2': makeStat(0, 2), // topic-a: 0/2
      'q3': makeStat(3, 4), // topic-b: 3/4 = 75%
      'q4': makeStat(2, 2), // topic-b: 2/2 = 100%
    };
    const weak = AdaptiveEngine.computeWeakTopics(questions, stats);
    expect(weak).toContain('topic-a');
    expect(weak).not.toContain('topic-b');
  });

  it('returns empty array when no questions have been attempted', () => {
    const weak = AdaptiveEngine.computeWeakTopics(questions, {});
    expect(weak).toHaveLength(0);
  });

  it('sorts topics worst-first', () => {
    const stats: Record<string, QuestionStat> = {
      'q1': makeStat(0, 2), // topic-a: 0%
      'q2': makeStat(0, 2),
      'q3': makeStat(1, 4), // topic-b: 25%
      'q4': makeStat(0, 2),
    };
    const weak = AdaptiveEngine.computeWeakTopics(questions, stats);
    expect(weak[0]).toBe('topic-a'); // worst first
    expect(weak[1]).toBe('topic-b');
  });
});

// ── AdaptiveEngine.selectionReason ────────────────────────────────────────

describe('AdaptiveEngine.selectionReason', () => {
  const q = makeQuestion('q1', 'topic-a');

  it('returns "Scheduled for review today" for due questions', () => {
    const sm2Map = { 'q1': makeSchedule(dateStr(NOW)) };
    expect(AdaptiveEngine.selectionReason(q, {}, sm2Map, [], NOW))
      .toBe('Scheduled for review today');
  });

  it('returns "New question in a weak topic" for weak unseen', () => {
    expect(AdaptiveEngine.selectionReason(q, {}, {}, ['topic-a'], NOW))
      .toBe('New question in a weak topic');
  });

  it('returns "New question — never attempted" for unseen non-weak', () => {
    expect(AdaptiveEngine.selectionReason(q, {}, {}, [], NOW))
      .toBe('New question — never attempted');
  });
});
