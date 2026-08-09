import { Option } from '../types';

interface Props {
  options: Option[];
  selectedAnswers: string[];
  showResult: boolean;
  onToggle: (optionId: string) => void;
  disabled?: boolean;
}

export function MultipleChoiceInput({ options, selectedAnswers, showResult, onToggle, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3" role="group" aria-label="Select all that apply">
      <p className="text-sm text-[var(--text-secondary)] italic mb-1">Select all that apply</p>
      {options.map((option) => {
        const isSelected = selectedAnswers.includes(option.id);
        let borderClass = 'border-[var(--border)]';
        let bgClass = 'bg-[var(--bg-secondary)]';

        if (showResult) {
          if (option.isCorrect) {
            borderClass = 'border-[var(--success)]';
            bgClass = 'bg-[var(--success)]/10';
          } else if (isSelected && !option.isCorrect) {
            borderClass = 'border-[var(--error)]';
            bgClass = 'bg-[var(--error)]/10';
          }
        } else if (isSelected) {
          borderClass = 'border-[var(--accent)]';
          bgClass = 'bg-[var(--accent)]/10';
        }

        return (
          <button
            key={option.id}
            onClick={() => !disabled && onToggle(option.id)}
            disabled={disabled}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`Option ${option.id}: ${option.text}`}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 
              ${borderClass} ${bgClass}
              ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-[var(--accent)]/50'}
              min-h-[44px] flex items-center gap-3`}
          >
            <span className={`w-7 h-7 rounded-md border-2 flex items-center justify-center shrink-0 text-sm font-semibold
              ${isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]' : 'border-[var(--text-secondary)] text-[var(--text-secondary)]'}`}>
              {isSelected ? '✓' : option.id}
            </span>
            <span className="text-[var(--text-primary)] text-sm">{option.text}</span>
            {showResult && option.isCorrect && (
              <span className="ml-auto text-[var(--success)] text-xs font-medium">✓</span>
            )}
            {showResult && isSelected && !option.isCorrect && (
              <span className="ml-auto text-[var(--error)] text-xs font-medium">✗</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
