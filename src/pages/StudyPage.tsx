import { useEffect } from 'react';
import { BookOpen, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { QuestionCard } from '../components/QuestionCard';

export function StudyPage() {
  const {
    manifest,
    questionBank,
    progress,
    initialize,
    isLoading,
    currentStudyQuestion,
    showExplanation,
    selectedAnswer,
    isAnswerCorrect,
    studySessionHistory,
    studySessionResults,
    getNextStudyQuestion,
    submitStudyAnswer,
    resetStudySession,
    studyFilter,
    setStudyFilter,
    studySessionLimit,
    setStudySessionLimit,
    isStudyExhausted,
  } = useStore();

  useEffect(() => {
    if (!manifest) initialize();
  }, [manifest, initialize]);

  useEffect(() => {
    if (questionBank && !currentStudyQuestion && studySessionHistory.length === 0) {
      getNextStudyQuestion();
    }
  }, [questionBank, currentStudyQuestion, studySessionHistory.length, getNextStudyQuestion]);

  if (isLoading || !manifest || !questionBank) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  const answeredThisSession = studySessionHistory.length;
  const sessionComplete = answeredThisSession > 0 && (answeredThisSession >= studySessionLimit || isStudyExhausted);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" />
            Study Mode
          </h1>
          <p className="text-base text-[var(--text-secondary)] mt-1">
            Adaptive practice — questions tailored to your weak areas
          </p>
          <p className="text-xs text-[var(--text-secondary)] italic mt-1">
            Disclaimer: These are practice questions created from public Microsoft documentation and community sources — they are not official Microsoft exam items.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="study-filter" className="text-sm text-[var(--text-secondary)]">
              Filter:
            </label>
            <select
              id="study-filter"
              value={studyFilter}
              onChange={(e) => setStudyFilter(e.target.value as 'all' | 'cloud' | 'architecture' | 'governance' | 'management')}
              className="rounded-lg border border-[var(--bg-tertiary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] min-w-[220px]"
            >
              <option value="all">Everything</option>
              <option value="cloud">Cloud Concepts</option>
              <option value="architecture">Architecture</option>
              <option value="governance">Governance</option>
              <option value="management">Management</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="study-session-limit" className="text-sm text-[var(--text-secondary)]">
              Session:
            </label>
            <select
              id="study-session-limit"
              value={studySessionLimit}
              onChange={(e) => setStudySessionLimit(Number(e.target.value))}
              className="rounded-lg border border-[var(--bg-tertiary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {[10, 20, 30, 40, 50].map((n) => (
                <option key={n} value={n}>
                  {n} Questions
                </option>
              ))}
            </select>
          </div>

          {answeredThisSession > 0 && (
            <button
              onClick={resetStudySession}
              className="px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Reset Session
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
          <span>Session progress</span>
          <span>{answeredThisSession} / {studySessionLimit} answered this session</span>
        </div>
        <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (answeredThisSession / studySessionLimit) * 100)}%` }}
          />
        </div>
      </div>

      {/* Session complete state */}
      {sessionComplete && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Session Complete!</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              {answeredThisSession >= studySessionLimit
                ? `You've answered all ${studySessionLimit} questions in this session.`
                : `No more questions available for this selection. You've answered ${answeredThisSession} question${answeredThisSession !== 1 ? 's' : ''}.`}
            </p>
          <button
            onClick={resetStudySession}
            className="px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm
              hover:bg-[var(--accent-hover)] transition-colors min-h-[44px]"
          >
            Start New Session
          </button>
        </div>
      )}

      {sessionComplete && studySessionResults.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Session results</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Review which questions were correct or incorrect.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" aria-hidden="true" />
                {studySessionResults.filter((r) => r.isCorrect).length} correct
              </span>
              <span className="inline-flex items-center gap-1">
                <XCircle className="w-4 h-4 text-[var(--error)]" aria-hidden="true" />
                {studySessionResults.filter((r) => !r.isCorrect).length} incorrect
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {studySessionResults.map((result, index) => {
              const question = questionBank?.questions.find((q) => q.id === result.questionId);
              return (
                <div
                  key={result.questionId}
                  className={`p-4 rounded-2xl border ${result.isCorrect ? 'border-[var(--success)] bg-[var(--success)]/10' : 'border-[var(--error)] bg-[var(--error)]/10'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Question {index + 1}</span>
                    <span className={`text-xs font-semibold ${result.isCorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                      {result.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {question?.questionText ?? 'Question details unavailable.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current question */}
      {!sessionComplete && currentStudyQuestion && (
        <div className="mb-6">
          <div className="text-xs text-[var(--text-secondary)] mb-3">
            Question {answeredThisSession + 1}
          </div>
          <QuestionCard
            question={currentStudyQuestion}
            showExplanation={showExplanation}
            selectedAnswer={selectedAnswer}
            isCorrect={isAnswerCorrect}
            onSubmit={(answer) => submitStudyAnswer(answer)}
            onNext={getNextStudyQuestion}
          />
        </div>
      )}

      {/* Session stats */}
      {answeredThisSession > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium mb-3">
            Session Stats
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{answeredThisSession}</div>
              <div className="text-xs text-[var(--text-secondary)]">Answered</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--success)]">
                {Object.entries(progress.questionStats)
                  .filter(([id]) => studySessionHistory.includes(id))
                  .filter(([, stat]) => stat.correct > 0)
                  .length}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Correct</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--error)]">
                {Object.entries(progress.questionStats)
                  .filter(([id]) => studySessionHistory.includes(id))
                  .filter(([, stat]) => stat.incorrect > 0)
                  .length}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Incorrect</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
