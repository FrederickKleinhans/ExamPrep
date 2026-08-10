import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trophy,
  XCircle,
  Eye,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExamService } from '../services/ExamService';
import { QuestionCard } from '../components/QuestionCard';
import { ExamResult } from '../types';

type ExamPhase = 'setup' | 'session' | 'review' | 'results';

export function ExamPage() {
  const navigate = useNavigate();
  const {
    manifest,
    questionBank,
    progress,
    initialize,
    isLoading,
    examSession,
    startExam,
    submitExamAnswer,
    toggleExamFlag,
    navigateExam,
    finishExam,
    clearExam,
  } = useStore();

  const [phase, setPhase] = useState<ExamPhase>('setup');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    if (!manifest) initialize();
  }, [manifest, initialize]);

  // Timer

  const handleStartExam = () => {
    startExam();
    setPhase('session');
  };

  const handleFinishExam = useCallback(() => {
    const result = finishExam();
    if (result) {
      setExamResult(result);
      setPhase('results');
    }
  }, [finishExam]);

  useEffect(() => {
    if (phase !== 'session' || !examSession) return;

    const interval = setInterval(() => {
      const remaining = ExamService.getRemainingTime(examSession);
      setRemainingTime(remaining);
      if (remaining <= 0) {
        handleFinishExam();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, examSession, handleFinishExam]);

  const handleRetake = () => {
    clearExam();
    setExamResult(null);
    setShowConfirmSubmit(false);
    setPhase('setup');
  };

  const handleReviewAnswers = () => {
    setReviewIndex(0);
    setPhase('review');
  };

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

  // --- SETUP PHASE ---
  if (phase === 'setup') {
    return (
      <div className="w-full animate-fade-in">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <ClipboardCheck className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Practice Exam</h1>
            <p className="text-[var(--text-secondary)] mt-2">{cert.name}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{cert.questionCount}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Questions</div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{cert.timeLimitMinutes}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Minutes</div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{cert.passingScore}%</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Passing Score</div>
            </div>
          </div>

          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 mb-8 text-sm text-[var(--text-secondary)]">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Exam Rules:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>No feedback during the exam — answers are revealed after submission</li>
              <li>You can flag questions for review before submitting</li>
              <li>Timer starts immediately upon clicking Start</li>
              <li>Navigate freely between questions</li>
            </ul>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-3 px-6 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm
              hover:bg-[var(--accent-hover)] transition-colors min-h-[44px]
              hover:outline-[var(--warning)] hover:outline-2 hover:outline-offset-4 focus-visible:outline-[var(--warning)] focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // --- SESSION PHASE ---
  if (phase === 'session' && examSession) {
    const currentQuestion = examSession.questions[examSession.currentIndex];
    const stats = ExamService.getSessionStats(examSession);
    const timePercent = (remainingTime / examSession.timeLimit) * 100;
    const isLowTime = timePercent < 10;

    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className="animate-fade-in">
        {/* Timer bar */}
        <div className="sticky top-0 z-10 bg-[var(--bg-primary)] pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">
              Question {examSession.currentIndex + 1} of {stats.total}
            </span>
            <span
              className={`flex items-center gap-2 text-sm font-mono font-medium ${
                isLowTime ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'
              }`}
              aria-live="polite"
              aria-label={`Time remaining: ${formatTime(remainingTime)}`}
            >
              <Clock className={`w-4 h-4 ${isLowTime ? 'animate-pulse-flame' : ''}`} aria-hidden="true" />
              {formatTime(remainingTime)}
            </span>
          </div>
          <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isLowTime ? 'bg-[var(--error)]' : 'bg-[var(--accent)]'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main question area */}
          <div className="flex-1">
            <QuestionCard
              question={currentQuestion}
              showExplanation={false}
              selectedAnswer={examSession.answers[currentQuestion.id] || null}
              isCorrect={null}
              onSubmit={(answer) => submitExamAnswer(currentQuestion.id, answer)}
              hideBookmark
              examMode
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => navigateExam(examSession.currentIndex - 1)}
                disabled={examSession.currentIndex === 0}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]
                  transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => toggleExamFlag(currentQuestion.id)}
                className={`px-4 py-2 rounded-lg text-sm min-h-[44px] flex items-center gap-2 transition-colors
                  ${examSession.flagged.includes(currentQuestion.id)
                    ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                aria-label={examSession.flagged.includes(currentQuestion.id) ? 'Unflag question' : 'Flag for review'}
              >
                <Flag className="w-4 h-4" />
                {examSession.flagged.includes(currentQuestion.id) ? 'Flagged' : 'Flag'}
              </button>

              {examSession.currentIndex < stats.total - 1 ? (
                <button
                  onClick={() => navigateExam(examSession.currentIndex + 1)}
                  className="px-4 py-2 rounded-lg text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10
                    transition-colors min-h-[44px] flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="px-4 py-2 rounded-lg text-sm bg-[var(--success)] text-white font-medium
                    hover:bg-[var(--success)]/80 transition-colors min-h-[44px]"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>

          {/* Question palette (sidebar) */}
          <div className="hidden lg:block w-48 shrink-0">
            <div className="glass-card rounded-2xl p-4 sticky top-16">
              <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium mb-3">
                Questions
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {examSession.questions.map((q, i) => {
                  const isAnswered = !!examSession.answers[q.id];
                  const isFlagged = examSession.flagged.includes(q.id);
                  const isCurrent = i === examSession.currentIndex;

                  let bgColor = 'bg-[var(--bg-tertiary)]';
                  if (isCurrent) bgColor = 'bg-[var(--accent)]';
                  else if (isFlagged) bgColor = 'bg-[var(--warning)]/30';
                  else if (isAnswered) bgColor = 'bg-[var(--success)]/30';

                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateExam(i)}
                      className={`w-7 h-7 rounded text-xs font-medium flex items-center justify-center
                        transition-colors ${bgColor} ${isCurrent ? 'text-white' : 'text-[var(--text-primary)]'}`}
                      aria-label={`Go to question ${i + 1}${isFlagged ? ' (flagged)' : ''}${isAnswered ? ' (answered)' : ''}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[var(--success)]/30" /> Answered ({stats.answered})
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[var(--warning)]/30" /> Flagged ({stats.flagged})
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[var(--bg-tertiary)]" /> Unseen ({stats.unanswered})
                </div>
              </div>
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full mt-4 py-2 px-3 rounded-lg text-xs bg-[var(--success)] text-white font-medium
                  hover:bg-[var(--success)]/80 transition-colors min-h-[44px]"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>

        {/* Confirm submit modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="glass-card rounded-2xl p-6 max-w-md w-full">
              <AlertTriangle className="w-10 h-10 text-[var(--warning)] mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">Submit Exam?</h2>
              <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
                {stats.unanswered > 0
                  ? `You have ${stats.unanswered} unanswered question${stats.unanswered > 1 ? 's' : ''}. `
                  : ''}
                {stats.flagged > 0 ? `${stats.flagged} question${stats.flagged > 1 ? 's are' : ' is'} flagged for review. ` : ''}
                Once submitted, you cannot change your answers.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-[var(--border)] text-[var(--text-secondary)]
                    hover:bg-[var(--bg-tertiary)] transition-colors text-sm min-h-[44px]"
                >
                  Continue Exam
                </button>
                <button
                  onClick={handleFinishExam}
                  className="flex-1 py-2 px-4 rounded-lg bg-[var(--success)] text-white font-medium
                    hover:bg-[var(--success)]/80 transition-colors text-sm min-h-[44px]"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RESULTS PHASE ---
  if (phase === 'results' && examResult) {
    const timeTaken = Math.floor(examResult.timeTakenMs / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    return (
      <div className="w-full animate-fade-in">
        <div className="glass-card rounded-2xl p-8 text-center">
          {examResult.passed ? (
            <Trophy className="w-16 h-16 text-[var(--success)] mx-auto mb-4" aria-hidden="true" />
          ) : (
            <XCircle className="w-16 h-16 text-[var(--error)] mx-auto mb-4" aria-hidden="true" />
          )}

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {examResult.passed ? 'Congratulations! You Passed!' : 'Not Quite There Yet'}
          </h1>

          <div className={`text-5xl font-bold my-6 ${examResult.passed ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            {examResult.score}%
          </div>

          <p className="text-[var(--text-secondary)] mb-6">
            Passing score: {cert.passingScore}% | Time: {minutes}m {seconds}s
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-lg font-bold text-[var(--success)]">
                {examSession?.questions.filter((q) => {
                  const answer = examResult.answers[q.id];
                  if (!answer) return false;
                  return ExamService.isQuestionCorrect(q, answer);
                }).length || 0}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Correct</div>
            </div>
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-lg font-bold text-[var(--error)]">
                {(examSession?.questions.length || 0) - (examSession?.questions.filter((q) => {
                  const answer = examResult.answers[q.id];
                  if (!answer) return false;
                  return ExamService.isQuestionCorrect(q, answer);
                }).length || 0)}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Incorrect</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReviewAnswers}
              className="flex-1 py-3 px-6 rounded-lg border border-[var(--border)] text-[var(--text-primary)]
                font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" /> Review Answers
            </button>
            <button
              onClick={handleRetake}
              className="flex-1 py-3 px-6 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm
                hover:bg-[var(--accent-hover)] transition-colors min-h-[44px]"
            >
              Retake Exam
            </button>
          </div>

          <button
            onClick={() => { clearExam(); navigate('/'); }}
            className="mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- REVIEW PHASE ---
  if (phase === 'review' && examSession && examResult) {
    const question = examSession.questions[reviewIndex];
    const userAnswer = examResult.answers[question.id] || null;
    const isCorrect = userAnswer ? ExamService.isQuestionCorrect(question, userAnswer) : false;

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Exam Review</h1>
          <button
            onClick={handleRetake}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white font-medium
              hover:bg-[var(--accent-hover)] transition-colors min-h-[44px]"
          >
            Retake Exam
          </button>
        </div>

        <div className="text-sm text-[var(--text-secondary)]">
          Question {reviewIndex + 1} of {examSession.questions.length}
        </div>

        <QuestionCard
          question={question}
          showExplanation={true}
          selectedAnswer={userAnswer}
          isCorrect={isCorrect}
          onSubmit={() => {}}
          hideBookmark
        />

        <div className="flex items-center justify-between">
          <button
            onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
            disabled={reviewIndex === 0}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]
              transition-colors disabled:opacity-30 min-h-[44px] flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setReviewIndex(Math.min(examSession.questions.length - 1, reviewIndex + 1))}
            disabled={reviewIndex === examSession.questions.length - 1}
            className="px-4 py-2 rounded-lg text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10
              transition-colors disabled:opacity-30 min-h-[44px] flex items-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
