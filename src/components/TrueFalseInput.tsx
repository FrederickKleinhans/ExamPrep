import { KeyboardEvent } from 'react';
import { Option } from '../types';

interface Props {
  options: Option[];
  selectedAnswer: string | null;
  showResult: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

function moveRadioFocus(currentButton: HTMLButtonElement, direction: 'next' | 'prev' | 'first' | 'last') {
  const radioGroup = currentButton.closest('[role="radiogroup"]');
  if (!radioGroup) return;

  const buttons = Array.from(
    radioGroup.querySelectorAll<HTMLButtonElement>('button[role="radio"]'),
  );
  if (!buttons.length) return;

  const currentIndex = buttons.indexOf(currentButton);
  if (currentIndex === -1) return;

  let nextIndex = currentIndex;
  if (direction === 'next') nextIndex = (currentIndex + 1) % buttons.length;
  if (direction === 'prev') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
  if (direction === 'first') nextIndex = 0;
  if (direction === 'last') nextIndex = buttons.length - 1;

  buttons[nextIndex]?.focus();
}

export function TrueFalseInput({ options, selectedAnswer, showResult, onSelect, disabled }: Props) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionId: string) => {
    if (disabled) return;

    const key = event.key;
    const isDirectionKey = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(key);
    const isActivationKey = key === ' ' || key === 'Enter';

    if (isDirectionKey || isActivationKey) {
      event.preventDefault();
    }

    if (isActivationKey) {
      onSelect(optionId);
      return;
    }

    if (key === 'ArrowRight' || key === 'ArrowDown') {
      moveRadioFocus(event.currentTarget, 'next');
      return;
    }

    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      moveRadioFocus(event.currentTarget, 'prev');
      return;
    }

    if (key === 'Home') {
      moveRadioFocus(event.currentTarget, 'first');
      return;
    }

    if (key === 'End') {
      moveRadioFocus(event.currentTarget, 'last');
    }
  };

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
            type="button"
            onClick={() => !disabled && onSelect(option.id)}
            onKeyDown={(event) => handleKeyDown(event, option.id)}
            disabled={disabled}
            role="radio"
            aria-checked={isSelected}
            aria-label={option.text}
            className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
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
