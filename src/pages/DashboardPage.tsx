import { useEffect, useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import { useStore } from '../store/useStore';
import { AdaptiveEngine } from '../services/AdaptiveEngine';
import { DataLoader } from '../services/DataLoader';
import { CareerTrack, CatalogCert } from '../types';

export function DashboardPage() {
  const progress = useStore((s) => s.progress);
  const manifest = useStore((s) => s.manifest);
  const questionBank = useStore((s) => s.questionBank);
  const initialize = useStore((s) => s.initialize);

  const [catalog, setCatalog] = useState<Map<string, CatalogCert>>(new Map());
  const [tracks, setTracks] = useState<CareerTrack[]>([]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [catalogData, tracksData] = await Promise.all([
          DataLoader.loadCatalog(),
          DataLoader.loadTracks(),
        ]);
        if (cancelled) return;
        setCatalog(new Map(catalogData.map((c) => [c.id, c])));
        setTracks(tracksData);
      } catch {
        // non-critical
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  // ── Active cert + track context ────────────────────────────────────────────
  const activeCertId = progress.selectedCertification;
  const activeTrackId = progress.selectedTrackId;
  const activeCatalogCert = catalog.get(activeCertId) ?? null;
  const activeTrack = activeTrackId ? tracks.find((t) => t.id === activeTrackId) ?? null : null;

  // Next cert in the track after the active one
  const trackCertIds = activeTrack?.levels.flatMap((l) => l.certs.map((c) => c.certId)) ?? [];
  const activeCertIndex = trackCertIds.indexOf(activeCertId);
  const nextCertId = activeCertIndex >= 0 ? trackCertIds[activeCertIndex + 1] : null;
  const nextCert = nextCertId ? catalog.get(nextCertId) ?? null : null;

  // ── Metrics ────────────────────────────────────────────────────────────────
  const allCertProgress = Object.values(progress.certifications);

  const totalAnswered = allCertProgress.reduce(
    (sum, cp) => sum + Object.keys(cp.questionStats).length,
    0,
  );

  const { totalCorrect, totalAttempts } = allCertProgress.reduce(
    (acc, cp) => {
      for (const stat of Object.values(cp.questionStats)) {
        acc.totalCorrect += stat.correct;
        acc.totalAttempts += stat.attempts;
      }
      return acc;
    },
    { totalCorrect: 0, totalAttempts: 0 },
  );

  const avgAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const totalAvailable = manifest?.certifications.reduce((s, c) => s + c.questionCount, 0) ?? 0;
  const completion = totalAvailable > 0 ? Math.round((totalAnswered / totalAvailable) * 100) : 0;

  const allExams = allCertProgress.flatMap((cp) => cp.examHistory);
  const examsTaken = allExams.length;
  const avgScore =
    allExams.length > 0
      ? Math.round(allExams.reduce((sum, e) => sum + e.score, 0) / allExams.length)
      : avgAccuracy;

  const metrics = {
    completion,
    avgScore,
    streak: progress.studyStreak.current,
    examsTaken,
  };

  // ── Cert progress cards — active cert only ────────────────────────────────
  const colorMap: Record<string, string> = {
    'az-900': '#0078D4',
    'aws-cp': '#FF9900',
    'gcp-digital-leader': '#4285F4',
    'sc-900': '#0078D4',
    'dp-900': '#0078D4',
    'ai-900': '#0078D4',
  };

  const certTracks = (manifest?.certifications ?? [])
    .filter((cert) => cert.id === activeCertId)
    .map((cert) => {
      const certProgress = progress.certifications[cert.id];
      const answered = certProgress ? Object.keys(certProgress.questionStats).length : 0;
      const total = cert.questionCount;
      const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
      return {
        id: cert.id,
        name: cert.name,
        completed: answered,
        total,
        progress: pct,
        color: catalog.get(cert.id)?.vendorColor ?? colorMap[cert.id] ?? '#58a6ff',
      };
    });

  // ── Weak areas ─────────────────────────────────────────────────────────────
  const selectedCert = manifest?.certifications.find((c) => c.id === activeCertId);
  const selectedCertProgress = progress.certifications[activeCertId];

  let weakAreas: { name: string; accuracy: number; progress: number }[] = [];

  if (selectedCert && selectedCertProgress && questionBank) {
    const weakTopicIds = AdaptiveEngine.computeWeakTopics(
      questionBank.questions,
      selectedCertProgress.questionStats,
    );

    const topicAccMap: Record<string, { earned: number; total: number }> = {};
    for (const [qId, stat] of Object.entries(selectedCertProgress.questionStats)) {
      const question = questionBank.questions.find((q) => q.id === qId);
      if (!question) continue;
      if (!topicAccMap[question.topicId]) topicAccMap[question.topicId] = { earned: 0, total: 0 };
      topicAccMap[question.topicId].earned += stat.correct;
      topicAccMap[question.topicId].total += stat.attempts;
    }

    weakAreas = weakTopicIds.slice(0, 4).map((topicId) => {
      const topic = selectedCert.topics.find((t) => t.id === topicId);
      const acc = topicAccMap[topicId];
      const accuracy = acc && acc.total > 0 ? Math.round((acc.earned / acc.total) * 100) : 0;
      return { name: topic?.name ?? topicId, accuracy, progress: accuracy };
    });
  }

  if (weakAreas.length === 0 && totalAnswered === 0) {
    weakAreas = [{ name: 'Start studying to see weak areas', accuracy: 0, progress: 0 }];
  }

  return (
    <Dashboard
      metrics={metrics}
      tracks={certTracks}
      weakAreas={weakAreas}
      activeCert={activeCatalogCert}
      activeCertId={activeCertId}
      activeTrack={activeTrack}
      nextCert={nextCert}
      nextCertId={nextCertId}
    />
  );
}
