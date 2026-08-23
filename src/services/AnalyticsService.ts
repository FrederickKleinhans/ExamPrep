import { Question, QuestionStat, ExamResult, Topic, CareerTrack, UserProgress } from '../types';

export interface TrackCertSummary {
  certId: string;
  certName: string;
  questionsAnswered: number;
  questionsTotal: number;
  completionPercent: number;
  accuracy: number;
  examsTaken: number;
  passed: boolean;
  hasContent: boolean;
}

export interface TrackAnalytics {
  trackId: string;
  trackName: string;
  trackIcon: string;
  trackColor: string;
  totalCerts: number;
  certsWithContent: number;
  certsStarted: number;
  certsCompleted: number;
  overallCompletion: number;
  overallAccuracy: number;
  totalExamsTaken: number;
  totalQuestionsAnswered: number;
  nextCertId: string | null;
  certs: TrackCertSummary[];
}

export interface TopicAccuracy {
  topicId: string;
  topicName: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface OverallStats {
  totalAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageAccuracy: number;
  averageTimeMs: number;
  questionsInBank: number;
  completionPercent: number;
}

export interface ExamTrend {
  date: string;
  score: number;
  passed: boolean;
}

export class AnalyticsService {
  static getOverallStats(
    questions: Question[],
    stats: Record<string, QuestionStat>
  ): OverallStats {
    const statEntries = Object.values(stats);
    const totalAttempted = statEntries.length;
    const totalCorrect = statEntries.reduce((sum, s) => sum + s.correct, 0);
    const totalIncorrect = statEntries.reduce((sum, s) => sum + s.incorrect, 0);
    // Use point-based accuracy when available
    const totalPointsEarned = statEntries.reduce((sum, s) => sum + ((s as any).pointsEarned ?? s.correct), 0);
    const totalPointsTotal = statEntries.reduce((sum, s) => sum + ((s as any).pointsTotal ?? s.attempts), 0);
    const averageAccuracy = totalPointsTotal > 0 ? (totalPointsEarned / totalPointsTotal) * 100 : 0;
    const averageTimeMs =
      statEntries.length > 0
        ? statEntries.reduce((sum, s) => sum + s.averageTimeMs, 0) / statEntries.length
        : 0;

    return {
      totalAttempted,
      totalCorrect,
      totalIncorrect,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      averageTimeMs: Math.round(averageTimeMs),
      questionsInBank: questions.length,
      completionPercent: questions.length > 0
        ? Math.round((totalAttempted / questions.length) * 100)
        : 0,
    };
  }

  static getTopicAccuracy(
    questions: Question[],
    stats: Record<string, QuestionStat>,
    topics: Topic[]
  ): TopicAccuracy[] {
    const topicMap: Record<string, { earned: number; total: number }> = {};

    for (const question of questions) {
      const stat = stats[question.id];
      if (!stat) continue;

      if (!topicMap[question.topicId]) {
        topicMap[question.topicId] = { earned: 0, total: 0 };
      }

      const earned = (stat as any).pointsEarned ?? stat.correct;
      const total = (stat as any).pointsTotal ?? stat.attempts;

      topicMap[question.topicId].earned += earned;
      topicMap[question.topicId].total += total;
    }

    return topics.map((topic) => {
      const data = topicMap[topic.id] || { earned: 0, total: 0 };
      return {
        topicId: topic.id,
        topicName: topic.name,
        correct: data.earned,
        total: data.total,
        accuracy: data.total > 0 ? Math.round((data.earned / data.total) * 100) : 0,
      };
    });
  }

  static getExamTrend(examHistory: ExamResult[]): ExamTrend[] {
    return examHistory
      .slice(-10)
      .map((exam) => ({
        date: new Date(exam.date).toLocaleDateString(),
        score: exam.score,
        passed: exam.passed,
      }));
  }

  static getRecentAverage(stats: Record<string, QuestionStat>, lastN: number = 20): number {
    const entries = Object.values(stats)
      .sort((a, b) => new Date(b.lastAttempted).getTime() - new Date(a.lastAttempted).getTime())
      .slice(0, lastN);

    if (entries.length === 0) return 0;

    const totalEarned = entries.reduce((sum, s) => sum + ((s as any).pointsEarned ?? s.correct), 0);
    const totalTotal = entries.reduce((sum, s) => sum + ((s as any).pointsTotal ?? s.attempts), 0);

    return totalTotal > 0 ? Math.round((totalEarned / totalTotal) * 100) : 0;
  }

  static getStrongestTopics(topicAccuracies: TopicAccuracy[], count: number = 3): TopicAccuracy[] {
    return [...topicAccuracies]
      .filter((t) => t.total > 0)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, count);
  }

  static getWeakestTopics(topicAccuracies: TopicAccuracy[], count: number = 3): TopicAccuracy[] {
    return [...topicAccuracies]
      .filter((t) => t.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, count);
  }

  static getMissedQuestions(
    questions: Question[],
    stats: Record<string, QuestionStat>
  ): Question[] {
    return questions.filter((q) => {
      const stat = stats[q.id];
      return stat && stat.incorrect > stat.correct;
    });
  }

  static getImprovementScore(examHistory: ExamResult[]): number {
    if (examHistory.length < 2) return 0;
    const firstThree = examHistory.slice(0, 3);
    const lastThree = examHistory.slice(-3);
    const firstAvg = firstThree.reduce((s, e) => s + e.score, 0) / firstThree.length;
    const lastAvg = lastThree.reduce((s, e) => s + e.score, 0) / lastThree.length;
    return Math.round(lastAvg - firstAvg);
  }

  /**
   * Aggregates progress across all certifications in a track.
   *
   * @param track       The career track definition
   * @param progress    Full user progress
   * @param certMeta    Map of certId → { name, questionCount } from the manifest
   *                    (only certs with compiled content will be present)
   */
  static getTrackAnalytics(
    track: CareerTrack,
    progress: UserProgress,
    certMeta: globalThis.Map<string, { name: string; questionCount: number }>,
  ): TrackAnalytics {
    const allCertIds = track.levels.flatMap((l) => l.certs.map((c) => c.certId));

    let totalAnswered = 0;
    let totalPossible = 0;
    let totalPointsEarned = 0;
    let totalPointsAttempted = 0;
    let totalExams = 0;
    let certsStarted = 0;
    let certsCompleted = 0;
    let nextCertId: string | null = null;

    const certs: TrackCertSummary[] = allCertIds.map((certId) => {
      const meta = certMeta.get(certId);
      const hasContent = !!meta;
      const certProgress = progress.certifications[certId];

      const questionsAnswered = certProgress
        ? Object.keys(certProgress.questionStats).length
        : 0;
      const questionsTotal = meta?.questionCount ?? 0;
      const completionPercent = questionsTotal > 0
        ? Math.round((questionsAnswered / questionsTotal) * 100)
        : 0;

      const statValues = Object.values(certProgress?.questionStats ?? {});
      const earned = statValues.reduce((s, q) => s + (q.pointsEarned ?? q.correct), 0);
      const attempted = statValues.reduce((s, q) => s + (q.pointsTotal ?? q.attempts), 0);
      const accuracy = attempted > 0 ? Math.round((earned / attempted) * 100) : 0;

      const examHistory = certProgress?.examHistory ?? [];
      const examsTaken = examHistory.length;
      const passed = examHistory.some((e) => e.passed);

      // Accumulate track totals
      if (hasContent) {
        totalAnswered += questionsAnswered;
        totalPossible += questionsTotal;
        totalPointsEarned += earned;
        totalPointsAttempted += attempted;
        totalExams += examsTaken;
        if (questionsAnswered > 0) certsStarted++;
        if (passed) certsCompleted++;
      }

      return {
        certId,
        certName: meta?.name ?? certId,
        questionsAnswered,
        questionsTotal,
        completionPercent,
        accuracy,
        examsTaken,
        passed,
        hasContent,
      };
    });

    // Next cert = first cert with content that hasn't been passed yet
    for (const cert of certs) {
      if (cert.hasContent && !cert.passed) {
        nextCertId = cert.certId;
        break;
      }
    }

    const certsWithContent = certs.filter((c) => c.hasContent).length;
    const overallCompletion = totalPossible > 0
      ? Math.round((totalAnswered / totalPossible) * 100)
      : 0;
    const overallAccuracy = totalPointsAttempted > 0
      ? Math.round((totalPointsEarned / totalPointsAttempted) * 100)
      : 0;

    return {
      trackId: track.id,
      trackName: track.name,
      trackIcon: track.icon,
      trackColor: track.color,
      totalCerts: allCertIds.length,
      certsWithContent,
      certsStarted,
      certsCompleted,
      overallCompletion,
      overallAccuracy,
      totalExamsTaken: totalExams,
      totalQuestionsAnswered: totalAnswered,
      nextCertId,
      certs,
    };
  }
}
