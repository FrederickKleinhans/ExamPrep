import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { TracksPage } from './pages/TracksPage';
import { CertificationPage } from './pages/CertificationPage';
import { StudyPage } from './pages/StudyPage';
import { ExamPage } from './pages/ExamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SettingsPage } from './pages/SettingsPage';
import { usePreferences } from './store/usePreferences';
import { useAuth } from './store/useAuth';
import { useStore } from './store/useStore';
import { ProgressService, setSyncUserId } from './services/ProgressService';
import { pullProgress, mergeProgress, pushProgress } from './services/SyncService';

function App() {
  const analyticsEnabled = usePreferences((state) => state.analyticsEnabled);
  const { initialise: initialiseAuth, session } = useAuth();
  const initialize = useStore((s) => s.initialize);
  const refreshProgress = useStore((s) => s.refreshProgress);

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
          const merged = mergeProgress(local, remote);
          if (cancelled) return;

          // Update userId to the auth ID so future saves use the right key
          merged.userId = userId;
          ProgressService.saveProgress(merged);
          refreshProgress();
        } else {
          // First sign-in — push existing local progress to Supabase
          const local = ProgressService.getProgress();
          local.userId = userId;
          ProgressService.saveProgress(local);
          void pushProgress(userId, local);
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
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/certifications/:certId" element={<CertificationPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/exam" element={<ExamPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
