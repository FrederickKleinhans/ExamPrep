import { DropdownQuestion } from '../types';

interface Props {
  dropdowns: DropdownQuestion[];
  answers: Record<string, string>;
  showResult: boolean;
  onSelect: (dropdownId: string, value: string) => void;
  disabled?: boolean;
}

export function DropdownSelectInput({ dropdowns, answers, showResult, onSelect, disabled }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)] italic">
        Select the correct option for each dropdown to complete the statement.
      </p>
      {dropdowns.map((dropdown) => {
        const userAnswer = answers[dropdown.id] || '';
        const isCorrect = userAnswer === dropdown.correctAnswer;

        return (
          <div key={dropdown.id} className="flex flex-wrap items-center gap-2">
            <span className="text-base text-[var(--text-primary)]">{dropdown.prompt}</span>
            <div className="relative inline-block">
              <select
                value={userAnswer}
                onChange={(e) => !disabled && onSelect(dropdown.id, e.target.value)}
                disabled={disabled}
                aria-label={`Select answer for: ${dropdown.prompt}`}
                className={`appearance-none px-4 py-2 pr-8 rounded-lg border-2 text-base font-medium
                  min-h-[44px] min-w-[180px] cursor-pointer
                  bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                  focus:outline-none focus:border-[var(--accent)]
                  ${disabled ? 'cursor-default opacity-80' : ''}
                  ${showResult
                    ? isCorrect && userAnswer
                      ? 'border-[var(--success)] bg-[var(--success)]/10'
                      : userAnswer
                        ? 'border-[var(--error)] bg-[var(--error)]/10'
                        : 'border-[var(--border)]'
                    : userAnswer
                      ? 'border-[var(--accent)]'
                      : 'border-[var(--border)]'
                  }`}
              >
                <option value="">— Select —</option>
                {dropdown.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {showResult && userAnswer && !isCorrect && (
              <span className="text-xs text-[var(--success)] font-medium">
                Correct: {dropdown.correctAnswer}
              </span>
            )}
            {showResult && userAnswer && isCorrect && (
              <span className="text-xs text-[var(--success)]">✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
