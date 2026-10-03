import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Layout } from './components/Layout';
import { PwaStatus } from './components/PwaStatus';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { usePreferences } from './store/usePreferences';
import { useAuth } from './store/useAuth';
import { useStore } from './store/useStore';
import { ProgressService, setSyncUserId } from './services/ProgressService';
import { pullProgress, mergeProgress, subscribeToProgressChanges } from './services/SyncService';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const TracksPage = lazy(() =>
  import('./pages/TracksPage').then((module) => ({ default: module.TracksPage })),
);
const CertificationPage = lazy(() =>
  import('./pages/CertificationPage').then((module) => ({ default: module.CertificationPage })),
);
const StudyPage = lazy(() => import('./pages/StudyPage').then((module) => ({ default: module.StudyPage })));
const ExamPage = lazy(() => import('./pages/ExamPage').then((module) => ({ default: module.ExamPage })));
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })),
);
const BookmarksPage = lazy(() =>
  import('./pages/BookmarksPage').then((module) => ({ default: module.BookmarksPage })),
);
const FlashcardsPage = lazy(() =>
  import('./pages/FlashcardsPage').then((module) => ({ default: module.FlashcardsPage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const TrackDetailPage = lazy(() =>
  import('./pages/TrackDetailPage').then((module) => ({ default: module.TrackDetailPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

function App() {
  const analyticsEnabled = usePreferences((state) => state.analyticsEnabled);
  const { initialise: initialiseAuth, session } = useAuth();
  const initialize = useStore((s) => s.initialize);
  const refreshProgress = useStore((s) => s.refreshProgress);

  useEffect(() => subscribeToProgressChanges(refreshProgress), [refreshProgress]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'certready_progress') refreshProgress();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshProgress]);

  // 1. Initialise Supabase auth once on mount
  useEffect(() => {
    void initialiseAuth();
  }, [initialiseAuth]);

  // 2. When session changes (sign-in / sign-out / page reload with existing session)
  useEffect(() => {
    let cancelled = false;

    if (session?.user) {
      // User just signed in — set sync target and merge remote progress into local
      const userId = session.user.id;
      setSyncUserId(userId);
      void (async () => {
        const remote = await pullProgress(userId);
        if (cancelled) return;

        if (remote) {
          const local = ProgressService.getProgress();
          if (local.syncUpdatedAt && remote.updatedAt < local.syncUpdatedAt) return;
          const merged = mergeProgress(local, remote.progress);
          if (cancelled) return;

          // Update userId to the auth ID so future saves use the right key
          merged.userId = userId;
          merged.syncUpdatedAt = remote.updatedAt;
          ProgressService.saveProgress(merged);
          refreshProgress();
        } else {
          // First sign-in — push existing local progress to Supabase
          const local = ProgressService.getProgress();
          local.userId = userId;
          ProgressService.saveProgress(local);
          refreshProgress();
        }
      })();
    } else {
      // Signed out — stop syncing
      setSyncUserId(null);
    }

    return () => {
      cancelled = true;
      if (session?.user) setSyncUserId(null);
    };

    // We intentionally only react to session changes, not refreshProgress
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // 3. Boot the app (loads manifest + cert data)
  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <>
      {analyticsEnabled && <Analytics />}
      <PwaStatus />
      <BrowserRouter>
        <RouteErrorBoundary>
          <Suspense
            fallback={
              <div role="status" className="page-root text-muted">
                Loading page…
              </div>
            }
          >
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/tracks" element={<TracksPage />} />
                <Route path="/tracks/:trackId" element={<TrackDetailPage />} />
                <Route path="/certifications/:certId" element={<CertificationPage />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/exam" element={<ExamPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </BrowserRouter>
    </>
  );
}

export default App;
