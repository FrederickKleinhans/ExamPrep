import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Question } from '../types';
import { SingleChoiceInput } from './SingleChoiceInput';
import { MultipleChoiceInput } from './MultipleChoiceInput';
import { TrueFalseInput } from './TrueFalseInput';
import { YesNoStatementsInput } from './YesNoStatementsInput';
import { DropdownSelectInput } from './DropdownSelectInput';
import { OrderingInput } from './OrderingInput';
import { MatchingInput } from './MatchingInput';
import { ExplanationPanel } from './ExplanationPanel';
import { useStore } from '../store/useStore';
import { ProgressService } from '../services/ProgressService';

interface Props {
  question: Question;
  showExplanation: boolean;
  selectedAnswer: string | string[] | null;
  isCorrect: boolean | null;
  onSubmit: (answer: string | string[]) => void;
  onNext?: () => void;
  hideBookmark?: boolean;
  examMode?: boolean;
}

const difficultyStyle: Record<string, { color: string; bg: string }> = {
  easy: { color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
  medium: { color: '#ffae00', bg: 'rgba(255,174,0,0.1)' },
  hard: { color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
};

const typeLabels: Record<string, string> = {
  'single-choice': 'Single choice',
  'multiple-choice': 'Multiple choice',
  'true-false': 'True / False',
  'yes-no-statements': 'Yes / No',
  'dropdown-select': 'Dropdown',
  'ordering': 'Ordering',
  'drag-drop': 'Drag & drop',
  'matching': 'Matching',
  'scenario': 'Scenario',
};

export function QuestionCard({
  question,
  showExplanation,
  selectedAnswer,
  isCorrect,
  onSubmit,
  onNext,
  hideBookmark = false,
  examMode = false,
}: Props) {
  const [localAnswer, setLocalAnswer] = useState<string | string[] | null>(null);
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, 'yes' | 'no'>>({});
  const [dropdownAnswers, setDropdownAnswers] = useState<Record<string, string>>({});
  const [orderState, setOrderState] = useState<string[]>(
    question.orderItems
      ? [...question.orderItems].sort(() => Math.random() - 0.5).map((i) => i.id)
      : []
  );
  const [matchingAssignments, setMatchingAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalAnswer(null);
    setYesNoAnswers({});
    setDropdownAnswers({});
    if (question.orderItems) {
      setOrderState([...question.orderItems].sort(() => Math.random() - 0.5).map((i) => i.id));
    } else {
      setOrderState([]);
    }
    setMatchingAssignments({});
  }, [question.id, question.orderItems]);

  const { progress, toggleBookmark } = useStore();
  const isBookmarked = ProgressService
    .getCertificationProgress(progress, progress.selectedCertification)
    .bookmarks.includes(question.id);

  const currentAnswer = selectedAnswer ?? localAnswer;
  const ds = difficultyStyle[question.difficulty] ?? difficultyStyle.medium;

  const handleSingleSelect = (optionId: string) => {
    if (examMode) onSubmit(optionId);
    else setLocalAnswer(optionId);
  };

  const handleMultiToggle = (optionId: string) => {
    const current = (examMode ? selectedAnswer : localAnswer) as string[] || [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    if (examMode) onSubmit(updated);
    else setLocalAnswer(updated);
  };

  const handleYesNoAnswer = (statementId: string, value: 'yes' | 'no') => {
    const updated = { ...yesNoAnswers, [statementId]: value };
    setYesNoAnswers(updated);
    if (examMode) onSubmit(Object.entries(updated).map(([id, v]) => `${id}:${v}`));
  };

  const handleDropdownSelect = (dropdownId: string, value: string) => {
    const updated = { ...dropdownAnswers, [dropdownId]: value };
    setDropdownAnswers(updated);
    if (examMode) onSubmit(Object.entries(updated).map(([id, v]) => `${id}:${v}`));
  };

  const handleReorder = (newOrder: string[]) => {
    setOrderState(newOrder);
    if (examMode) onSubmit(newOrder);
  };

  const handleMatchAssign = (itemId: string, categoryId: string) => {
    const updated = { ...matchingAssignments, [itemId]: categoryId };
    setMatchingAssignments(updated);
    if (examMode) onSubmit(Object.entries(updated).map(([id, cat]) => `${id}:${cat}`));
  };

  const handleSubmit = () => {
    if (question.type === 'yes-no-statements') {
      const encoded = Object.entries(yesNoAnswers).map(([id, v]) => `${id}:${v}`);
      if (encoded.length > 0) onSubmit(encoded);
    } else if (question.type === 'dropdown-select') {
      const encoded = Object.entries(dropdownAnswers).map(([id, v]) => `${id}:${v}`);
      if (encoded.length > 0) onSubmit(encoded);
    } else if (question.type === 'ordering') {
      if (orderState.length > 0) onSubmit(orderState);
    } else if (question.type === 'drag-drop') {
      const encoded = Object.entries(matchingAssignments).map(([id, cat]) => `${id}:${cat}`);
      if (encoded.length > 0) onSubmit(encoded);
    } else if (localAnswer !== null) {
      onSubmit(localAnswer);
    }
  };

  const isSubmitEnabled = (): boolean => {
    if (question.type === 'yes-no-statements') return question.statements ? Object.keys(yesNoAnswers).length === question.statements.length : false;
    if (question.type === 'dropdown-select') return question.dropdowns ? Object.keys(dropdownAnswers).length === question.dropdowns.length : false;
    if (question.type === 'ordering') return orderState.length > 0;
    if (question.type === 'drag-drop') return question.dragItems ? Object.keys(matchingAssignments).length === question.dragItems.length : false;
    return localAnswer !== null && !(Array.isArray(localAnswer) && localAnswer.length === 0);
  };

  const getYesNoFromAnswer = (): Record<string, 'yes' | 'no'> => {
    if (showExplanation && selectedAnswer && Array.isArray(selectedAnswer)) {
      const result: Record<string, 'yes' | 'no'> = {};
      for (const entry of selectedAnswer) {
        const [id, val] = entry.split(':');
        if (id && (val === 'yes' || val === 'no')) result[id] = val as 'yes' | 'no';
      }
      return result;
    }
    return yesNoAnswers;
  };

  const getDropdownFromAnswer = (): Record<string, string> => {
    if (showExplanation && selectedAnswer && Array.isArray(selectedAnswer)) {
      const result: Record<string, string> = {};
      for (const entry of selectedAnswer) {
        const colonIdx = entry.indexOf(':');
        if (colonIdx > 0) result[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
      }
      return result;
    }
    return dropdownAnswers;
  };

  const getOrderFromAnswer = (): string[] =>
    showExplanation && selectedAnswer && Array.isArray(selectedAnswer) ? selectedAnswer : orderState;

  const getMatchingFromAnswer = (): Record<string, string> => {
    if (showExplanation && selectedAnswer && Array.isArray(selectedAnswer)) {
      const result: Record<string, string> = {};
      for (const entry of selectedAnswer) {
        const colonIdx = entry.indexOf(':');
        if (colonIdx > 0) result[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
      }
      return result;
    }
    return matchingAssignments;
  };

  return (
    <div style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.85), rgba(15,23,35,0.75))', border: '1px solid rgba(148,163,184,0.13)', borderRadius: 22, padding: '24px 24px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle top glow */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(79,124,255,0.3), transparent)' }} />

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: ds.bg, color: ds.color, textTransform: 'capitalize' }}>
            {question.difficulty}
          </span>
          <span style={{ fontSize: 11, color: '#8ea2c2', background: 'rgba(148,163,184,0.07)', padding: '3px 9px', borderRadius: 999 }}>
            {typeLabels[question.type] ?? question.type}
          </span>
          <span style={{ fontSize: 11, color: '#8ea2c2' }}>
            {question.topicId.replace(/-/g, ' ')}
          </span>
        </div>
        {!hideBookmark && (
          <button
            onClick={() => toggleBookmark(question.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: isBookmarked ? '#4f7cff' : '#8ea2c2', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 }}
          >
            {isBookmarked
              ? <BookmarkCheck style={{ width: 18, height: 18 }} />
              : <Bookmark style={{ width: 18, height: 18 }} />
            }
          </button>
        )}
      </div>

      {/* Scenario */}
      {question.scenarioText && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12 }}>
          <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8ea2c2' }}>Scenario</p>
          <p style={{ margin: 0, fontSize: 13, color: '#a9b9d0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{question.scenarioText}</p>
        </div>
      )}

      {/* Question text */}
      <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#f0f4f8', lineHeight: 1.5 }}>
        {question.questionText}
      </h2>

      {/* Code snippet */}
      {question.codeSnippet && (
        <pre style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, overflowX: 'auto', fontSize: 13, color: '#a9b9d0', fontFamily: 'monospace', lineHeight: 1.6 }}>
          {question.codeSnippet}
        </pre>
      )}

      {/* Answer input */}
      <div style={{ marginBottom: 16 }}>
        {question.type === 'single-choice' && (
          <SingleChoiceInput options={question.options} selectedAnswer={currentAnswer as string | null} showResult={showExplanation} onSelect={handleSingleSelect} disabled={showExplanation} />
        )}
        {question.type === 'multiple-choice' && (
          <MultipleChoiceInput options={question.options} selectedAnswers={(currentAnswer as string[]) || []} showResult={showExplanation} onToggle={handleMultiToggle} disabled={showExplanation} />
        )}
        {question.type === 'true-false' && (
          <TrueFalseInput options={question.options} selectedAnswer={currentAnswer as string | null} showResult={showExplanation} onSelect={handleSingleSelect} disabled={showExplanation} />
        )}
        {question.type === 'yes-no-statements' && question.statements && (
          <YesNoStatementsInput statements={question.statements} answers={getYesNoFromAnswer()} showResult={showExplanation} onAnswer={handleYesNoAnswer} disabled={showExplanation} />
        )}
        {question.type === 'dropdown-select' && question.dropdowns && (
          <DropdownSelectInput dropdowns={question.dropdowns} answers={getDropdownFromAnswer()} showResult={showExplanation} onSelect={handleDropdownSelect} disabled={showExplanation} />
        )}
        {question.type === 'ordering' && question.orderItems && (
          <OrderingInput orderItems={question.orderItems} currentOrder={getOrderFromAnswer()} showResult={showExplanation} onReorder={handleReorder} disabled={showExplanation} />
        )}
        {question.type === 'drag-drop' && question.dragCategories && question.dragItems && (
          <MatchingInput categories={question.dragCategories} items={question.dragItems} assignments={getMatchingFromAnswer()} showResult={showExplanation} onAssign={handleMatchAssign} disabled={showExplanation} />
        )}
      </div>

      {/* Submit button — study mode */}
      {!examMode && !showExplanation && (
        <button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled()}
          style={{ width: '100%', background: isSubmitEnabled() ? 'linear-gradient(135deg, #4f7cff, #3568e8)' : 'rgba(148,163,184,0.1)', border: 'none', borderRadius: 14, padding: '13px', color: isSubmitEnabled() ? '#fff' : '#8ea2c2', fontWeight: 700, fontSize: 14, cursor: isSubmitEnabled() ? 'pointer' : 'not-allowed', boxShadow: isSubmitEnabled() ? '0 12px 28px rgba(79,124,255,0.3)' : 'none', transition: 'all 0.2s' }}
        >
          Submit answer
        </button>
      )}

      {/* Explanation */}
      {showExplanation && !examMode && (
        <ExplanationPanel explanation={question.explanation} isCorrect={isCorrect!} onNext={onNext} />
      )}
    </div>
  );
}
