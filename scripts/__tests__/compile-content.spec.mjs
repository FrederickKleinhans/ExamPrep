// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi } from 'vitest';
import { validateCertification } from '../validate-content.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(dir, 'fixtures');

async function loadFixture(folder, file) {
  const raw = await readFile(join(fixturesDir, folder, file), 'utf8');
  return JSON.parse(raw);
}

// ── Valid fixture ────────────────────────────────────────────────────────────

describe('validateCertification — valid fixture', () => {
  it('passes without throwing for a well-formed certification and question bank', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    expect(() => validateCertification(cert, questions, 'valid')).not.toThrow();
  });
});

// ── Required field errors ────────────────────────────────────────────────────

describe('validateCertification — missing required fields', () => {
  it('throws when id is missing', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const { id: _removed, ...certWithoutId } = cert;
    expect(() => validateCertification(certWithoutId, questions, 'test')).toThrow(/missing required field: id/);
  });

  it('throws when questionCount is missing', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const { questionCount: _removed, ...certWithout } = cert;
    expect(() => validateCertification(certWithout, questions, 'test')).toThrow(/missing required field: questionCount/);
  });
});

// ── Topic weight errors ──────────────────────────────────────────────────────

describe('validateCertification — topic weight validation', () => {
  it('throws when topic weights do not sum to 100', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badCert = { ...cert, topics: [{ id: 'topic-a', name: 'A', weight: 50 }, { id: 'topic-b', name: 'B', weight: 30 }] };
    expect(() => validateCertification(badCert, questions, 'test')).toThrow(/sum to 100/);
  });

  describe('validateCertification — topic coverage', () => {
    it('throws when a certification topic has no questions', async () => {
      const cert = await loadFixture('valid', 'certification.json');
      const questions = await loadFixture('valid', 'questions.json');
      const badQuestions = {
        ...questions,
        questions: questions.questions.filter((question) => question.topicId !== 'topic-b'),
      };
      expect(() => validateCertification(cert, badQuestions, 'test')).toThrow(/topic "topic-b" has no questions/);
    });

    it('warns when a large bank is heavily unbalanced against topic weights', async () => {
      const cert = await loadFixture('valid', 'certification.json');
      const questions = await loadFixture('valid', 'questions.json');
      const bank = {
        ...questions,
        questions: Array.from({ length: 40 }, (_, index) => ({
          ...questions.questions[0],
          id: `question-${index}`,
          topicId: index === 0 ? 'topic-b' : 'topic-a',
        })),
      };
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => validateCertification({ ...cert, questionCount: 40 }, bank, 'test')).not.toThrow();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('topic "topic-b" has 1 questions'));
      warn.mockRestore();
    });
  });

  it('throws when a topic has a zero weight', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badCert = { ...cert, topics: [{ id: 'topic-a', name: 'A', weight: 0 }, { id: 'topic-b', name: 'B', weight: 100 }] };
    expect(() => validateCertification(badCert, questions, 'test')).toThrow(/positive/);
  });
});

// ── Question count mismatch ──────────────────────────────────────────────────

describe('validateCertification — question count', () => {
  it('throws when questionCount does not match the actual number of questions', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badCert = { ...cert, questionCount: 99 };
    expect(() => validateCertification(badCert, questions, 'test')).toThrow(/questionCount is 99/);
  });

  it('throws when certificationId in questions does not match cert id', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badQuestions = { ...questions, certificationId: 'wrong-id' };
    expect(() => validateCertification(cert, badQuestions, 'test')).toThrow(/does not match/);
  });
});

// ── Duplicate question IDs ───────────────────────────────────────────────────

describe('validateCertification — duplicate question ids', () => {
  it('throws on duplicate question IDs', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badQuestions = {
      ...questions,
      questionCount: 2,
      questions: [questions.questions[0], { ...questions.questions[0] }], // same id twice
    };
    const badCert = { ...cert, questionCount: 2 };
    expect(() => validateCertification(badCert, badQuestions, 'test')).toThrow(/duplicate question id/);
  });
});

// ── Unknown topic reference ──────────────────────────────────────────────────

describe('validateCertification — unknown topic reference', () => {
  it('throws when a question references a topic not defined in the cert', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badQuestions = {
      ...questions,
      questions: [{ ...questions.questions[0], topicId: 'nonexistent-topic' }, questions.questions[1]],
    };
    expect(() => validateCertification(cert, badQuestions, 'test')).toThrow(/unknown topic/);
  });
});

// ── Missing references ───────────────────────────────────────────────────────

describe('validateCertification — source references', () => {
  it('throws when a question has no references', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badQ = { ...questions.questions[0], metadata: { ...questions.questions[0].metadata, references: [] } };
    const badQuestions = { ...questions, questions: [badQ, questions.questions[1]] };
    expect(() => validateCertification(cert, badQuestions, 'test')).toThrow(/source reference/);
  });

  it('throws when a reference URL is invalid', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badQ = { ...questions.questions[0], metadata: { ...questions.questions[0].metadata, references: ['not-a-url'] } };
    const badQuestions = { ...questions, questions: [badQ, questions.questions[1]] };
    expect(() => validateCertification(cert, badQuestions, 'test')).toThrow(/invalid source URL/);
  });
});

// ── Missing correct answer ───────────────────────────────────────────────────

describe('validateCertification — correct answers', () => {
  it('throws when a single-choice question has no correct option', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badOptions = questions.questions[0].options.map((o) => ({ ...o, isCorrect: false }));
    const badQ = { ...questions.questions[0], options: badOptions };
    const badQuestions = { ...questions, questions: [badQ, questions.questions[1]] };
    expect(() => validateCertification(cert, badQuestions, 'test')).toThrow(/at least one correct option/);
  });
});

// ── Unsupported question type ────────────────────────────────────────────────

describe('validateCertification — question types', () => {
  it('throws when a question has an unsupported type', async () => {
    const cert = await loadFixture('valid', 'certification.json');
    const questions = await loadFixture('valid', 'questions.json');
    const badQ = { ...questions.questions[0], type: 'made-up-type' };
    const badQuestions = { ...questions, questions: [badQ, questions.questions[1]] };
    expect(() => validateCertification(cert, badQuestions, 'test')).toThrow(/unsupported type/);
  });
});
