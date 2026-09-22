import { KeyboardEvent } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
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

export function SingleChoiceInput({ options, selectedAnswer, showResult, onSelect, disabled }: Props) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label="Answer options">
      {options.map((option) => {
        const isSelected = selectedAnswer === option.id;
        let borderColor = 'rgba(148,163,184,0.15)';
        let bg = 'rgba(148,163,184,0.04)';
        let labelColor = '#a9b9d0';
        let dotBg = 'rgba(148,163,184,0.15)';
        let dotText = '#8ea2c2';

        if (showResult) {
          if (option.isCorrect) {
            borderColor = 'rgba(45,212,191,0.4)';
            bg = 'rgba(45,212,191,0.07)';
            labelColor = '#f0f4f8';
          } else if (isSelected && !option.isCorrect) {
            borderColor = 'rgba(255,107,107,0.4)';
            bg = 'rgba(255,107,107,0.07)';
            labelColor = '#f0f4f8';
          }
        } else if (isSelected) {
          borderColor = 'rgba(79,124,255,0.5)';
          bg = 'rgba(79,124,255,0.08)';
          labelColor = '#f0f4f8';
          dotBg = '#4f7cff';
          dotText = '#fff';
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
            aria-label={`Option ${option.id}: ${option.text}${showResult ? (option.isCorrect ? ' — correct' : isSelected ? ' — incorrect' : '') : ''}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
            style={{ width: '100%', textAlign: 'left', padding: '13px 16px', borderRadius: 12, border: `1px solid ${borderColor}`, background: bg, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s', minHeight: 48 }}
          >
            {/* Option letter */}
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: dotBg, color: dotText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all 0.15s' }}>
              {option.id}
            </span>
            <span style={{ fontSize: 14, color: labelColor, flex: 1, lineHeight: 1.5 }}>{option.text}</span>
            {/* Result icons — aria-hidden because result is encoded in the button aria-label */}
            {showResult && option.isCorrect && (
              <CheckCircle style={{ width: 16, height: 16, color: '#2dd4bf', flexShrink: 0 }} aria-hidden="true" />
            )}
            {showResult && isSelected && !option.isCorrect && (
              <XCircle style={{ width: 16, height: 16, color: '#ff6b6b', flexShrink: 0 }} aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
