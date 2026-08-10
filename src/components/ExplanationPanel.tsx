import { CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Explanation } from '../types';

interface Props {
  explanation: Explanation;
  isCorrect: boolean;
  onNext?: () => void;
}

export function ExplanationPanel({ explanation, isCorrect, onNext }: Props) {
  return (
    <div className="mt-6 animate-slide-up" aria-live="polite">
      {/* Result banner */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 ${
          isCorrect
            ? 'bg-[var(--success)]/10 border border-[var(--success)]/30'
            : 'bg-[var(--error)]/10 border border-[var(--error)]/30'
        }`}
      >
        {isCorrect ? (
          <CheckCircle className="w-5 h-5 text-[var(--success)] shrink-0" aria-hidden="true" />
        ) : (
          <XCircle className="w-5 h-5 text-[var(--error)] shrink-0" aria-hidden="true" />
        )}
        <span className={`font-semibold text-base ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </span>
      </div>

      {/* Explanation content */}
      <div className="space-y-3 text-base">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
          <p className="text-[var(--text-primary)]">
            {isCorrect ? explanation.correct : explanation.incorrect}
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20 transition-all duration-200 hover:border-[var(--warning)]/60">
          <Lightbulb className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-medium text-[var(--accent)] text-xs uppercase tracking-wide">Exam Tip</span>
            <p className="text-[var(--text-primary)] mt-1">{explanation.examTip}</p>
          </div>
        </div>
      </div>

      {/* Next button */}
      {onNext && (
        <button
          onClick={onNext}
          className="mt-4 w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-200
            bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] hover:shadow-[0_0_24px_-4px_var(--glow)] btn-glow
            hover:outline-[var(--warning)] hover:outline-2 hover:outline-offset-4 focus-visible:outline-[var(--warning)] focus-visible:outline-2 focus-visible:outline-offset-4
            min-h-[44px] flex items-center justify-center gap-2"
        >
          Next Question
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
