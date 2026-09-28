import { describe, expect, it } from 'vitest';
import { Question } from '../../types';
import { createFlashcards } from '../FlashcardService';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'question-1',
    type: 'single-choice',
    topicId: 'topic-1',
    difficulty: 'easy',
    points: 1,
    questionText: 'What is the answer?',
    options: [
      { id: 'wrong', text: 'Wrong', isCorrect: false },
      { id: 'right', text: 'Right', isCorrect: true },
    ],
    explanation: { correct: 'Because it is correct.', incorrect: '', examTip: 'Remember this.', relatedTopics: [] },
    metadata: { examObjective: 'Objective 1', references: ['https://example.com/source'], lastUpdated: '' },
    ...overrides,
  };
}

describe('createFlashcards', () => {
  it('creates choice cards with only correct answers, context, explanation, and source', () => {
    const card = createFlashcards([makeQuestion({
      scenarioText: 'A company needs a resilient design.',
      codeSnippet: 'deploy --zone 1',
    })])[0];

    expect(card).toMatchObject({
      id: 'question-1',
      topicId: 'topic-1',
      front: 'A company needs a resilient design.\n\ndeploy --zone 1\n\nWhat is the answer?',
      back: '- Right\n\nBecause it is correct.\n\nExam tip: Remember this.',
      source: 'https://example.com/source',
    });
    expect(card?.back).not.toContain('Wrong');
  });

  it('formats statement, dropdown, ordering, and categorized-answer types', () => {
    const questions = [
      makeQuestion({
        id: 'statements',
        type: 'yes-no-statements',
        options: [],
        statements: [
          { id: 's1', text: 'First statement', isCorrectYes: true },
          { id: 's2', text: 'Second statement', isCorrectYes: false },
        ],
      }),
      makeQuestion({
        id: 'dropdown',
        type: 'dropdown-select',
        options: [],
        dropdowns: [{ id: 'd1', prompt: 'The service is', options: ['managed', 'local'], correctAnswer: 'managed' }],
      }),
      makeQuestion({
        id: 'ordering',
        type: 'ordering',
        options: [],
        orderItems: [
          { id: 'second', text: 'Second step', correctPosition: 2 },
          { id: 'first', text: 'First step', correctPosition: 1 },
        ],
      }),
      makeQuestion({
        id: 'drag-drop',
        type: 'drag-drop',
        options: [],
        dragItems: [{ id: 'vm', text: 'Virtual machine' }],
        dragCategories: [{ id: 'iaas', name: 'IaaS', acceptsItemIds: ['vm'] }],
      }),
    ];

    expect(createFlashcards(questions).map((card) => card.back)).toEqual([
      '- First statement — Yes\n- Second statement — No\n\nBecause it is correct.\n\nExam tip: Remember this.',
      '- The service is: managed\n\nBecause it is correct.\n\nExam tip: Remember this.',
      '- 1. First step\n- 2. Second step\n\nBecause it is correct.\n\nExam tip: Remember this.',
      '- Virtual machine — IaaS\n\nBecause it is correct.\n\nExam tip: Remember this.',
    ]);
  });

  it('formats scenario and matching questions with supported answer data', () => {
    const scenario = makeQuestion({
      type: 'scenario',
      scenarioText: 'A user reports an issue.',
    });
    const matching = makeQuestion({
      type: 'matching',
      options: [],
      dragItems: [{ id: 'dns', text: 'DNS' }],
      dragCategories: [{ id: 'name-resolution', name: 'Name resolution', acceptsItemIds: ['dns'] }],
    });

    expect(createFlashcards([scenario, matching])).toHaveLength(2);
    expect(createFlashcards([matching])[0]?.back).toContain('DNS — Name resolution');
  });

  it('skips malformed or unsupported questions rather than creating incomplete cards', () => {
    const noCorrectAnswer = makeQuestion({ options: [{ id: 'wrong', text: 'Wrong', isCorrect: false }] });
    const malformedMapping = makeQuestion({
      type: 'drag-drop',
      options: [],
      dragItems: [{ id: 'unmapped', text: 'Unmapped item' }],
      dragCategories: [],
    });
    const unsupported = makeQuestion({ type: 'scenario', options: [] });

    expect(createFlashcards([
      noCorrectAnswer,
      malformedMapping,
      unsupported,
      makeQuestion({ id: 'valid' }),
    ]).map((card) => card.id)).toEqual(['valid']);
  });
});
