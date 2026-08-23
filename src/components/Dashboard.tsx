import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import { CareerTrack, CatalogCert } from '../types';
import { useTheme } from '../store/useTheme';

export interface DashboardMetrics {
  completion: number;
  avgScore: number;
  streak: number;
  examsTaken: number;
}

export interface DashboardCertTrack {
  id: string;
  name: string;
  completed: number;
  total: number;
  progress: number;
  color?: string;
}

export interface WeakArea {
  name: string;
  accuracy: number;
  progress: number;
}

export interface DashboardProps {
  metrics: DashboardMetrics;
  tracks: DashboardCertTrack[];
  weakAreas: WeakArea[];
  activeCert: CatalogCert | null;
  activeCertId: string;
  activeTrack: CareerTrack | null;
  nextCert: CatalogCert | null;
  nextCertId: string | null;
}

const formatPercent = (value: number) => `${Math.round(value)}%`;

export function Dashboard({
  metrics,
  tracks,
  weakAreas,
  activeCert,
  activeCertId,
  activeTrack,
  nextCert,
  nextCertId,
}: DashboardProps) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const shareDashboard = async () => {
    const shareData = { title: 'CertArc', text: 'Track your certification progress with CertArc.' };
    if (navigator.share) { await navigator.share(shareData); return; }
    await navigator.clipboard?.writeText(window.location.href);
  };

  const metricCards = [
    { label: 'Completion', value: formatPercent(metrics.completion), helper: 'Overall progress', accent: 'var(--accent)' },
    { label: 'Avg Score', value: formatPercent(metrics.avgScore), helper: 'Across attempts', accent: '#8bd3ff' },
    { label: 'Streak', value: `${metrics.streak}d`, helper: 'Current streak', accent: 'var(--warning)' },
    { label: 'Exams', value: `${metrics.examsTaken}`, helper: 'Practice exams', accent: 'var(--success)' },
  ];

  const vendorColor = activeCert?.vendorColor ?? 'var(--accent)';

  return (
    <div className="page-root" style={{ borderRadius: 24 }}>
      <main style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ── */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Overview</div>
            <h1 className="text-heading" style={{ margin: 0, fontSize: 40, lineHeight: 1.1, fontWeight: 800 }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => void shareDashboard()}
              className="btn-ghost"
              style={{ padding: '10px 18px', fontWeight: 600, fontSize: 14 }}
            >
              Share
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="btn-ghost"
              style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, padding: 0 }}
            >
              {theme === 'dark' ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/study')}
              style={{ border: 'none', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', borderRadius: 999, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,124,255,0.3)' }}
            >
              Start study
            </button>
          </div>
        </header>

        {/* ── Active cert hero ── */}
        <div
          className="card-surface"
          style={{
            borderColor: `${vendorColor}33`,
            background: `linear-gradient(135deg, ${vendorColor}10 0%, var(--bg-secondary) 100%)`,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            boxShadow: `0 8px 32px -8px ${vendorColor}22`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {!activeCert && !activeCertId ? (
              <div>
                <div className="text-heading" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>
                  No active certification
                </div>
                <p className="text-muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
                  Pick a career path to get started. Your first cert will be suggested automatically.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/tracks')}
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 12, padding: '10px 20px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Browse career paths →
                </button>
              </div>
            ) : (
              <>
                {activeTrack ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }} aria-hidden="true">{activeTrack.icon}</span>
                    <span className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      {activeTrack.name}
                    </span>
                    <span className="text-muted" style={{ fontSize: 11 }}>·</span>
                    <button type="button" onClick={() => navigate('/tracks')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      Change path
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => navigate('/tracks')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'block', textAlign: 'left' }}>
                    + Choose a career path
                  </button>
                )}
                <div className="text-heading" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>
                  {activeCert?.name ?? activeCertId}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  {activeCert?.code && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: vendorColor, background: `${vendorColor}18`, padding: '2px 8px', borderRadius: 999 }}>
                      {activeCert.code}
                    </span>
                  )}
                  {activeCert?.level && (
                    <span className="text-muted" style={{ fontSize: 11, textTransform: 'capitalize' }}>{activeCert.level}</span>
                  )}
                  {activeCert?.vendor && (
                    <span className="text-muted" style={{ fontSize: 11 }}>· {activeCert.vendor}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {(activeCert || activeCertId) && (
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/study')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 14, padding: '10px 16px', fontWeight: 700, background: `${vendorColor}18`, color: vendorColor, cursor: 'pointer', fontSize: 13, border: `1px solid ${vendorColor}35` }}
              >
                <BookOpen style={{ width: 15, height: 15 }} /> Study
              </button>
              <button
                type="button"
                onClick={() => navigate('/exam')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,174,0,0.3)', borderRadius: 14, padding: '10px 16px', fontWeight: 700, background: 'rgba(255,174,0,0.1)', color: 'var(--warning)', cursor: 'pointer', fontSize: 13 }}
              >
                <ClipboardCheck style={{ width: 15, height: 15 }} /> Exam
              </button>
            </div>
          )}
        </div>

        {/* ── Metric cards ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: 14 }}>
          {metricCards.map((card) => (
            <div key={card.label} className="card-surface" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: card.accent, display: 'inline-block' }} />
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, color: card.accent, lineHeight: 1, marginBottom: 6 }}>{card.value}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{card.helper}</div>
            </div>
          ))}
        </section>

        {/* ── Bottom row ── */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.95fr', gap: 14 }}>
          {/* My progress */}
          <div className="card-surface" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div className="text-muted" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Certifications</div>
                <h3 className="text-heading" style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>My progress</h3>
              </div>
              <button type="button" onClick={() => navigate('/tracks')} style={{ border: 'none', background: 'transparent', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                All paths
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {tracks.length === 0 ? (
                <div className="text-muted" style={{ fontSize: 13, gridColumn: '1/-1' }}>
                  No certifications started yet.{' '}
                  <button type="button" onClick={() => navigate('/tracks')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                    Browse paths
                  </button>
                </div>
              ) : (
                tracks.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => navigate(`/certifications/${track.id}`)}
                    className="card-inset"
                    style={{ textAlign: 'left', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 14, borderLeft: `3px solid ${track.color ?? 'var(--accent)'}` }}
                  >
                    <div className="text-heading" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontWeight: 600, fontSize: 13 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: track.color ?? 'var(--accent)', display: 'inline-block', flexShrink: 0 }} />
                      {track.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <strong className="text-heading" style={{ fontSize: 22 }}>{track.completed}/{track.total}</strong>
                      <span className="text-muted" style={{ fontSize: 12 }}>{formatPercent(track.progress)}</span>
                    </div>
                    <div className="progress-track" style={{ width: '100%', height: 8, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${track.progress}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${track.color ?? 'var(--accent)'}, var(--success))` }} />
                    </div>
                  </button>
                ))
              )}
            </div>

            {nextCert && nextCertId && (
              <button
                type="button"
                onClick={() => navigate(`/certifications/${nextCertId}`)}
                className="hint-row"
                style={{ marginTop: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', textAlign: 'left' }}
              >
                <div>
                  <div className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Next up</div>
                  <div className="text-heading" style={{ fontSize: 13, fontWeight: 600 }}>{nextCert.name}</div>
                </div>
                <ArrowRight style={{ width: 15, height: 15, color: 'var(--text-secondary)', flexShrink: 0 }} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Weak areas */}
            <div className="card-surface" style={{ padding: 18 }}>
              <div className="text-muted" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Focus areas</div>
              <h3 className="text-heading" style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 700 }}>Weak areas</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {weakAreas.map((area) => (
                  <li key={area.name}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, fontWeight: 600 }}>
                      <span className="text-heading" style={{ fontSize: 13 }}>{area.name}</span>
                      <span className="text-muted" style={{ fontSize: 12 }}>{formatPercent(area.accuracy)}</span>
                    </div>
                    <div className="progress-track" style={{ width: '100%', height: 7, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${area.progress}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--accent), #ff8fab)' }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick access */}
            <div className="card-surface" style={{ padding: 18 }}>
              <div className="text-muted" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Actions</div>
              <h3 className="text-heading" style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 700 }}>Quick access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button type="button" onClick={() => navigate('/study')} style={{ border: 'none', borderRadius: 12, padding: '11px 14px', fontWeight: 700, fontSize: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', cursor: 'pointer' }}>Quick study</button>
                <button type="button" onClick={() => navigate('/exam')} className="btn-ghost" style={{ borderRadius: 12, padding: '11px 14px', fontWeight: 700, fontSize: 14 }}>Practice exam</button>
                <button type="button" onClick={() => navigate('/bookmarks')} className="btn-ghost" style={{ borderRadius: 12, padding: '11px 14px', fontWeight: 700, fontSize: 14 }}>Review bookmarks</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
