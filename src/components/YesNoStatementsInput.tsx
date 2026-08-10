import { Statement } from '../types';

interface Props {
  statements: Statement[];
  answers: Record<string, 'yes' | 'no'>;
  showResult: boolean;
  onAnswer: (statementId: string, value: 'yes' | 'no') => void;
  disabled?: boolean;
}

export function YesNoStatementsInput({ statements, answers, showResult, onAnswer, disabled }: Props) {
  return (
    <div className="space-y-0 rounded-lg border border-[var(--border)] overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_80px_80px] bg-[var(--bg-tertiary)] px-4 py-2 border-b border-[var(--border)]">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Statement</span>
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-center">Yes</span>
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-center">No</span>
      </div>

      {/* Statement rows */}
      {statements.map((statement, index) => {
        const userAnswer = answers[statement.id];
        const correctAnswer = statement.isCorrectYes ? 'yes' : 'no';
        const isAnswered = !!userAnswer;
        const isCorrectRow = userAnswer === correctAnswer;

        let rowBg = index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-primary)]';
        if (showResult && isAnswered) {
          rowBg = isCorrectRow
            ? 'bg-[var(--success)]/5'
            : 'bg-[var(--error)]/5';
        }

        return (
          <div
            key={statement.id}
            className={`grid grid-cols-[1fr_80px_80px] px-4 py-3 border-b border-[var(--border)] last:border-b-0 ${rowBg}`}
          >
            <div className="flex items-center pr-4">
              <span className="text-base text-[var(--text-primary)]">{statement.text}</span>
              {showResult && !isCorrectRow && isAnswered && (
                <span className="ml-2 text-xs text-[var(--error)] shrink-0">✗</span>
              )}
              {showResult && isCorrectRow && isAnswered && (
                <span className="ml-2 text-xs text-[var(--success)] shrink-0">✓</span>
              )}
            </div>

            {/* Yes button */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => !disabled && onAnswer(statement.id, 'yes')}
                disabled={disabled}
                role="radio"
                aria-checked={userAnswer === 'yes'}
                aria-label={`${statement.text} — Yes`}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                  ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-[var(--warning)]/50'}
                  ${userAnswer === 'yes'
                    ? showResult
                      ? statement.isCorrectYes
                        ? 'border-[var(--success)] bg-[var(--success)]/20 text-[var(--success)]'
                        : 'border-[var(--error)] bg-[var(--error)]/20 text-[var(--error)]'
                      : 'border-[var(--warning)] bg-[var(--warning)]/20 text-[var(--warning)]'
                    : showResult && statement.isCorrectYes
                      ? 'border-[var(--success)]/50 text-[var(--success)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
              >
                <span className="text-xs font-semibold">
                  {userAnswer === 'yes' ? '●' : '○'}
                </span>
              </button>
            </div>

            {/* No button */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => !disabled && onAnswer(statement.id, 'no')}
                disabled={disabled}
                role="radio"
                aria-checked={userAnswer === 'no'}
                aria-label={`${statement.text} — No`}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                  ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-[var(--warning)]/50'}
                  ${userAnswer === 'no'
                    ? showResult
                      ? !statement.isCorrectYes
                        ? 'border-[var(--success)] bg-[var(--success)]/20 text-[var(--success)]'
                        : 'border-[var(--error)] bg-[var(--error)]/20 text-[var(--error)]'
                      : 'border-[var(--warning)] bg-[var(--warning)]/20 text-[var(--warning)]'
                    : showResult && !statement.isCorrectYes
                      ? 'border-[var(--success)]/50 text-[var(--success)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
              >
                <span className="text-xs font-semibold">
                  {userAnswer === 'no' ? '●' : '○'}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
