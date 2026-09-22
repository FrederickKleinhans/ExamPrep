/**
 * SyncService — background progress sync between localStorage and Supabase.
 *
 * Design principles:
 * - localStorage is always the source of truth for the UI (fast, offline-capable)
 * - Supabase writes are fire-and-forget; failures are logged but never surface to the user
 * - On sign-in, remote progress is merged into local (remote wins on conflicts for
 *   exam history and question stats, local wins for in-flight session state)
 * - Guest users (no session) are completely unaffected
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProgress } from '../types';

const TABLE = 'user_progress';

// ── Types ──────────────────────────────────────────────────────────────────

interface ProgressRow {
  user_id: string;
  progress: UserProgress;
  updated_at: string;
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
export async function pullProgress(userId: string): Promise<UserProgress | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('progress')
      .eq('user_id', userId)
      .single<Pick<ProgressRow, 'progress'>>();

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 = no rows found — that's fine for new users
        console.warn('[SyncService] Pull failed:', error.message);
      }
      return null;
    }

    return data?.progress ?? null;
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
 * - For each certification: merge questionStats (most attempts wins per question),
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

    // Merge question stats — take the entry with more attempts
    const mergedStats = { ...r.questionStats };
    for (const [qId, lStat] of Object.entries(l.questionStats)) {
      const rStat = r.questionStats[qId];
      if (!rStat || lStat.attempts > rStat.attempts) {
        mergedStats[qId] = lStat;
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
      studyStreak: studyStreak ?? r.studyStreak,
    };
  }

  return merged;
}
