import { Question, ExamSession, ExamResult } from '../types';

export class ExamService {
  static createSession(
    certificationId: string,
    questions: Question[],
    timeLimitMinutes: number,
    questionCount: number
  ): ExamSession {
    // Randomly select questions for the exam
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    return {
      id: crypto.randomUUID(),
      certificationId,
      questions: selected,
      currentIndex: 0,
      answers: {},
      flagged: [],
      startTime: Date.now(),
      timeLimit: timeLimitMinutes * 60 * 1000,
      isCompleted: false,
    };
  }

  static submitAnswer(
    session: ExamSession,
    questionId: string,
    answer: string | string[]
  ): ExamSession {
    return {
      ...session,
      answers: { ...session.answers, [questionId]: answer },
    };
  }

  static toggleFlag(session: ExamSession, questionId: string): ExamSession {
    const flagged = session.flagged.includes(questionId)
      ? session.flagged.filter((id) => id !== questionId)
      : [...session.flagged, questionId];

    return { ...session, flagged };
  }

  static navigateTo(session: ExamSession, index: number): ExamSession {
    if (index < 0 || index >= session.questions.length) return session;
    return { ...session, currentIndex: index };
  }

  static getRemainingTime(session: ExamSession): number {
    const elapsed = Date.now() - session.startTime;
    return Math.max(0, session.timeLimit - elapsed);
  }

  static isTimeUp(session: ExamSession): boolean {
    return this.getRemainingTime(session) <= 0;
  }

  static calculateResult(session: ExamSession, passingScore: number): ExamResult {
    let earnedPoints = 0;
    let totalPoints = 0;

    for (const question of session.questions) {
      const answer = session.answers[question.id];
      const { earned, total } = this.calculateQuestionPoints(question, answer);
      earnedPoints += earned;
      totalPoints += total;
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    return {
      id: crypto.randomUUID(),
      certificationId: session.certificationId,
      date: new Date().toISOString(),
      score,
      passed: score >= passingScore,
      timeTakenMs: Date.now() - session.startTime,
      answers: session.answers,
      flaggedQuestions: session.flagged,
    };
  }

  /**
   * Calculate earned/total points for a question based on the provided answer.
   * Returns an object { earned, total } where each selection may count as one point
   * for multi-selection question types.
   */
  static calculateQuestionPoints(question: Question, answer: string | string[] | undefined): { earned: number; total: number } {
    if (!answer) return { earned: 0, total: 0 };

    switch (question.type) {
      case 'single-choice':
      case 'true-false': {
        const total = 1;
        const correctId = question.options.find((o) => o.isCorrect)?.id;
        const earned = answer === correctId ? 1 : 0;
        return { earned, total };
      }

      case 'multiple-choice': {
        const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
        const total = correctIds.length || 1;
        if (!Array.isArray(answer)) return { earned: 0, total };
        const earned = answer.filter((a) => correctIds.includes(a)).length;
        return { earned, total };
      }

      case 'yes-no-statements': {
        if (!Array.isArray(answer) || !question.statements) return { earned: 0, total: 0 };
        const total = question.statements.length;
        const parsed: Record<string, string> = {};
        for (const entry of answer) {
          const [id, val] = entry.split(':');
          if (id && val) parsed[id] = val;
        }
        let earned = 0;
        for (const stmt of question.statements) {
          const userVal = parsed[stmt.id];
          const correctVal = stmt.isCorrectYes ? 'yes' : 'no';
          if (userVal === correctVal) earned++;
        }
        return { earned, total };
      }

      case 'dropdown-select': {
        if (!Array.isArray(answer) || !question.dropdowns) return { earned: 0, total: 0 };
        const total = question.dropdowns.length;
        const parsed: Record<string, string> = {};
        for (const entry of answer) {
          const colonIdx = entry.indexOf(':');
          if (colonIdx > 0) parsed[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
        }
        let earned = 0;
        for (const dd of question.dropdowns) {
          if (parsed[dd.id] === dd.correctAnswer) earned++;
        }
        return { earned, total };
      }

      case 'ordering': {
        if (!Array.isArray(answer) || !question.orderItems) return { earned: 0, total: 0 };
        const correctOrder = [...question.orderItems]
          .sort((a, b) => a.correctPosition - b.correctPosition)
          .map((item) => item.id);
        const total = correctOrder.length;
        let earned = 0;
        for (let i = 0; i < correctOrder.length; i++) {
          if (answer[i] === correctOrder[i]) earned++;
        }
        return { earned, total };
      }

      case 'drag-drop': {
        if (!Array.isArray(answer) || !question.dragCategories) return { earned: 0, total: 0 };
        const parsed: Record<string, string> = {};
        for (const entry of answer) {
          const colonIdx = entry.indexOf(':');
          if (colonIdx > 0) parsed[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
        }
        // Build correct mapping from categories
        const correctMap: Record<string, string> = {};
        const itemIds: string[] = [];
        for (const cat of question.dragCategories) {
          for (const itemId of cat.acceptsItemIds) {
            correctMap[itemId] = cat.id;
            itemIds.push(itemId);
          }
        }
        const total = itemIds.length;
        let earned = 0;
        for (const itemId of itemIds) {
          if (parsed[itemId] === correctMap[itemId]) earned++;
        }
        return { earned, total };
      }

      default:
        return { earned: 0, total: 0 };
    }
  }

  /**
   * Determines if an answer is correct for any question type.
   */
  static isQuestionCorrect(question: Question, answer: string | string[]): boolean {
    switch (question.type) {
      case 'single-choice':
      case 'true-false': {
        const correctId = question.options.find((o) => o.isCorrect)?.id;
        return answer === correctId;
      }

      case 'multiple-choice': {
        const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
        if (!Array.isArray(answer)) return false;
        return (
          answer.length === correctIds.length &&
          answer.every((a) => correctIds.includes(a)) &&
          correctIds.every((c) => answer.includes(c))
        );
      }

      case 'yes-no-statements': {
        // Answer is encoded as string[] of "statementId:yes|no"
        if (!Array.isArray(answer) || !question.statements) return false;
        const parsed: Record<string, string> = {};
        for (const entry of answer) {
          const [id, val] = entry.split(':');
          if (id && val) parsed[id] = val;
        }
        return question.statements.every((stmt) => {
          const userVal = parsed[stmt.id];
          const correctVal = stmt.isCorrectYes ? 'yes' : 'no';
          return userVal === correctVal;
        });
      }

      case 'dropdown-select': {
        // Answer is encoded as string[] of "dropdownId:selectedValue"
        if (!Array.isArray(answer) || !question.dropdowns) return false;
        const parsed: Record<string, string> = {};
        for (const entry of answer) {
          const colonIdx = entry.indexOf(':');
          if (colonIdx > 0) {
            parsed[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
          }
        }
        return question.dropdowns.every((dd) => parsed[dd.id] === dd.correctAnswer);
      }

      case 'ordering': {
        // Answer is encoded as string[] of item IDs in user's order
        if (!Array.isArray(answer) || !question.orderItems) return false;
        const correctOrder = [...question.orderItems]
          .sort((a, b) => a.correctPosition - b.correctPosition)
          .map((item) => item.id);
        return (
          answer.length === correctOrder.length &&
          answer.every((id, i) => id === correctOrder[i])
        );
      }

      case 'drag-drop': {
        // Answer is encoded as string[] of "itemId:categoryId"
        if (!Array.isArray(answer) || !question.dragCategories) return false;
        const parsed: Record<string, string> = {};
        for (const entry of answer) {
          const colonIdx = entry.indexOf(':');
          if (colonIdx > 0) {
            parsed[entry.slice(0, colonIdx)] = entry.slice(colonIdx + 1);
          }
        }
        // Build correct mapping from categories
        const correctMap: Record<string, string> = {};
        for (const cat of question.dragCategories) {
          for (const itemId of cat.acceptsItemIds) {
            correctMap[itemId] = cat.id;
          }
        }
        return Object.entries(correctMap).every(([itemId, catId]) => parsed[itemId] === catId);
      }

      default:
        return false;
    }
  }

  static getSessionStats(session: ExamSession) {
    const total = session.questions.length;
    const answered = Object.keys(session.answers).length;
    const flagged = session.flagged.length;
    const unanswered = total - answered;

    return { total, answered, flagged, unanswered };
  }
}
