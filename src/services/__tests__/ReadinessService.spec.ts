import { describe, expect, it } from 'vitest';
import { estimateReadiness } from '../ReadinessService';
import { QuestionStat } from '../../types';

function makeStats(count: number, correct = count): Record<string, QuestionStat> {
  return Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `q${index}`,
      {
        attempts: 1,
        correct: Number(index < correct),
        incorrect: Number(index >= correct),
        lastAttempted: '2026-10-01T10:00:00.000Z',
        averageTimeMs: 1000,
        confidence: 'medium' as const,
      },
    ]),
  );
}

describe('estimateReadiness', () => {
  it('waits for a minimum sample of ten distinct questions', () => {
    expect(estimateReadiness(makeStats(9), 100, [])).toBeNull();
  });

  it('combines accuracy with bank coverage when no mock exam exists', () => {
    expect(estimateReadiness(makeStats(10), 100, [])).toMatchObject({
      score: 78,
      confidence: 'early',
      questionsAttempted: 10,
      examsCompleted: 0,
    });
  });

  it('includes the three latest mock exams and caps question coverage', () => {
    const exams = [70, 80, 90, 0].map((score, index) => ({
      id: `exam-${index}`,
      certificationId: 'test',
      date: `2026-10-0${index + 1}`,
      score,
      passed: score >= 70,
      timeTakenMs: 1000,
      answers: {},
      flaggedQuestions: [],
    }));
    expect(estimateReadiness(makeStats(30), 20, exams)).toMatchObject({
      score: 91,
      confidence: 'strong',
      examsCompleted: 3,
    });
  });
});
