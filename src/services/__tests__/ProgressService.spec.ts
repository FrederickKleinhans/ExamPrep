import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressService } from '../ProgressService';

describe('ProgressService.recordAnswerPoints', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records points and updates stats for first attempt', () => {
    ProgressService.recordAnswerPoints('q1', 1, 2, 500, 'high');
    const prog = ProgressService.getProgress();
    const stat = prog.questionStats['q1'];

    expect(stat).toBeDefined();
    expect(stat.attempts).toBe(1);
    expect(stat.correct).toBe(0);
    expect(stat.incorrect).toBe(1);
    expect((stat as any).pointsEarned).toBe(1);
    expect((stat as any).pointsTotal).toBe(2);
  });

  it('accumulates points across attempts', () => {
    ProgressService.recordAnswerPoints('q2', 2, 3, 400, 'medium');
    ProgressService.recordAnswerPoints('q2', 1, 3, 300, 'low');
    const prog = ProgressService.getProgress();
    const stat = prog.questionStats['q2'];

    expect(stat.attempts).toBe(2);
    expect((stat as any).pointsEarned).toBe(3);
    expect((stat as any).pointsTotal).toBe(6);
  });
});
