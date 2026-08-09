import { useEffect } from 'react';
import { BookOpen, RotateCcw, CheckCircle } from 'lucide-react';
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
    getNextStudyQuestion,
    submitStudyAnswer,
    resetStudySession,
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

  const totalQuestions = questionBank.questions.length;
  const answeredThisSession = studySessionHistory.length;
  const sessionComplete = !currentStudyQuestion && answeredThisSession > 0;

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
        </div>
        {answeredThisSession > 0 && (
          <button
            onClick={resetStudySession}
            className="px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] 
              hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reset Session
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
          <span>Session progress</span>
          <span>{answeredThisSession} / {totalQuestions} answered this session</span>
        </div>
        <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
            style={{ width: `${(answeredThisSession / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Session complete state */}
      {sessionComplete && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Session Complete!</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            You've answered all {totalQuestions} questions in this session.
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

      {/* Current question */}
      {currentStudyQuestion && (
        <div>
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
