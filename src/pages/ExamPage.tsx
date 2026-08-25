import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, ChevronLeft, ChevronRight, Trophy, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExamService } from '../services/ExamService';
import { QuestionCard } from '../components/QuestionCard';
import { ExamResult } from '../types';

type ExamPhase = 'setup' | 'session' | 'review' | 'results';

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function ExamPage() {
  const navigate = useNavigate();
  const { manifest, questionBank, progress, initialize, isLoading, examSession, startExam, submitExamAnswer, toggleExamFlag, navigateExam, finishExam, clearExam } = useStore();

  const [phase, setPhase] = useState<ExamPhase>('setup');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => { if (!manifest) initialize(); }, [manifest, initialize]);

  const handleStartExam = () => { startExam(); setPhase('session'); };

  const handleFinishExam = useCallback(() => {
    const result = finishExam();
    if (result) { setExamResult(result); setPhase('results'); }
  }, [finishExam]);

  useEffect(() => {
    if (phase !== 'session' || !examSession) return;
    const interval = setInterval(() => {
      const remaining = ExamService.getRemainingTime(examSession);
      setRemainingTime(remaining);
      if (remaining <= 0) handleFinishExam();
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, examSession, handleFinishExam]);

  const handleRetake = () => { clearExam(); setExamResult(null); setShowConfirmSubmit(false); setPhase('setup'); };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // ── No active cert ─────────────────────────────────────────────────────────
  if (!manifest || !questionBank) {
    return (
      <div className="page-root">
        <div style={{ marginBottom: 24 }}>
          <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Mock exam</p>
          <h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>Exam</h1>
        </div>
        <div className="card-surface" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
          <h2 className="text-heading" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>No active certification</h2>
          <p className="text-muted" style={{ margin: '0 0 24px', fontSize: 13, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Go to Settings to set your active cert, then come back to take a mock exam.
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

  const cert = manifest.certifications.find((c) => c.id === progress.selectedCertification);
  if (!cert) return null;

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    const examHistory = progress.certifications[cert.id]?.examHistory ?? [];
    const lastExam = examHistory.at(-1);
    const bestScore = examHistory.length > 0 ? Math.max(...examHistory.map((e) => e.score)) : null;

    return (
      <div className="page-root">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Hero card */}
          <div className="card-surface" style={{ padding: '36px 32px', marginBottom: 16 }}>
            <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>Mock exam</p>
            <h1 className="text-heading" style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{cert.name}</h1>
            <p className="text-muted" style={{ margin: '8px 0 0', fontSize: 13 }}>{cert.examCode}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
              {[
                { label: 'Questions', value: cert.questionCount },
                { label: 'Time limit', value: `${cert.timeLimitMinutes}m` },
                { label: 'Pass score', value: `${cert.passingScore}%` },
              ].map((m) => (
                <div key={m.label} className="card-inset" style={{ padding: '12px 10px', textAlign: 'center' }}>
                  <div className="text-heading" style={{ fontSize: 22, fontWeight: 800 }}>{m.value}</div>
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {lastExam && (
              <div className="card-inset" style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', fontSize: 13 }}>
                <span className="text-muted">Last attempt</span>
                <span style={{ fontWeight: 700, color: lastExam.passed ? 'var(--success)' : 'var(--error)' }}>
                  {lastExam.score}% — {lastExam.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            )}
            {bestScore !== null && examHistory.length > 1 && (
              <div className="card-inset" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', fontSize: 13 }}>
                <span className="text-muted">Best score</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{bestScore}%</span>
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="card-surface" style={{ padding: '16px 20px', marginBottom: 16, fontSize: 13 }}>
            <p className="text-heading" style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14 }}>Before you start</p>
            <ul className="text-muted" style={{ margin: 0, padding: '0 0 0 16px', lineHeight: 1.8 }}>
              <li>No feedback during the exam — answers revealed after submission</li>
              <li>Flag questions to revisit before submitting</li>
              <li>Timer begins the moment you click Start</li>
              <li>Navigate freely between any question</li>
            </ul>
          </div>

          <button
            onClick={handleStartExam}
            style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 16, padding: '16px', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: '0.02em' }}
          >
            Start exam
          </button>
        </div>
      </div>
    );
  }

  // ── SESSION ────────────────────────────────────────────────────────────────
  if (phase === 'session' && examSession) {
    const currentQuestion = examSession.questions[examSession.currentIndex];
    const stats = ExamService.getSessionStats(examSession);
    const timePercent = (remainingTime / examSession.timeLimit) * 100;
    const isLowTime = timePercent < 10;
    const isFlagged = examSession.flagged.includes(currentQuestion.id);

    return (
      <div className="page-root">
        {/* Timer bar */}
        <div className="sticky-bar" style={{ position: 'sticky', top: 0, zIndex: 10, paddingBottom: 14, marginBottom: 4 }}>
          <div className="page-header" style={{ marginBottom: 8 }}>
            <span className="text-muted" style={{ fontSize: 13 }}>
              Question <strong className="text-heading">{examSession.currentIndex + 1}</strong> of {stats.total}
            </span>
            <div className="page-header-controls" style={{ justifyContent: 'flex-end' }}>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: isLowTime ? 'var(--error)' : 'var(--text-primary)' }}
                aria-live="polite"
                aria-label={`Time remaining: ${formatTime(remainingTime)}`}
              >
                {isLowTime && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--error)', animation: 'pulse 1s infinite', display: 'inline-block' }} />}
                {formatTime(remainingTime)}
              </span>
              <button
                onClick={() => setShowConfirmSubmit(true)}
                style={{ background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 10, padding: '6px 14px', color: 'var(--success)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
              >
                Submit
              </button>
            </div>
          </div>
          <div className="progress-track" style={{ width: '100%', height: 3, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${timePercent}%`, height: '100%', borderRadius: 999, background: isLowTime ? 'var(--error)' : 'linear-gradient(90deg, var(--accent), var(--success))', transition: 'width 1s linear' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <QuestionCard
              question={currentQuestion}
              showExplanation={false}
              selectedAnswer={examSession.answers[currentQuestion.id] ?? null}
              isCorrect={null}
              onSubmit={(answer) => submitExamAnswer(currentQuestion.id, answer)}
              hideBookmark
              examMode
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
              <button
                onClick={() => navigateExam(examSession.currentIndex - 1)}
                disabled={examSession.currentIndex === 0}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '9px 16px', fontSize: 13, cursor: examSession.currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: examSession.currentIndex === 0 ? 0.4 : 1 }}
              >
                <ChevronLeft style={{ width: 15, height: 15 }} /> Previous
              </button>
              <button
                onClick={() => toggleExamFlag(currentQuestion.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: isFlagged ? 'rgba(255,174,0,0.1)' : 'var(--bg-tertiary)', border: `1px solid ${isFlagged ? 'rgba(255,174,0,0.35)' : 'var(--border)'}`, borderRadius: 12, padding: '9px 16px', color: isFlagged ? 'var(--warning)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontWeight: isFlagged ? 700 : 400 }}
                aria-label={isFlagged ? 'Unflag question' : 'Flag for review'}
              >
                <Flag style={{ width: 14, height: 14 }} />
                {isFlagged ? 'Flagged' : 'Flag'}
              </button>
              {examSession.currentIndex < stats.total - 1 ? (
                <button
                  onClick={() => navigateExam(examSession.currentIndex + 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 12, padding: '9px 16px', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  Next <ChevronRight style={{ width: 15, height: 15 }} />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  style={{ background: 'linear-gradient(135deg, var(--success), #1ab3a0)', border: 'none', borderRadius: 12, padding: '9px 20px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit exam
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Confirm submit modal */}
        {showConfirmSubmit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} role="dialog" aria-modal="true">
            <div className="modal-surface" style={{ padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
              <AlertTriangle style={{ width: 40, height: 40, color: 'var(--warning)', margin: '0 auto 16px' }} />
              <h2 className="text-heading" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Submit exam?</h2>
              <p className="text-muted" style={{ margin: '0 0 24px', fontSize: 13, lineHeight: 1.6 }}>
                {stats.unanswered > 0 && `${stats.unanswered} question${stats.unanswered > 1 ? 's' : ''} unanswered. `}
                {stats.flagged > 0 && `${stats.flagged} flagged for review. `}
                This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowConfirmSubmit(false)} className="btn-ghost" style={{ flex: 1, borderRadius: 12, padding: '11px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                  Continue
                </button>
                <button onClick={handleFinishExam} style={{ flex: 1, background: 'linear-gradient(135deg, var(--success), #1ab3a0)', border: 'none', borderRadius: 12, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (phase === 'results' && examResult) {
    const passed = examResult.passed;
    const timeTaken = Math.floor(examResult.timeTakenMs / 1000);
    const correctCount = examSession?.questions.filter((q) => {
      const answer = examResult.answers[q.id];
      return answer ? ExamService.isQuestionCorrect(q, answer) : false;
    }).length ?? 0;
    const totalCount = examSession?.questions.length ?? 0;

    return (
      <div className="page-root" style={{ maxWidth: 580, margin: '0 auto' }}>
        {/* Score card */}
        <div
          className="card-surface"
          style={{ padding: '44px 32px', textAlign: 'center', marginBottom: 14, borderColor: passed ? 'rgba(45,212,191,0.3)' : 'rgba(255,107,107,0.3)' }}
        >
          {passed
            ? <Trophy style={{ width: 52, height: 52, color: 'var(--success)', margin: '0 auto 16px', filter: 'drop-shadow(0 0 20px rgba(45,212,191,0.5))' }} />
            : <XCircle style={{ width: 52, height: 52, color: 'var(--error)', margin: '0 auto 16px', filter: 'drop-shadow(0 0 20px rgba(255,107,107,0.5))' }} />
          }
          <h1 className="text-heading" style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800 }}>
            {passed ? 'You passed!' : 'Not quite yet'}
          </h1>
          <p className="text-muted" style={{ margin: '0 0 20px', fontSize: 13 }}>
            {cert.name} · {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
          </p>
          <div style={{ fontSize: 72, fontWeight: 900, color: passed ? 'var(--success)' : 'var(--error)', lineHeight: 1, marginBottom: 8 }}>
            {examResult.score}%
          </div>
          <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>Passing score: {cert.passingScore}%</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Correct', value: correctCount, color: 'var(--success)' },
            { label: 'Incorrect', value: totalCount - correctCount, color: 'var(--error)' },
            { label: 'Total', value: totalCount, color: 'var(--accent)' },
          ].map((s) => (
            <div key={s.label} className="card-surface" style={{ padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => { setReviewIndex(0); setPhase('review'); }}
            className="btn-ghost"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: '13px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            <Eye style={{ width: 16, height: 16 }} /> Review answers
          </button>
          <button
            onClick={handleRetake}
            style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 14, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Retake exam
          </button>
        </div>
        <button
          onClick={() => { clearExam(); navigate('/'); }}
          className="text-muted"
          style={{ display: 'block', width: '100%', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', padding: '8px' }}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  if (phase === 'review' && examSession && examResult) {
    const question = examSession.questions[reviewIndex];
    const userAnswer = examResult.answers[question.id] ?? null;
    const isCorrect = userAnswer ? ExamService.isQuestionCorrect(question, userAnswer) : false;

    return (
      <div className="page-root">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 className="text-heading" style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Exam review</h1>
            <p className="text-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>Question {reviewIndex + 1} of {examSession.questions.length}</p>
          </div>
          <button
            onClick={handleRetake}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 12, padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Retake
          </button>
        </div>

        {/* Progress strip */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
          {examSession.questions.map((q, i) => {
            const ans = examResult.answers[q.id];
            const correct = ans ? ExamService.isQuestionCorrect(q, ans) : null;
            return (
              <div
                key={q.id}
                onClick={() => setReviewIndex(i)}
                style={{ flex: 1, height: 4, borderRadius: 999, cursor: 'pointer', background: i === reviewIndex ? 'var(--accent)' : correct === true ? 'rgba(45,212,191,0.5)' : correct === false ? 'rgba(255,107,107,0.5)' : 'var(--border)' }}
              />
            );
          })}
        </div>

        <QuestionCard
          question={question}
          showExplanation={true}
          selectedAnswer={userAnswer}
          isCorrect={isCorrect}
          onSubmit={() => { }}
          hideBookmark
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <button
            onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
            disabled={reviewIndex === 0}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '9px 16px', fontSize: 13, cursor: reviewIndex === 0 ? 'not-allowed' : 'pointer', opacity: reviewIndex === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft style={{ width: 15, height: 15 }} /> Previous
          </button>
          <button
            onClick={() => setReviewIndex(Math.min(examSession.questions.length - 1, reviewIndex + 1))}
            disabled={reviewIndex === examSession.questions.length - 1}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 12, padding: '9px 16px', color: 'var(--accent)', fontSize: 13, cursor: reviewIndex === examSession.questions.length - 1 ? 'not-allowed' : 'pointer', opacity: reviewIndex === examSession.questions.length - 1 ? 0.4 : 1, fontWeight: 600 }}
          >
            Next <ChevronRight style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
