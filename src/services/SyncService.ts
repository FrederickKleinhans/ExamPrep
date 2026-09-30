/**
 * SyncService — background progress sync between localStorage and Supabase.
 *
 * Design principles:
 * - localStorage is always the source of truth for the UI (fast, offline-capable)
 * - Supabase writes are fire-and-forget; failures are logged but never surface to the user
 * - On sign-in, remote progress is merged into local while preserving per-question
 *   activity from both devices
 * - Guest users (no session) are completely unaffected
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProgress } from '../types';

const TABLE = 'user_progress';
const PUSH_DEBOUNCE_MS = 2500;
const pendingPushes = new Map<string, { timeout: ReturnType<typeof setTimeout>; progress: UserProgress }>();
const progressListeners = new Set<() => void>();
let progressChannel: BroadcastChannel | null = null;

// ── Types ──────────────────────────────────────────────────────────────────

interface ProgressRow {
  user_id: string;
  progress: UserProgress;
  updated_at: string;
}

export interface PulledProgress {
  progress: UserProgress;
  updatedAt: string;
}

function getProgressChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!progressChannel) {
    progressChannel = new BroadcastChannel('certready-progress');
    progressChannel.addEventListener('message', () => {
      for (const listener of progressListeners) listener();
    });
  }
  return progressChannel;
}

export function subscribeToProgressChanges(listener: () => void): () => void {
  progressListeners.add(listener);
  getProgressChannel();
  return () => {
    progressListeners.delete(listener);
  };
}

export function broadcastProgressChanged(): void {
  progressChannel?.postMessage('changed');
}

/** Queues only the newest snapshot, reducing redundant writes while studying. */
export function scheduleProgressPush(userId: string, progress: UserProgress): void {
  const pending = pendingPushes.get(userId);
  if (pending) clearTimeout(pending.timeout);

  const timeout = setTimeout(() => {
    const latest = pendingPushes.get(userId);
    pendingPushes.delete(userId);
    if (latest) void pushProgress(userId, latest.progress);
  }, PUSH_DEBOUNCE_MS);

  pendingPushes.set(userId, { timeout, progress });
}

// ── Push ───────────────────────────────────────────────────────────────────

/**
 * Upserts the current progress to Supabase.
 * Called in the background after every local save — never awaited by the UI.
 */
export async function pushProgress(
  userId: string,
  progress: UserProgress,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        { user_id: userId, progress, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );

    if (error) {
      console.warn('[SyncService] Push failed:', error.message);
    }
  } catch (e) {
    console.warn('[SyncService] Push error:', e);
  }
}

// ── Pull ───────────────────────────────────────────────────────────────────

/**
 * Fetches the user's progress from Supabase.
 * Returns null if not found, not configured, or on error.
 */
export async function pullProgress(userId: string): Promise<PulledProgress | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('progress, updated_at')
      .eq('user_id', userId)
      .single<ProgressRow>();

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 = no rows found — that's fine for new users
        console.warn('[SyncService] Pull failed:', error.message);
      }
      return null;
    }

    return data ? { progress: data.progress, updatedAt: data.updated_at } : null;
  } catch (e) {
    console.warn('[SyncService] Pull error:', e);
    return null;
  }
}

// ── Merge ──────────────────────────────────────────────────────────────────

/**
 * Merges remote and local progress when a user signs in.
 *
 * Strategy:
 * - If only one side exists, use that.
 * - For each certification: merge questionStats field by field,
 *   combine examHistory (deduplicated by exam ID), merge bookmarks, take highest SM-2 repetitions.
 * - Global streak and selectedCertification come from whichever has more study activity.
 */
export function mergeProgress(
  local: UserProgress,
  remote: UserProgress,
): UserProgress {
  const localCertifications = local?.certifications ?? {};
  const remoteCertifications = remote?.certifications ?? {};
  const localStudyStreak = local?.studyStreak ?? { current: 0, lastStudyDate: '', longest: 0 };
  const remoteStudyStreak = remote?.studyStreak ?? { current: 0, lastStudyDate: '', longest: 0 };

  const merged: UserProgress = {
    ...local,
    // Remote userId is the auth ID — always use that after sign-in
    userId: remote?.userId ?? local?.userId ?? '',
    // Take the higher current streak, but fall back gracefully if one side is missing
    studyStreak: (remoteStudyStreak.current ?? 0) >= (localStudyStreak.current ?? 0)
      ? remoteStudyStreak
      : localStudyStreak,
    // Use remote cert selection if local has none
    selectedCertification: local?.selectedCertification || remote?.selectedCertification || '',
    selectedTrackId: local?.selectedTrackId ?? remote?.selectedTrackId,
    syncUpdatedAt: [local?.syncUpdatedAt, remote?.syncUpdatedAt]
      .filter((updatedAt): updatedAt is string => Boolean(updatedAt))
      .sort()
      .at(-1),
    certifications: { ...remoteCertifications },
  };

  // Merge per-certification progress
  const allCertIds = new Set([
    ...Object.keys(localCertifications),
    ...Object.keys(remoteCertifications),
  ]);

  for (const certId of allCertIds) {
    const l = localCertifications[certId];
    const r = remoteCertifications[certId];

    if (!l) { merged.certifications[certId] = r; continue; }
    if (!r) { merged.certifications[certId] = l; continue; }

    // Preserve activity from both devices instead of replacing a whole stat row.
    const mergedStats = { ...r.questionStats };
    for (const [qId, lStat] of Object.entries(l.questionStats)) {
      const rStat = r.questionStats[qId];
      if (!rStat) {
        mergedStats[qId] = lStat;
      } else {
        const attempts = lStat.attempts + rStat.attempts;
        const localIsLatest = lStat.lastAttempted >= rStat.lastAttempted;
        const pointsEarned = lStat.pointsEarned === undefined && rStat.pointsEarned === undefined
          ? undefined
          : (lStat.pointsEarned ?? 0) + (rStat.pointsEarned ?? 0);
        const pointsTotal = lStat.pointsTotal === undefined && rStat.pointsTotal === undefined
          ? undefined
          : (lStat.pointsTotal ?? 0) + (rStat.pointsTotal ?? 0);

        mergedStats[qId] = {
          attempts,
          correct: lStat.correct + rStat.correct,
          incorrect: lStat.incorrect + rStat.incorrect,
          averageTimeMs: Math.round(
            (lStat.averageTimeMs * lStat.attempts + rStat.averageTimeMs * rStat.attempts) / attempts,
          ),
          lastAttempted: localIsLatest ? lStat.lastAttempted : rStat.lastAttempted,
          confidence: localIsLatest ? lStat.confidence : rStat.confidence,
          ...(pointsEarned === undefined ? {} : { pointsEarned }),
          ...(pointsTotal === undefined ? {} : { pointsTotal }),
        };
      }
    }

    // Merge exam history — deduplicate by exam ID, with remote winning conflicts
    const examMap = new Map([
      ...(l.examHistory ?? []).map((e) => [e.id, e] as const),
      ...(r.examHistory ?? []).map((e) => [e.id, e] as const),
    ]);

    // Merge SM-2 schedules — take whichever has more repetitions
    const mergedSm2 = { ...(r.sm2 ?? {}) };
    for (const [qId, lSm2] of Object.entries(l.sm2 ?? {})) {
      const rSm2 = r.sm2?.[qId];
      if (!rSm2 || lSm2.repetitions > rSm2.repetitions) {
        mergedSm2[qId] = lSm2;
      }
    }

    // Merge bookmarks — union
    const bookmarks = Array.from(
      new Set([...(r.bookmarks ?? []), ...(l.bookmarks ?? [])]),
    );

    // Merge flashcard schedules independently from question schedules.
    const flashcards = { ...(r.flashcards ?? {}) };
    for (const [cardId, localCard] of Object.entries(l.flashcards ?? {})) {
      const remoteCard = flashcards[cardId];
      if (!remoteCard || localCard.lastReviewed > remoteCard.lastReviewed) flashcards[cardId] = localCard;
    }

    // Use higher streak
    const studyStreak = (l.studyStreak?.current ?? 0) >= (r.studyStreak?.current ?? 0)
      ? l.studyStreak
      : r.studyStreak;

    merged.certifications[certId] = {
      ...r,
      questionStats: mergedStats,
      examHistory: Array.from(examMap.values()),
      sm2: mergedSm2,
      bookmarks,
      flashcards,
      studyStreak: studyStreak ?? r.studyStreak,
    };
  }

  return merged;
}
