import { useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AnalyticsService } from '../services/AnalyticsService';

export function AnalyticsPage() {
  const { manifest, questionBank, progress, initialize, isLoading } = useStore();

  useEffect(() => {
    if (!manifest) initialize();
  }, [manifest, initialize]);

  if (isLoading || !manifest || !questionBank) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  const cert = manifest.certifications.find(
    (c) => c.id === progress.selectedCertification
  );
  if (!cert) return null;

  const overallStats = AnalyticsService.getOverallStats(
    questionBank.questions,
    progress.questionStats
  );
  const topicAccuracies = AnalyticsService.getTopicAccuracy(
    questionBank.questions,
    progress.questionStats,
    cert.topics
  );
  const examTrend = AnalyticsService.getExamTrend(progress.examHistory);
  const missedQuestions = AnalyticsService.getMissedQuestions(
    questionBank.questions,
    progress.questionStats
  );
  const improvement = AnalyticsService.getImprovementScore(progress.examHistory);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" />
          Analytics
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Performance insights for {cert.name}
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium mb-2">
            Total Accuracy
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{overallStats.averageAccuracy}%</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {overallStats.totalCorrect} correct / {overallStats.totalCorrect + overallStats.totalIncorrect} total
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium mb-2">
            Avg Time / Question
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">
            {overallStats.averageTimeMs > 0 ? `${Math.round(overallStats.averageTimeMs / 1000)}s` : '—'}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Across all attempts</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium mb-2">
            Improvement
          </div>
          <div className={`text-3xl font-bold ${improvement >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            {improvement > 0 ? '+' : ''}{improvement}%
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">First vs last exams</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium mb-2">
            Questions Missed
          </div>
          <div className="text-3xl font-bold text-[var(--error)]">{missedQuestions.length}</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">More incorrect than correct</p>
        </div>
      </div>

      {/* Exam Score Trend */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          Exam Score Trend
        </h3>
        {examTrend.length > 0 ? (
          <div className="space-y-3">
            {/* Simple visual bar chart */}
            <div className="flex items-end gap-2 h-40">
              {examTrend.map((exam, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-xs text-[var(--text-secondary)] mb-1">{exam.score}%</span>
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      exam.passed ? 'bg-[var(--success)]' : 'bg-[var(--error)]'
                    }`}
                    style={{ height: `${exam.score}%` }}
                  />
                  <span className="text-xs text-[var(--text-secondary)] mt-1 truncate w-full text-center">
                    {exam.date}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[var(--success)]" /> Passed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[var(--error)]" /> Failed
              </span>
              <span>Passing: {cert.passingScore}%</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Take exams to see your score trend over time.</p>
        )}
      </div>

      {/* Topic Accuracy */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Topic Accuracy</h3>
        <div className="space-y-4">
          {topicAccuracies.map((topic) => (
            <div key={topic.topicId}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">{topic.topicName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {topic.correct}/{topic.total} correct
                  </span>
                  <span className={`text-sm font-semibold ${
                    topic.accuracy >= 70
                      ? 'text-[var(--success)]'
                      : topic.accuracy >= 50
                      ? 'text-[var(--warning)]'
                      : topic.total > 0
                      ? 'text-[var(--error)]'
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {topic.total > 0 ? `${topic.accuracy}%` : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${topic.accuracy}%`,
                    backgroundColor:
                      topic.accuracy >= 70
                        ? 'var(--success)'
                        : topic.accuracy >= 50
                        ? 'var(--warning)'
                        : 'var(--error)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Analysis */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          Time Analysis
        </h3>
        {overallStats.totalAttempted > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg text-center">
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {Math.round(overallStats.averageTimeMs / 1000)}s
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Avg per question</div>
            </div>
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg text-center">
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {overallStats.totalAttempted}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Questions attempted</div>
            </div>
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg text-center">
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {Math.round((overallStats.averageTimeMs * overallStats.totalAttempted) / 60000)}m
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Total study time</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Start studying to see time analysis.</p>
        )}
      </div>

      {/* Missed Questions */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--error)]" aria-hidden="true" />
          Frequently Missed Questions ({missedQuestions.length})
        </h3>
        {missedQuestions.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {missedQuestions.slice(0, 10).map((q) => {
              const stat = progress.questionStats[q.id];
              return (
                <div
                  key={q.id}
                  className="px-4 py-3 bg-[var(--bg-tertiary)] rounded-lg flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] line-clamp-2">{q.questionText}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {q.topicId.replace(/-/g, ' ')}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">•</span>
                      <span className="text-xs text-[var(--text-secondary)]">{q.difficulty}</span>
                    </div>
                  </div>
                  {stat && (
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-[var(--error)]">
                        {stat.correct}/{stat.attempts}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">correct</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No frequently missed questions. Keep up the good work!
          </p>
        )}
      </div>
    </div>
  );
}
