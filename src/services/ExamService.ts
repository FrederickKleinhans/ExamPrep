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
    let correctCount = 0;
    const totalQuestions = session.questions.length;

    for (const question of session.questions) {
      const answer = session.answers[question.id];
      if (!answer) continue;

      if (this.isQuestionCorrect(question, answer)) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

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
