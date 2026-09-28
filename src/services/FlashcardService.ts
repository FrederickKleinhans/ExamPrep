import { Question } from '../types';

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  source?: string;
}

function answersFor(question: Question): string[] | null {
  switch (question.type) {
    case 'single-choice':
    case 'true-false':
    case 'scenario': {
      const answers = question.options.filter((option) => option.isCorrect).map((option) => option.text.trim()).filter(Boolean);
      return answers.length > 0 ? answers : null;
    }
    case 'multiple-choice': {
      const answers = question.options.filter((option) => option.isCorrect).map((option) => option.text.trim()).filter(Boolean);
      return answers.length > 0 ? answers : null;
    }
    case 'yes-no-statements':
      return question.statements?.length
        ? question.statements.map((statement) => `${statement.text} — ${statement.isCorrectYes ? 'Yes' : 'No'}`)
        : null;
    case 'dropdown-select':
      return question.dropdowns?.length
        ? question.dropdowns.map((dropdown) => `${dropdown.prompt}: ${dropdown.correctAnswer}`)
        : null;
    case 'ordering': {
      const ordered = question.orderItems?.length
        ? [...question.orderItems].sort((left, right) => left.correctPosition - right.correctPosition)
        : [];
      if (!ordered.length || ordered.some((item) => !item.text.trim())) return null;
      return ordered.map((item, index) => `${index + 1}. ${item.text.trim()}`);
    }
    case 'drag-drop':
    case 'matching': {
      const items = question.dragItems ?? [];
      const categories = question.dragCategories ?? [];
      if (!items.length || !categories.length) return null;
      const categoryByItem = new Map<string, string>();
      for (const category of categories) {
        for (const itemId of category.acceptsItemIds) {
          if (categoryByItem.has(itemId)) return null;
          categoryByItem.set(itemId, category.name.trim());
        }
      }
      if (items.some((item) => !categoryByItem.get(item.id) || !item.text.trim())) return null;
      return items.map((item) => `${item.text.trim()} — ${categoryByItem.get(item.id)}`);
    }
    default:
      return null;
  }
}

export function createFlashcards(questions: Question[]): Flashcard[] {
  return questions.flatMap((question) => {
    const questionText = question.questionText.trim();
    const answers = answersFor(question);
    if (!questionText || !answers?.length || answers.some((answer) => !answer.trim())) return [];

    const context = [question.scenarioText?.trim(), question.codeSnippet?.trim()]
      .filter((value): value is string => Boolean(value));
    const front = [...context, questionText].join('\n\n');
    const correctExplanation = question.explanation.correct.trim();
    const examTip = question.explanation.examTip.trim();
    const explanation = [correctExplanation, examTip && `Exam tip: ${examTip}`].filter(Boolean);
    const back = [
      answers.map((answer) => `- ${answer}`).join('\n'),
      ...explanation,
    ].join('\n\n');
    const source = question.metadata.references.find((reference) => reference.trim())
      ?? (question.metadata.examObjective || undefined);

    return [{ id: question.id, topicId: question.topicId, front, back, source }];
  });
}
