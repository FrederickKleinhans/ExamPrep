import { ExamResult, QuestionStat } from '../types';

export interface ReadinessEstimate {
  score: number;
  confidence: 'early' | 'developing' | 'strong';
  questionsAttempted: number;
  examsCompleted: number;
}

export function estimateReadiness(
  questionStats: Record<string, QuestionStat>,
  totalQuestions: number,
  examHistory: ExamResult[],
): ReadinessEstimate | null {
  const stats = Object.values(questionStats);
  const questionsAttempted = stats.length;
  if (questionsAttempted < 10 || totalQuestions <= 0) return null;

  const earned = stats.reduce((sum, stat) => sum + (stat.pointsEarned ?? stat.correct), 0);
  const possible = stats.reduce((sum, stat) => sum + (stat.pointsTotal ?? stat.attempts), 0);
  const practiceAccuracy = possible > 0 ? earned / possible : 0;
  const coverage = Math.min(1, questionsAttempted / totalQuestions);
  const recentExams = [...examHistory].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const examAverage = recentExams.length
    ? recentExams.reduce((sum, exam) => sum + exam.score, 0) / recentExams.length / 100
    : null;

  const score =
    examAverage === null
      ? practiceAccuracy * 75 + coverage * 25
      : practiceAccuracy * 60 + coverage * 20 + examAverage * 20;
  const confidence =
    questionsAttempted >= 30 && recentExams.length >= 2
      ? 'strong'
      : questionsAttempted >= 20 || recentExams.length > 0
        ? 'developing'
        : 'early';

  return {
    score: Math.round(score),
    confidence,
    questionsAttempted,
    examsCompleted: recentExams.length,
  };
}
