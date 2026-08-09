import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { AnalyticsService } from '../services/AnalyticsService';

export function DashboardPage() {
  const navigate = useNavigate();
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
  const strongest = AnalyticsService.getStrongestTopics(topicAccuracies);
  const weakest = AnalyticsService.getWeakestTopics(topicAccuracies);
  const missedQuestions = AnalyticsService.getMissedQuestions(questionBank.questions, progress.questionStats);
  const recentExams = progress.examHistory.slice(-5).reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {cert.name} ({cert.examCode})
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/study')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-blue-500 text-white font-medium text-sm 
              hover:shadow-[0_0_24px_-4px_var(--glow)] transition-all min-h-[44px] flex items-center gap-2 btn-glow"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Study Now
          </button>
          <button
            onClick={() => navigate('/exam')}
            className="px-5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium text-sm
              hover:bg-[var(--border)] transition-all min-h-[44px] flex items-center gap-2 border border-[var(--border)]"
          >
            <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
            Take Exam
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Progress</span>
            <Target className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{overallStats.completionPercent}%</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {overallStats.totalAttempted}/{overallStats.questionsInBank} questions attempted
          </p>
        </div>

        {/* Average Score */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Avg Score</span>
            <TrendingUp className="w-4 h-4 text-[var(--success)]" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{overallStats.averageAccuracy}%</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Rolling accuracy</p>
        </div>

        {/* Study Streak */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Streak</span>
            <Flame className="w-4 h-4 text-[var(--warning)] animate-pulse-flame" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{progress.studyStreak.current}</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Best: {progress.studyStreak.longest} days
          </p>
        </div>

        {/* Exams Taken */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Exams</span>
            <ClipboardCheck className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{progress.examHistory.length}</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {progress.examHistory.filter((e) => e.passed).length} passed
          </p>
        </div>
      </div>

      {/* Review wrong answers */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--error)]" aria-hidden="true" />
              Review Wrong Answers
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Revisit questions you answered incorrectly most often.
            </p>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"
          >
            See details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]">
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Missed Questions</div>
            <div className="text-2xl font-bold text-[var(--error)] mt-2">{missedQuestions.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]">
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Most Recent</div>
            <div className="text-lg font-semibold text-[var(--text-primary)] mt-2">
              {missedQuestions[0]?.id ?? 'None'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]">
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Top Weak Topic</div>
            <div className="text-lg font-semibold text-[var(--text-primary)] mt-2">
              {weakest[0]?.topicName ?? 'N/A'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]">
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">Review Now</div>
            <div className="text-lg font-semibold text-[var(--accent)] mt-2">Go to analytics</div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Topic Breakdown</h3>
          <div className="space-y-3">
            {topicAccuracies.map((topic) => (
              <div key={topic.topicId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)] truncate mr-2">{topic.topicName}</span>
                  <span className="text-[var(--text-primary)] font-medium shrink-0">
                    {topic.total > 0 ? `${topic.accuracy}%` : '—'}
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topic.accuracy}%`,
                      backgroundColor: topic.accuracy >= 70
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

        {/* Strongest & Weakest */}
        <div className="space-y-4">
          {/* Strongest */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--success)] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" aria-hidden="true" /> Strongest Topics
            </h3>
            {strongest.length > 0 ? (
              <ul className="space-y-2">
                {strongest.map((t) => (
                  <li key={t.topicId} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{t.topicName}</span>
                    <span className="text-[var(--success)] font-medium">{t.accuracy}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">Answer questions to see your strengths.</p>
            )}
          </div>

          {/* Weakest */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--error)] mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" aria-hidden="true" /> Weakest Topics
            </h3>
            {weakest.length > 0 ? (
              <ul className="space-y-2">
                {weakest.map((t) => (
                  <li key={t.topicId} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{t.topicName}</span>
                    <span className="text-[var(--error)] font-medium">{t.accuracy}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">Answer questions to identify weak areas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Exams</h3>
          {recentExams.length > 0 && (
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {recentExams.length > 0 ? (
          <div className="space-y-2">
            {recentExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-tertiary)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      exam.passed
                        ? 'bg-[var(--success)]/10 text-[var(--success)]'
                        : 'bg-[var(--error)]/10 text-[var(--error)]'
                    }`}
                  >
                    {exam.passed ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {new Date(exam.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{exam.score}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No exams taken yet. Take your first practice exam to see results here.
          </p>
        )}
      </div>

      {/* Study Resources */}
      {cert.resources && cert.resources.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Study Resources</h3>
          <div className="space-y-1.5">
            {cert.resources.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors group"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                  {resource.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
