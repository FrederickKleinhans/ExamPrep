import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DataLoader } from '../services/DataLoader';
import { AnalyticsService } from '../services/AnalyticsService';
import { ProgressService } from '../services/ProgressService';
import { CareerTrack, CatalogCert } from '../types';

type AnalyticsTab = 'cert' | 'track';

export function AnalyticsPage() {
  const { manifest, questionBank, progress, initialize, isLoading } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AnalyticsTab>('cert');
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [catalog, setCatalog] = useState<globalThis.Map<string, CatalogCert>>(new globalThis.Map());
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!manifest) initialize();
  }, [manifest, initialize]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tracksData, catalogData] = await Promise.all([
          DataLoader.loadTracks(),
          DataLoader.loadCatalog(),
        ]);
        if (cancelled) return;
        setTracks(tracksData);
        setCatalog(new globalThis.Map(catalogData.map((c) => [c.id, c])));
      } catch {
        // non-critical for cert tab
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading || !manifest) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const certId = progress.selectedCertification;
  const cert = manifest.certifications.find((c) => c.id === certId);
  const activeTrack = progress.selectedTrackId
    ? tracks.find((t) => t.id === progress.selectedTrackId) ?? null
    : null;

  // Build certMeta map for track analytics
  const certMeta = new globalThis.Map(
    manifest.certifications.map((c) => [c.id, { name: c.name, questionCount: c.questionCount }]),
  );

  return (
    <div className="page-root">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
          Overview
        </p>
        <h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>Analytics</h1>
        <p className="text-muted" style={{ margin: '6px 0 0', fontSize: 13 }}>
          Performance insights and study trends
        </p>
      </div>

      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label="Analytics view"
        style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-tertiary)', borderRadius: 12, padding: 4, width: 'fit-content' }}
      >
        {[
          { id: 'cert' as AnalyticsTab, label: 'Certification' },
          { id: 'track' as AnalyticsTab, label: 'Track' },
        ].map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            style={{
              padding: '7px 18px',
              borderRadius: 9,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: tab === id ? 'var(--accent)' : 'transparent',
              color: tab === id ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'cert'
        ? <CertTab cert={cert} certId={certId} questionBank={questionBank} progress={progress} navigate={navigate} />
        : <TrackTab activeTrack={activeTrack} tracks={tracks} progress={progress} certMeta={certMeta} catalog={catalog} dataLoading={dataLoading} navigate={navigate} />
      }
    </div>
  );
}

// ── Cert tab ───────────────────────────────────────────────────────────────

function CertTab({ cert, certId, questionBank, progress, navigate }: {
  cert: ReturnType<typeof Array.prototype.find>;
  certId: string;
  questionBank: ReturnType<typeof useStore.getState>['questionBank'];
  progress: ReturnType<typeof useStore.getState>['progress'];
  navigate: (path: string) => void;
}) {
  if (!cert || !certId) return <NoCertPrompt navigate={navigate} />;

  if (!questionBank) {
    return (
      <div className="card-surface" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <p className="text-muted" style={{ fontSize: 13 }}>Start studying to generate analytics.</p>
      </div>
    );
  }

  const certificationProgress = ProgressService.getCertificationProgress(progress, cert.id);
  const overallStats = AnalyticsService.getOverallStats(questionBank.questions, certificationProgress.questionStats);
  const topicAccuracies = AnalyticsService.getTopicAccuracy(questionBank.questions, certificationProgress.questionStats, cert.topics);
  const examTrend = AnalyticsService.getExamTrend(certificationProgress.examHistory);
  const missedQuestions = AnalyticsService.getMissedQuestions(questionBank.questions, certificationProgress.questionStats);
  const improvement = AnalyticsService.getImprovementScore(certificationProgress.examHistory);

  const statCards = [
    { label: 'Accuracy', value: `${overallStats.averageAccuracy}%`, sub: `${overallStats.totalCorrect} correct / ${overallStats.totalCorrect + overallStats.totalIncorrect} total`, color: 'var(--accent)' },
    { label: 'Avg time', value: overallStats.averageTimeMs > 0 ? `${Math.round(overallStats.averageTimeMs / 1000)}s` : '—', sub: 'Per question', color: '#8bd3ff' },
    { label: 'Improvement', value: `${improvement > 0 ? '+' : ''}${improvement}%`, sub: 'First vs last exam', color: improvement >= 0 ? 'var(--success)' : 'var(--error)' },
    { label: 'Missed', value: String(missedQuestions.length), sub: 'More wrong than right', color: 'var(--error)' },
  ];

  return (
    <>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
        {statCards.map((s) => (
          <div key={s.label} className="card-surface" style={{ padding: '16px 14px' }}>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Exam trend */}
        <AnalyticsCard title="Exam score trend" icon="📈">
          {examTrend.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110, marginBottom: 10 }}>
                {examTrend.map((exam, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <span className="text-muted" style={{ fontSize: 10, marginBottom: 4 }}>{exam.score}%</span>
                    <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: exam.passed ? 'var(--success)' : 'var(--error)', height: `${exam.score}%` }} />
                    <span className="text-muted" style={{ fontSize: 9, marginTop: 4 }}>{exam.date}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--success)', display: 'inline-block' }} /> Passed
                </span>
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--error)', display: 'inline-block' }} /> Failed
                </span>
                <span className="text-muted">Pass: {cert.passingScore}%</span>
              </div>
            </>
          ) : (
            <Empty text="Take exams to see your score trend." />
          )}
        </AnalyticsCard>

        {/* Time analysis */}
        <AnalyticsCard title="Time analysis" icon="⏱">
          {overallStats.totalAttempted > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Avg per question', value: `${Math.round(overallStats.averageTimeMs / 1000)}s` },
                { label: 'Questions attempted', value: String(overallStats.totalAttempted) },
                { label: 'Total study time', value: `${Math.round((overallStats.averageTimeMs * overallStats.totalAttempted) / 60000)}m` },
              ].map((row) => (
                <div key={row.label} className="card-inset" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span className="text-muted" style={{ fontSize: 13 }}>{row.label}</span>
                  <span className="text-heading" style={{ fontSize: 16, fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Start studying to see time analysis." />
          )}
        </AnalyticsCard>
      </div>

      {/* Topic accuracy */}
      <AnalyticsCard title="Topic accuracy" icon="🎯" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {topicAccuracies.map((topic) => {
            const color = topic.accuracy >= 70 ? 'var(--success)' : topic.accuracy >= 50 ? 'var(--warning)' : topic.total > 0 ? 'var(--error)' : 'var(--text-secondary)';
            return (
              <div key={topic.topicId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span className="text-muted">{topic.topicName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="text-muted" style={{ fontSize: 12 }}>{topic.correct}/{topic.total}</span>
                    <span style={{ fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>
                      {topic.total > 0 ? `${topic.accuracy}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="progress-track" style={{ width: '100%', height: 6, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${topic.accuracy}%`, height: '100%', borderRadius: 999, background: color, transition: 'width 0.7s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </AnalyticsCard>

      {/* Missed questions */}
      <AnalyticsCard title={`Frequently missed (${missedQuestions.length})`} icon="⚠️">
        {missedQuestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {missedQuestions.slice(0, 10).map((q) => {
              const stat = certificationProgress.questionStats[q.id];
              return (
                <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '10px 14px', background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.14)', borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-muted" style={{ margin: '0 0 4px', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {q.questionText}
                    </p>
                    <span className="text-muted" style={{ fontSize: 11 }}>{q.topicId.replace(/-/g, ' ')} · {q.difficulty}</span>
                  </div>
                  {stat && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--error)' }}>{stat.correct}/{stat.attempts}</div>
                      <div className="text-muted" style={{ fontSize: 10 }}>correct</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <Empty text="No frequently missed questions. Keep it up!" />
        )}
      </AnalyticsCard>
    </>
  );
}

// ── Track tab ──────────────────────────────────────────────────────────────

function TrackTab({ activeTrack, tracks, progress, certMeta, catalog, dataLoading, navigate }: {
  activeTrack: CareerTrack | null;
  tracks: CareerTrack[];
  progress: ReturnType<typeof useStore.getState>['progress'];
  certMeta: globalThis.Map<string, { name: string; questionCount: number }>;
  catalog: globalThis.Map<string, CatalogCert>;
  dataLoading: boolean;
  navigate: (path: string) => void;
}) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    activeTrack?.id ?? tracks[0]?.id ?? '',
  );

  // Keep selected in sync if activeTrack loads after initial render
  useEffect(() => {
    if (activeTrack && !selectedTrackId) setSelectedTrackId(activeTrack.id);
  }, [activeTrack, selectedTrackId]);

  if (dataLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (tracks.length === 0) {
    return <Empty text="No tracks available." />;
  }

  const displayTrackId = selectedTrackId || tracks[0].id;
  const track = tracks.find((t) => t.id === displayTrackId) ?? tracks[0];
  const analytics = AnalyticsService.getTrackAnalytics(track, progress, certMeta);

  const summaryCards = [
    { label: 'Completion', value: `${analytics.overallCompletion}%`, color: 'var(--accent)' },
    { label: 'Accuracy', value: analytics.totalQuestionsAnswered > 0 ? `${analytics.overallAccuracy}%` : '—', color: 'var(--success)' },
    { label: 'Exams taken', value: String(analytics.totalExamsTaken), color: '#8bd3ff' },
    { label: 'Certs done', value: `${analytics.certsCompleted} / ${analytics.certsWithContent}`, color: 'var(--warning)' },
  ];

  return (
    <>
      {/* Track selector */}
      <div style={{ marginBottom: 16 }}>
        <label className="text-muted" htmlFor="track-select" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
          Select track
        </label>
        <select
          id="track-select"
          value={displayTrackId}
          onChange={(e) => setSelectedTrackId(e.target.value)}
          className="input-surface"
          style={{ maxWidth: 320 }}
          aria-label="Select a career track to view analytics"
        >
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.name} {t.id === activeTrack?.id ? '(active)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Track hero */}
      <div
        className="card-surface"
        style={{ padding: '18px 20px', marginBottom: 14, borderColor: `${track.color}33`, background: `linear-gradient(135deg, ${track.color}10, var(--bg-secondary))` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 22 }} aria-hidden="true">{track.icon}</span>
          <div>
            <h2 className="text-heading" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{track.name}</h2>
            <p className="text-muted" style={{ margin: '2px 0 0', fontSize: 12 }}>{track.description}</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span className="text-muted">Overall progress</span>
            <span className="text-heading" style={{ fontWeight: 700 }}>{analytics.overallCompletion}%</span>
          </div>
          <div className="progress-track" style={{ height: 8, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${analytics.overallCompletion}%`, height: '100%', borderRadius: 999, background: track.color, transition: 'width 0.7s ease' }} />
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(110px, 1fr))', gap: 10, marginBottom: 14 }}>
        {summaryCards.map((s) => (
          <div key={s.label} className="card-surface" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-cert breakdown */}
      <AnalyticsCard title="Certification breakdown" icon="🎓" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {analytics.certs.map((cert) => {
            const catalogEntry = catalog.get(cert.certId);
            const vendorColor = catalogEntry?.vendorColor ?? track.color;
            const isActive = cert.certId === progress.selectedCertification;

            return (
              <div
                key={cert.certId}
                style={{ opacity: cert.hasContent ? 1 : 0.5 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  {/* Status icon */}
                  {cert.passed
                    ? <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--success)', flexShrink: 0 }} aria-label="Passed" />
                    : <Circle style={{ width: 16, height: 16, color: 'var(--border)', flexShrink: 0 }} aria-label="Not passed" />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="text-heading" style={{ fontSize: 13, fontWeight: 700 }}>{cert.certName}</span>
                      {isActive && (
                        <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', background: 'rgba(79,124,255,0.12)', padding: '1px 6px', borderRadius: 999 }}>
                          Active
                        </span>
                      )}
                      {!cert.hasContent && (
                        <span className="text-muted" style={{ fontSize: 10 }}>Coming soon</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {cert.hasContent && cert.questionsAnswered > 0 ? (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: vendorColor }}>{cert.completionPercent}%</div>
                        <div className="text-muted" style={{ fontSize: 10 }}>{cert.questionsAnswered}/{cert.questionsTotal} q</div>
                      </>
                    ) : cert.hasContent ? (
                      <span className="text-muted" style={{ fontSize: 11 }}>Not started</span>
                    ) : null}
                  </div>
                </div>

                {/* Progress bar — only for certs with content */}
                {cert.hasContent && (
                  <div style={{ paddingLeft: 26 }}>
                    <div className="progress-track" style={{ height: 5, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${cert.completionPercent}%`, height: '100%', borderRadius: 999, background: cert.passed ? 'var(--success)' : vendorColor, transition: 'width 0.7s ease' }} />
                    </div>
                    {cert.examsTaken > 0 && (
                      <div className="text-muted" style={{ fontSize: 10, marginTop: 4 }}>
                        {cert.examsTaken} exam{cert.examsTaken > 1 ? 's' : ''} · {cert.accuracy}% accuracy
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AnalyticsCard>

      {/* Next recommended cert */}
      {analytics.nextCertId && (
        <AnalyticsCard title="Recommended next" icon="🎯">
          <button
            onClick={() => navigate(`/certifications/${analytics.nextCertId}`)}
            className="hint-row"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', cursor: 'pointer', border: 'none', textAlign: 'left' }}
            aria-label={`View ${certMeta.get(analytics.nextCertId!)?.name ?? analytics.nextCertId}`}
          >
            <div>
              <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Start or continue</div>
              <div className="text-heading" style={{ fontSize: 14, fontWeight: 700 }}>
                {certMeta.get(analytics.nextCertId)?.name ?? analytics.nextCertId}
              </div>
            </div>
            <ArrowRight style={{ width: 16, height: 16, color: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true" />
          </button>
        </AnalyticsCard>
      )}
    </>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function AnalyticsCard({ title, icon, children, style }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="card-surface" style={{ padding: '18px 20px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 15 }} aria-hidden="true">{icon}</span>
        <h3 className="text-heading" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>{text}</p>;
}

function NoCertPrompt({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="card-surface" style={{ padding: '40px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <h2 className="text-heading" style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>No active certification</h2>
      <p className="text-muted" style={{ margin: '0 0 20px', fontSize: 13 }}>Set an active cert in Settings to see your analytics.</p>
      <button
        onClick={() => navigate('/settings')}
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 12, padding: '11px 24px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
      >
        Go to Settings
      </button>
    </div>
  );
}
