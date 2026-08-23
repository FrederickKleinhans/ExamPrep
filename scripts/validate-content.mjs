/**
 * Content validation logic extracted from compile-content.mjs.
 * Importable by both the compiler and the test suite.
 */

const SUPPORTED_TYPES = new Set([
  'single-choice', 'multiple-choice', 'true-false', 'yes-no-statements',
  'dropdown-select', 'ordering', 'drag-drop', 'matching', 'scenario',
]);

/**
 * Validates a certification object and its question bank.
 * Throws an Error with all validation failures listed if anything is wrong.
 *
 * @param {object} certification
 * @param {object} questions
 * @param {string} [sourcePath] - optional label for error messages
 */
export function validateCertification(certification, questions, sourcePath = 'content') {
  const errors = [];

  // Required fields
  const required = ['id', 'name', 'provider', 'examCode', 'version', 'questionCount', 'passingScore', 'timeLimitMinutes', 'topics'];
  for (const field of required) {
    if (certification[field] === undefined || certification[field] === '') {
      errors.push(`missing required field: ${field}`);
    }
  }

  // Topics
  if (!Array.isArray(certification.topics) || certification.topics.length === 0) {
    errors.push('must define at least one topic');
  } else {
    const totalWeight = certification.topics.reduce((sum, t) => sum + (t.weight ?? 0), 0);
    if (totalWeight !== 100) {
      errors.push(`topic weights must sum to 100, got ${totalWeight}`);
    }
    if (certification.topics.some((t) => !Number.isFinite(t.weight) || t.weight <= 0)) {
      errors.push('all topic weights must be positive numbers');
    }
  }

  // Questions
  if (!Array.isArray(questions.questions) || questions.questions.length === 0) {
    errors.push('must define at least one question');
  }

  if (questions.certificationId !== certification.id) {
    errors.push(`question bank certificationId "${questions.certificationId}" does not match certification id "${certification.id}"`);
  }

  if (certification.questionCount !== questions.questions?.length) {
    errors.push(`questionCount is ${certification.questionCount}, but found ${questions.questions?.length ?? 0} questions`);
  }

  const topicIds = new Set((certification.topics ?? []).map((t) => t.id));
  const questionIds = new Set();

  for (const question of questions.questions ?? []) {
    // ID
    if (!question.id) {
      errors.push('a question is missing an id');
    } else if (questionIds.has(question.id)) {
      errors.push(`duplicate question id: ${question.id}`);
    } else {
      questionIds.add(question.id);
    }

    // Topic reference
    if (question.id && !topicIds.has(question.topicId)) {
      errors.push(`question ${question.id} references unknown topic "${question.topicId}"`);
    }

    // Type
    if (question.id && !SUPPORTED_TYPES.has(question.type)) {
      errors.push(`question ${question.id} has unsupported type "${question.type}"`);
    }

    // References
    if (!Array.isArray(question.metadata?.references) || question.metadata.references.length === 0) {
      errors.push(`question ${question.id ?? '?'} must include at least one source reference`);
    } else {
      for (const ref of question.metadata.references) {
        try {
          const url = new URL(ref);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push(`question ${question.id} has a non-web source URL: ${ref}`);
          }
        } catch {
          errors.push(`question ${question.id} has an invalid source URL: ${ref}`);
        }
      }
    }

    // lastUpdated
    if (!question.metadata?.lastUpdated || Number.isNaN(Date.parse(question.metadata.lastUpdated))) {
      errors.push(`question ${question.id ?? '?'} has an invalid lastUpdated date`);
    }

    // Correct answers
    if (['single-choice', 'multiple-choice', 'true-false', 'scenario'].includes(question.type)) {
      if (!Array.isArray(question.options) || !question.options.some((o) => o.isCorrect)) {
        errors.push(`question ${question.id} needs at least one correct option`);
      }
    }
    if (question.type === 'yes-no-statements' && (!Array.isArray(question.statements) || question.statements.length === 0)) {
      errors.push(`question ${question.id} needs yes/no statements`);
    }
    if (question.type === 'dropdown-select' && (!Array.isArray(question.dropdowns) || question.dropdowns.some((d) => !d.options.includes(d.correctAnswer)))) {
      errors.push(`question ${question.id} has invalid dropdown answers`);
    }
    if (question.type === 'ordering' && (!Array.isArray(question.orderItems) || question.orderItems.length === 0)) {
      errors.push(`question ${question.id} needs ordering items`);
    }
    if (question.type === 'drag-drop' && (!Array.isArray(question.dragCategories) || !Array.isArray(question.dragItems) || question.dragCategories.length === 0 || question.dragItems.length === 0)) {
      errors.push(`question ${question.id} needs drag-drop items and categories`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`${sourcePath}:\n- ${errors.join('\n- ')}`);
  }
}
