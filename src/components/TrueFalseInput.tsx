import { Option } from '../types';

interface Props {
  options: Option[];
  selectedAnswer: string | null;
  showResult: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function TrueFalseInput({ options, selectedAnswer, showResult, onSelect, disabled }: Props) {
  return (
    <div className="flex gap-4" role="radiogroup" aria-label="True or False">
      {options.map((option) => {
        const isSelected = selectedAnswer === option.id;
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
          borderClass = 'border-[var(--warning)]';
          bgClass = 'bg-[var(--warning)]/10';
        }

        return (
          <button
            key={option.id}
            onClick={() => !disabled && onSelect(option.id)}
            disabled={disabled}
            role="radio"
            aria-checked={isSelected}
            aria-label={option.text}
            className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all duration-200 text-center
              ${borderClass} ${bgClass}
              ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-[var(--warning)]/50'}
              min-h-[44px] font-semibold text-lg`}
          >
            <span className={isSelected ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}>
              {option.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
