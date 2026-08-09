import { useEffect, useState } from 'react';
import { Bookmark, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { QuestionCard } from '../components/QuestionCard';
import { Question } from '../types';

export function BookmarksPage() {
  const { manifest, questionBank, progress, initialize, isLoading } = useStore();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

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

  const bookmarkedQuestions = questionBank.questions.filter((q) =>
    progress.bookmarks.includes(q.id)
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" />
          Bookmarks
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {bookmarkedQuestions.length} saved question{bookmarkedQuestions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Selected question view */}
      {selectedQuestion && (
        <div>
          <button
            onClick={() => setSelectedQuestion(null)}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] mb-3 flex items-center gap-1"
          >
            ← Back to list
          </button>
          <QuestionCard
            question={selectedQuestion}
            showExplanation={true}
            selectedAnswer={null}
            isCorrect={null}
            onSubmit={() => {}}
          />
        </div>
      )}

      {/* Bookmarks list */}
      {!selectedQuestion && (
        <>
          {bookmarkedQuestions.length > 0 ? (
            <div className="space-y-2">
              {bookmarkedQuestions.map((question) => {
                const stat = progress.questionStats[question.id];
                return (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className="w-full text-left px-4 py-3 glass-card rounded-2xl
                      hover:border-[var(--accent)]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)] line-clamp-2">
                          {question.questionText}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            question.difficulty === 'easy'
                              ? 'text-[var(--success)] bg-[var(--success)]/10'
                              : question.difficulty === 'medium'
                              ? 'text-[var(--warning)] bg-[var(--warning)]/10'
                              : 'text-[var(--error)] bg-[var(--error)]/10'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {question.topicId.replace(/-/g, ' ')}
                          </span>
                        </div>
                      </div>
                      {stat && (
                        <div className="text-right shrink-0">
                          <div className={`text-sm font-medium ${
                            stat.correct > stat.incorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'
                          }`}>
                            {stat.correct}/{stat.attempts}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">correct</div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <BookOpen className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Bookmarks Yet</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Bookmark questions during study sessions to review them later. Click the bookmark icon on any question card.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
