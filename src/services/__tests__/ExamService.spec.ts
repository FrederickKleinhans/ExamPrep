import { describe, it, expect, vi } from 'vitest';
import { ExamService } from '../ExamService';
import type { Question } from '../../types';

function makeQuestion(id: string): Question {
  return {
    id,
    type: 'single-choice',
    topicId: 't1',
    difficulty: 'easy',
    points: 1,
    questionText: id,
    options: [{ id: 'a', text: 'A', isCorrect: true }],
    explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
    metadata: { examObjective: '', references: ['https://example.com'], lastUpdated: '' },
  };
}

describe('ExamService.createSession', () => {
  it('selects the requested number of unique questions without mutating the bank', () => {
    const questions = ['q1', 'q2', 'q3', 'q4', 'q5'].map(makeQuestion);
    const originalOrder = questions.map((question) => question.id);
    const session = ExamService.createSession('az-900', questions, 60, 3);
    const selectedIds = session.questions.map((question) => question.id);

    expect(session.questions).toHaveLength(3);
    expect(new Set(selectedIds).size).toBe(3);
    expect(selectedIds.every((id) => originalOrder.includes(id))).toBe(true);
    expect(questions.map((question) => question.id)).toEqual(originalOrder);
  });

  it('uses Fisher–Yates swaps for a predictable seeded shuffle', () => {
    const randomValues = [0, 0, 0, 0];
    vi.spyOn(Math, 'random').mockImplementation(() => randomValues.shift() ?? 0);

    try {
      const shuffled = ExamService.shuffleQuestions(['q1', 'q2', 'q3', 'q4']);
      expect(shuffled).toEqual(['q2', 'q3', 'q4', 'q1']);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('returns the whole bank when the requested count exceeds available questions', () => {
    const questions = ['q1', 'q2'].map(makeQuestion);
    const session = ExamService.createSession('az-900', questions, 60, 10);

    expect(session.questions).toHaveLength(2);
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(2);
  });
});

describe('ExamService.calculateQuestionPoints', () => {
  it('scores single-choice and true-false as 1/1', () => {
    const q: Question = {
      id: 'q1',
      type: 'single-choice',
      topicId: 't1',
      difficulty: 'easy',
      points: 1,
      questionText: 'Which?',
      options: [
        { id: 'a', text: 'A', isCorrect: false },
        { id: 'b', text: 'B', isCorrect: true },
      ],
      explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
      metadata: { examObjective: '', references: [], lastUpdated: '' },
    };

    expect(ExamService.calculateQuestionPoints(q, 'b')).toEqual({ earned: 1, total: 1 });
    expect(ExamService.calculateQuestionPoints(q, 'a')).toEqual({ earned: 0, total: 1 });
  });

  it('scores multiple-choice per-selection', () => {
    const q: Question = {
      id: 'q2',
      type: 'multiple-choice',
      topicId: 't1',
      difficulty: 'medium',
      points: 2,
      questionText: 'Select all that apply',
      options: [
        { id: 'a', text: 'A', isCorrect: true },
        { id: 'b', text: 'B', isCorrect: false },
        { id: 'c', text: 'C', isCorrect: true },
      ],
      explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
      metadata: { examObjective: '', references: [], lastUpdated: '' },
    };

    expect(ExamService.calculateQuestionPoints(q, ['a', 'c'])).toEqual({ earned: 2, total: 2 });
    expect(ExamService.calculateQuestionPoints(q, ['a'])).toEqual({ earned: 1, total: 2 });
    expect(ExamService.calculateQuestionPoints(q, ['b'])).toEqual({ earned: 0, total: 2 });
  });

  it('scores yes-no-statements per statement', () => {
    const q: Question = {
      id: 'q3',
      type: 'yes-no-statements',
      topicId: 't1',
      difficulty: 'medium',
      points: 3,
      questionText: 'Statements',
      statements: [
        { id: 's1', text: 's1', isCorrectYes: true },
        { id: 's2', text: 's2', isCorrectYes: false },
        { id: 's3', text: 's3', isCorrectYes: true },
      ],
      options: [],
      explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
      metadata: { examObjective: '', references: [], lastUpdated: '' },
    };

    const allCorrect = ['s1:yes', 's2:no', 's3:yes'];
    const oneWrong = ['s1:yes', 's2:yes', 's3:yes'];

    expect(ExamService.calculateQuestionPoints(q, allCorrect)).toEqual({ earned: 3, total: 3 });
    expect(ExamService.calculateQuestionPoints(q, oneWrong)).toEqual({ earned: 2, total: 3 });
  });

  it('scores dropdown-select per dropdown', () => {
    const q: Question = {
      id: 'q4',
      type: 'dropdown-select',
      topicId: 't1',
      difficulty: 'easy',
      points: 2,
      questionText: 'Fill blanks',
      dropdowns: [
        { id: 'd1', prompt: 'p1', options: ['x', 'y'], correctAnswer: 'x' },
        { id: 'd2', prompt: 'p2', options: ['a', 'b'], correctAnswer: 'b' },
      ],
      options: [],
      explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
      metadata: { examObjective: '', references: [], lastUpdated: '' },
    };

    expect(ExamService.calculateQuestionPoints(q, ['d1:x', 'd2:b'])).toEqual({ earned: 2, total: 2 });
    expect(ExamService.calculateQuestionPoints(q, ['d1:x', 'd2:a'])).toEqual({ earned: 1, total: 2 });
  });

  it('scores ordering per item position', () => {
    const q: Question = {
      id: 'q5',
      type: 'ordering',
      topicId: 't1',
      difficulty: 'medium',
      points: 3,
      questionText: 'Order',
      orderItems: [
        { id: 'o1', text: '1', correctPosition: 1 },
        { id: 'o2', text: '2', correctPosition: 2 },
        { id: 'o3', text: '3', correctPosition: 3 },
      ],
      options: [],
      explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
      metadata: { examObjective: '', references: [], lastUpdated: '' },
    };

    expect(ExamService.calculateQuestionPoints(q, ['o1', 'o2', 'o3'])).toEqual({ earned: 3, total: 3 });
    expect(ExamService.calculateQuestionPoints(q, ['o2', 'o1', 'o3'])).toEqual({ earned: 1, total: 3 });
  });

  it('scores drag-drop per item placement', () => {
    const q: Question = {
      id: 'q6',
      type: 'drag-drop',
      topicId: 't1',
      difficulty: 'medium',
      points: 3,
      questionText: 'Place items',
      dragCategories: [
        { id: 'c1', name: 'A', acceptsItemIds: ['i1', 'i2'] },
        { id: 'c2', name: 'B', acceptsItemIds: ['i3'] },
      ],
      dragItems: [
        { id: 'i1', text: 'i1' },
        { id: 'i2', text: 'i2' },
        { id: 'i3', text: 'i3' },
      ],
      options: [],
      explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
      metadata: { examObjective: '', references: [], lastUpdated: '' },
    };

    const correct = ['i1:c1', 'i2:c1', 'i3:c2'];
    const oneWrong = ['i1:c1', 'i2:c2', 'i3:c2'];

    expect(ExamService.calculateQuestionPoints(q, correct)).toEqual({ earned: 3, total: 3 });
    expect(ExamService.calculateQuestionPoints(q, oneWrong)).toEqual({ earned: 2, total: 3 });
  });
});
