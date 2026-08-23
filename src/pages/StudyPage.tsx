import { useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { QuestionCard } from '../components/QuestionCard';

export function StudyPage() {
  const {
    manifest,
    questionBank,
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!manifest || !questionBank) {
    return (
      <div className="page-root">
        <div style={{ marginBottom: 24 }}>
          <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Study mode</p>
          <h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>Practice</h1>
        </div>
        <div className="card-surface" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📚</div>
          <h2 className="text-heading" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>No active certification</h2>
          <p className="text-muted" style={{ margin: '0 0 24px', fontSize: 13, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Go to Settings to set your active cert, then come back to start studying.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/settings" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 12, padding: '11px 24px', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Go to Settings
            </a>
            <a href="/tracks" className="btn-ghost" style={{ borderRadius: 12, padding: '11px 24px', fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
              Browse tracks
            </a>
          </div>
        </div>
      </div>
    );
  }

  const certification = manifest.certifications.find((c) => c.id === questionBank.certificationId);
  const answeredThisSession = studySessionHistory.length;
  const correctThisSession = studySessionResults.filter((r) => r.isCorrect).length;
  const incorrectThisSession = studySessionResults.filter((r) => !r.isCorrect).length;
  const sessionComplete = answeredThisSession > 0 && (answeredThisSession >= studySessionLimit || isStudyExhausted);
  const accuracy = answeredThisSession > 0 ? Math.round((correctThisSession / answeredThisSession) * 100) : 0;
  const progressPct = Math.min(100, (answeredThisSession / studySessionLimit) * 100);

  return (
    <div className="page-root">

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
              {certification?.name ?? 'Study mode'}
            </p>
            <h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>Practice</h1>
            <p className="text-muted" style={{ margin: '6px 0 0', fontSize: 13 }}>
              Adaptive questions tailored to your weak areas
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={studyFilter}
              onChange={(e) => void setStudyFilter(e.target.value)}
              className="input-surface"
              aria-label="Filter by topic"
            >
              {certification?.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
            <select
              value={studySessionLimit}
              onChange={(e) => setStudySessionLimit(Number(e.target.value))}
              className="input-surface"
              aria-label="Session question count"
            >
              {[10, 20, 30, 40, 50].map((n) => (
                <option key={n} value={n}>{n} questions</option>
              ))}
            </select>
            {answeredThisSession > 0 && (
              <button
                onClick={resetStudySession}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}
              >
                <RotateCcw style={{ width: 14, height: 14 }} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span className="text-muted">Session progress</span>
            <span className="text-muted">{answeredThisSession} / {studySessionLimit}</span>
          </div>
          <div className="progress-track" style={{ width: '100%', height: 4, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--accent), var(--success))', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* ── Session stats ── */}
      {answeredThisSession > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Answered', value: answeredThisSession, color: 'var(--accent)' },
            { label: 'Correct', value: correctThisSession, color: 'var(--success)' },
            { label: 'Incorrect', value: incorrectThisSession, color: 'var(--error)' },
          ].map((stat) => (
            <div key={stat.label} className="card-surface" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div className="text-muted" style={{ fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Session complete ── */}
      {sessionComplete && (
        <>
          <div className="card-surface" style={{ padding: '40px 32px', textAlign: 'center', marginBottom: 20, borderColor: accuracy >= 70 ? 'rgba(45,212,191,0.3)' : 'rgba(255,107,107,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <h2 className="text-heading" style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Session complete</h2>
            <div style={{ fontSize: 52, fontWeight: 800, color: accuracy >= 70 ? 'var(--success)' : 'var(--error)', margin: '16px 0' }}>
              {accuracy}%
            </div>
            <p className="text-muted" style={{ fontSize: 14, margin: '0 0 24px' }}>
              {correctThisSession} correct · {incorrectThisSession} incorrect · {answeredThisSession} total
            </p>
            <button
              onClick={resetStudySession}
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 14, padding: '13px 32px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              New session
            </button>
          </div>

          {studySessionResults.length > 0 && (
            <div className="card-surface" style={{ padding: 20 }}>
              <h3 className="text-heading" style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Question review</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {studySessionResults.map((result, index) => {
                  const question = questionBank?.questions.find((q) => q.id === result.questionId);
                  return (
                    <div
                      key={result.questionId}
                      className="card-surface-sm"
                      style={{ padding: '12px 14px', borderColor: result.isCorrect ? 'rgba(45,212,191,0.25)' : 'rgba(255,107,107,0.25)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span className="text-muted" style={{ fontSize: 12, fontWeight: 700 }}>Q{index + 1}</span>
                        {result.isCorrect
                          ? <CheckCircle style={{ width: 14, height: 14, color: 'var(--success)' }} />
                          : <XCircle style={{ width: 14, height: 14, color: 'var(--error)' }} />}
                      </div>
                      <p className="text-muted" style={{ margin: 0, fontSize: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {question?.questionText ?? 'Question unavailable'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Current question ── */}
      {!sessionComplete && currentStudyQuestion && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
              <Zap style={{ width: 12, height: 12 }} aria-hidden="true" />
              Question {answeredThisSession + 1}
            </span>
            {studyFilter && (
              <span className="btn-ghost" style={{ fontSize: 11, borderRadius: 999, padding: '3px 10px' }}>
                {certification?.topics.find((t) => t.id === studyFilter)?.name ?? studyFilter}
              </span>
            )}
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

      {!sessionComplete && !currentStudyQuestion && !isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
          <p className="text-muted" style={{ fontSize: 14 }}>Loading your next question…</p>
        </div>
      )}
    </div>
  );
}
