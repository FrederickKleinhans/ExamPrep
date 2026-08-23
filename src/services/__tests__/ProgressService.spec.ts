// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { ProgressService } from '../ProgressService';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records points in the selected certification only', () => {
    ProgressService.recordAnswerPoints('az-900', 'q1', 1, 2, 500, 'high');
    ProgressService.recordAnswerPoints('aws-saa-c03', 'q1', 2, 2, 300, 'medium');
    const progress = ProgressService.getProgress();
    const azure = ProgressService.getCertificationProgress(progress, 'az-900');
    const aws = ProgressService.getCertificationProgress(progress, 'aws-saa-c03');

    expect(azure.questionStats.q1).toMatchObject({ attempts: 1, correct: 0, incorrect: 1 });
    expect(aws.questionStats.q1).toMatchObject({ attempts: 1, correct: 1, incorrect: 0 });
    expect((azure.questionStats.q1 as { pointsEarned: number }).pointsEarned).toBe(1);
    expect((aws.questionStats.q1 as { pointsEarned: number }).pointsEarned).toBe(2);
  });

  it('keeps bookmarks and study groups isolated per certification', () => {
    ProgressService.toggleBookmark('az-900', 'q1');
    ProgressService.incrementStudyGroupIndex('az-900');
    ProgressService.incrementStudyGroupIndex('aws-saa-c03');
    ProgressService.incrementStudyGroupIndex('aws-saa-c03');
    const progress = ProgressService.getProgress();

    expect(ProgressService.getCertificationProgress(progress, 'az-900').bookmarks).toEqual(['q1']);
    expect(ProgressService.getCertificationProgress(progress, 'aws-saa-c03').bookmarks).toEqual([]);
    expect(ProgressService.getCertificationProgress(progress, 'az-900').studyGroupIndex).toBe(1);
    expect(ProgressService.getCertificationProgress(progress, 'aws-saa-c03').studyGroupIndex).toBe(2);
  });

  it('migrates legacy progress and retains a backup', () => {
    const legacy = {
      userId: 'user_existing',
      selectedCertification: 'az-900',
      studyStreak: { current: 4, lastStudyDate: '2026-08-12', longest: 7 },
      questionStats: { q1: { attempts: 2, correct: 1, incorrect: 1, lastAttempted: '2026-08-12', averageTimeMs: 400, confidence: 'medium' } },
      examHistory: [],
      weakTopics: ['cloud'],
      bookmarks: ['q1'],
      studyGroupIndex: { 'az-900': 2 },
    };
    localStorage.setItem('certready_progress', JSON.stringify(legacy));

    const progress = ProgressService.getProgress();
    const certification = ProgressService.getCertificationProgress(progress, 'az-900');

    expect(progress.version).toBe(2);
    expect(progress.studyStreak).toEqual(legacy.studyStreak);
    expect(certification.studyStreak).toEqual(legacy.studyStreak);
    expect(certification.questionStats).toEqual(legacy.questionStats);
    expect(certification.bookmarks).toEqual(['q1']);
    expect(certification.studyGroupIndex).toBe(2);
    expect(localStorage.getItem('certready_progress_v1_backup')).toBe(JSON.stringify(legacy));
  });

  it('imports a legacy export as v2 progress', () => {
    const imported = ProgressService.importProgress(JSON.stringify({
      userId: 'user_imported',
      selectedCertification: 'aws-saa-c03',
      studyStreak: { current: 1, lastStudyDate: '2026-08-12', longest: 1 },
      questionStats: {},
      examHistory: [],
      weakTopics: [],
      bookmarks: [],
    }));

    expect(imported).toBe(true);
    expect(ProgressService.getProgress()).toMatchObject({ version: 2, selectedCertification: 'aws-saa-c03' });
  });

  it('rejects invalid imports without overwriting existing progress', () => {
    ProgressService.recordAnswerPoints('az-900', 'q1', 1, 1, 200);

    expect(ProgressService.importProgress('{"not":"progress"}')).toBe(false);
    expect(ProgressService.getCertificationProgress(ProgressService.getProgress(), 'az-900').questionStats.q1).toBeDefined();
  });

  it('exports and imports v2 progress without losing certification scope', () => {
    ProgressService.recordAnswerPoints('az-900', 'q1', 1, 1, 200);
    ProgressService.recordAnswerPoints('aws-saa-c03', 'q2', 0, 1, 250);
    const exported = ProgressService.exportProgress();

    localStorage.clear();
    expect(ProgressService.importProgress(exported)).toBe(true);

    const progress = ProgressService.getProgress();
    expect(ProgressService.getCertificationProgress(progress, 'az-900').questionStats.q1).toBeDefined();
    expect(ProgressService.getCertificationProgress(progress, 'aws-saa-c03').questionStats.q2).toBeDefined();
  });

  it('resets global and per-certification progress', () => {
    ProgressService.recordAnswerPoints('az-900', 'q1', 1, 1, 200);
    ProgressService.resetProgress();
    const progress = ProgressService.getProgress();

    expect(progress.version).toBe(2);
    expect(progress.studyStreak.current).toBe(0);
    expect(ProgressService.getCertificationProgress(progress, 'az-900').questionStats).toEqual({});
  });
});
