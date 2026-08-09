import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Tag, BarChart2 } from 'lucide-react';
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
  // For drag-drop/matching: store as Record<itemId, categoryId>
  const [matchingAssignments, setMatchingAssignments] = useState<Record<string, string>>({});

  // Reset all local state when question changes
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
  }, [question.id]);

  const { progress, toggleBookmark } = useStore();
  const isBookmarked = progress.bookmarks.includes(question.id);

  const currentAnswer = selectedAnswer ?? localAnswer;

  const handleSingleSelect = (optionId: string) => {
    if (examMode) {
      onSubmit(optionId);
    } else {
      setLocalAnswer(optionId);
    }
  };

  const handleMultiToggle = (optionId: string) => {
    const current = (examMode ? selectedAnswer : localAnswer) as string[] || [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];

    if (examMode) {
      onSubmit(updated);
    } else {
      setLocalAnswer(updated);
    }
  };

  // Yes/No statements handler
  const handleYesNoAnswer = (statementId: string, value: 'yes' | 'no') => {
    const updated = { ...yesNoAnswers, [statementId]: value };
    setYesNoAnswers(updated);
    if (examMode) {
      // Serialize as JSON array of "statementId:yes|no"
      const encoded = Object.entries(updated).map(([id, v]) => `${id}:${v}`);
      onSubmit(encoded);
    }
  };

  // Dropdown select handler
  const handleDropdownSelect = (dropdownId: string, value: string) => {
    const updated = { ...dropdownAnswers, [dropdownId]: value };
    setDropdownAnswers(updated);
    if (examMode) {
      const encoded = Object.entries(updated).map(([id, v]) => `${id}:${v}`);
      onSubmit(encoded);
    }
  };

  // Ordering handler
  const handleReorder = (newOrder: string[]) => {
    setOrderState(newOrder);
    if (examMode) {
      onSubmit(newOrder);
    }
  };

  // Matching/drag-drop handler
  const handleMatchAssign = (itemId: string, categoryId: string) => {
    const updated = { ...matchingAssignments, [itemId]: categoryId };
    setMatchingAssignments(updated);
    if (examMode) {
      const encoded = Object.entries(updated).map(([id, cat]) => `${id}:${cat}`);
      onSubmit(encoded);
    }
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

  // Determine if submit button should be enabled
  const isSubmitEnabled = (): boolean => {
    if (question.type === 'yes-no-statements') {
      return question.statements ? Object.keys(yesNoAnswers).length === question.statements.length : false;
    }
    if (question.type === 'dropdown-select') {
      return question.dropdowns ? Object.keys(dropdownAnswers).length === question.dropdowns.length : false;
    }
    if (question.type === 'ordering') {
      return orderState.length > 0;
    }
    if (question.type === 'drag-drop') {
      return question.dragItems ? Object.keys(matchingAssignments).length === question.dragItems.length : false;
    }
    return localAnswer !== null && !(Array.isArray(localAnswer) && localAnswer.length === 0);
  };

  // Parse yes/no answers from selectedAnswer for review mode
  const getYesNoFromAnswer = (): Record<string, 'yes' | 'no'> => {
    if (showExplanation && selectedAnswer && Array.isArray(selectedAnswer)) {
      const result: Record<string, 'yes' | 'no'> = {};
      for (const entry of selectedAnswer) {
        const [id, val] = entry.split(':');
        if (id && (val === 'yes' || val === 'no')) result[id] = val;
      }
      return result;
    }
    return yesNoAnswers;
  };

  // Parse dropdown answers from selectedAnswer for review mode
  const getDropdownFromAnswer = (): Record<string, string> => {
    if (showExplanation && selectedAnswer && Array.isArray(selectedAnswer)) {
      const result: Record<string, string> = {};
      for (const entry of selectedAnswer) {
        const colonIdx = entry.indexOf(':');
        if (colonIdx > 0) {
          result[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
        }
      }
      return result;
    }
    return dropdownAnswers;
  };

  // Parse ordering from selectedAnswer for review mode
  const getOrderFromAnswer = (): string[] => {
    if (showExplanation && selectedAnswer && Array.isArray(selectedAnswer)) {
      return selectedAnswer;
    }
    return orderState;
  };

  // Parse matching from selectedAnswer for review mode
  const getMatchingFromAnswer = (): Record<string, string> => {
    if (showExplanation && selectedAnswer && Array.isArray(selectedAnswer)) {
      const result: Record<string, string> = {};
      for (const entry of selectedAnswer) {
        const colonIdx = entry.indexOf(':');
        if (colonIdx > 0) {
          result[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
        }
      }
      return result;
    }
    return matchingAssignments;
  };

  const difficultyColors: Record<string, string> = {
    easy: 'text-[var(--success)] bg-[var(--success)]/10',
    medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
    hard: 'text-[var(--error)] bg-[var(--error)]/10',
  };

  const typeLabels: Record<string, string> = {
    'single-choice': 'Single Choice',
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'yes-no-statements': 'Yes/No Statements',
    'dropdown-select': 'Dropdown Select',
    'ordering': 'Ordering',
    'drag-drop': 'Drag & Drop',
    'matching': 'Matching',
    'scenario': 'Scenario',
  };

  return (
    <div className="glass-card rounded-2xl p-4 lg:p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <Tag className="w-3 h-3" aria-hidden="true" />
            {question.topicId.replace(/-/g, ' ')}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <BarChart2 className="w-3 h-3" aria-hidden="true" />
            {typeLabels[question.type] || question.type}
          </span>
        </div>
        {!hideBookmark && (
          <button
            onClick={() => toggleBookmark(question.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-[var(--accent)]" />
            ) : (
              <Bookmark className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </button>
        )}
      </div>

      {/* Scenario text if any */}
      {question.scenarioText && (
        <div className="mb-4 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">Scenario</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{question.scenarioText}</p>
        </div>
      )}

      {/* Question text */}
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 leading-relaxed">
        {question.questionText}
      </h2>

      {/* Code snippet if any */}
      {question.codeSnippet && (
        <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 mb-4 overflow-x-auto text-sm text-[var(--text-primary)] font-mono">
          {question.codeSnippet}
        </pre>
      )}

      {/* Answer input */}
      <div className="mb-4">
        {question.type === 'single-choice' && (
          <SingleChoiceInput
            options={question.options}
            selectedAnswer={currentAnswer as string | null}
            showResult={showExplanation}
            onSelect={handleSingleSelect}
            disabled={showExplanation}
          />
        )}
        {question.type === 'multiple-choice' && (
          <MultipleChoiceInput
            options={question.options}
            selectedAnswers={(currentAnswer as string[]) || []}
            showResult={showExplanation}
            onToggle={handleMultiToggle}
            disabled={showExplanation}
          />
        )}
        {question.type === 'true-false' && (
          <TrueFalseInput
            options={question.options}
            selectedAnswer={currentAnswer as string | null}
            showResult={showExplanation}
            onSelect={handleSingleSelect}
            disabled={showExplanation}
          />
        )}
        {question.type === 'yes-no-statements' && question.statements && (
          <YesNoStatementsInput
            statements={question.statements}
            answers={getYesNoFromAnswer()}
            showResult={showExplanation}
            onAnswer={handleYesNoAnswer}
            disabled={showExplanation}
          />
        )}
        {question.type === 'dropdown-select' && question.dropdowns && (
          <DropdownSelectInput
            dropdowns={question.dropdowns}
            answers={getDropdownFromAnswer()}
            showResult={showExplanation}
            onSelect={handleDropdownSelect}
            disabled={showExplanation}
          />
        )}
        {question.type === 'ordering' && question.orderItems && (
          <OrderingInput
            orderItems={question.orderItems}
            currentOrder={getOrderFromAnswer()}
            showResult={showExplanation}
            onReorder={handleReorder}
            disabled={showExplanation}
          />
        )}
        {question.type === 'drag-drop' && question.dragCategories && question.dragItems && (
          <MatchingInput
            categories={question.dragCategories}
            items={question.dragItems}
            assignments={getMatchingFromAnswer()}
            showResult={showExplanation}
            onAssign={handleMatchAssign}
            disabled={showExplanation}
          />
        )}
      </div>

      {/* Submit button (study mode only) */}
      {!examMode && !showExplanation && (
        <button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled()}
          className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200
            bg-gradient-to-r from-[var(--accent)] to-blue-500 text-white hover:shadow-[0_0_24px_-4px_var(--glow)] btn-glow
            disabled:opacity-40 disabled:cursor-not-allowed
            min-h-[44px]"
        >
          Submit Answer
        </button>
      )}

      {/* Explanation panel */}
      {showExplanation && !examMode && (
        <ExplanationPanel
          explanation={question.explanation}
          isCorrect={isCorrect!}
          onNext={onNext}
        />
      )}
    </div>
  );
}
