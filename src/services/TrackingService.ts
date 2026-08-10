import { track } from '@vercel/analytics';
import { ExamResult } from '../types';

const STORAGE_KEY_ANALYTICS_ENABLED = 'certready_analytics_enabled';
const STORAGE_KEY_DEBUG_MODE = 'certready_debug_mode';

function isAnalyticsEnabled() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ANALYTICS_ENABLED);
    return stored !== 'false';
  } catch {
    return true;
  }
}

function isDebugMode() {
  try {
    return localStorage.getItem(STORAGE_KEY_DEBUG_MODE) === 'true';
  } catch {
    return false;
  }
}

function debugLog(event: string, payload?: unknown) {
  if (!isDebugMode()) return;
  console.debug('[TrackingService]', event, payload ?? 'no payload');
}

function safeTrack(event: string, payload?: unknown) {
  if (!isAnalyticsEnabled()) {
    debugLog('analytics.disabled', { event, payload });
    return;
  }

  try {
    track(event, payload as any);
    debugLog('analytics.sent', { event, payload });
  } catch (error) {
    debugLog('analytics.error', { event, payload, error });
  }
}

export const TrackingService = {
  studyStart: () => {
    debugLog('studyStart.triggered');
    safeTrack('study.start');
  },

  examSubmit: (result: ExamResult) => {
    debugLog('examSubmit.triggered', result);
    safeTrack('exam.submit', {
      certificationId: result.certificationId,
      score: result.score,
      passed: result.passed,
    });
  },

  questionMissed: (questionId: string, topicId?: string) => {
    debugLog('questionMissed.triggered', { questionId, topicId });
    safeTrack('question.missed', { questionId, topicId });
  },
};
