import { useEffect, useRef, useState } from 'react';
import { Clock, Lock, ChevronDown, CheckCircle2, Zap } from 'lucide-react';
import { DataLoader } from '../services/DataLoader';
import { useStore } from '../store/useStore';
import { useAuth } from '../store/useAuth';
import { requiresAuthForCert } from '../lib/guestGuard';
import { AuthModal } from '../components/AuthModal';
import { SupportAccessModal } from '../components/SupportAccessModal';
import { hasSupportUnlock } from '../lib/certAccess';
import { CareerTrack, CatalogCert, TrackLevel } from '../types';

const LEVEL_ORDER = ['foundation', 'associate', 'professional'];

export function TracksPage() {
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [catalog, setCatalog] = useState<globalThis.Map<string, CatalogCert>>(new globalThis.Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const progress = useStore((s) => s.progress);
  const manifest = useStore((s) => s.manifest);
  const selectCertification = useStore((s) => s.selectCertification);
  const selectTrack = useStore((s) => s.selectTrack);
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [supportCertId, setSupportCertId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tracksData, catalogData] = await Promise.all([
          DataLoader.loadTracks(),
          DataLoader.loadCatalog(),
        ]);
        if (cancelled) return;
        setCatalog(new globalThis.Map(catalogData.map((c) => [c.id, c])));
        setTracks(tracksData);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function handleActivate(track: CareerTrack) {
    // Find first free cert in foundation level
    const foundationCerts = track.levels
      .find((l) => l.stage === 'foundation')?.certs ?? track.levels[0]?.certs ?? [];
    const firstFree = foundationCerts.find(({ certId }) => catalog.get(certId)?.accessTier === 'free');
    const firstCertId = firstFree?.certId ?? foundationCerts[0]?.certId;

    if (firstCertId && requiresAuthForCert(!!user, firstCertId, progress)) {
      setShowAuthModal(true);
      return;
    }
    if (firstCertId && firstCertId !== progress.selectedCertification && !hasSupportUnlock(firstCertId)) {
      setSupportCertId(firstCertId);
      return;
    }

    await selectTrack(track.id);
    if (firstFree) {
      await selectCertification(firstFree.certId);
    }
    setExpandedId(null);
  }

  async function handleSelectCertification(trackId: string, certId: string) {
    if (!manifest?.certifications.some((cert) => cert.id === certId)) return;
    if (requiresAuthForCert(!!user, certId, progress)) {
      setShowAuthModal(true);
      return;
    }
    if (certId !== progress.selectedCertification && !hasSupportUnlock(certId)) {
      setSupportCertId(certId);
      return;
    }

    await selectTrack(trackId);
    await selectCertification(certId);
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 256, gap: 12, color: '#8ea2c2' }}>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <p style={{ fontSize: 13 }}>Failed to load tracks: {error}</p>
      </div>
    );
  }

  const activeTrackId = progress.selectedTrackId;
  const activeCertId = progress.selectedCertification;

  return (
    <div style={{ minHeight: '100%', color: '#edf3ff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 920, margin: '0 auto', padding: '24px 8px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8ea2c2', marginBottom: 8 }}>
          Explore
        </p>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#f0f4f8', lineHeight: 1.1 }}>Career paths</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#8ea2c2' }}>
          Click a path to explore its certifications. Activate one to set it as your focus.
        </p>
      </div>

      {/* Track grid — expanded card spans full width */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            catalog={catalog}
            isActive={track.id === activeTrackId}
            activeCertId={activeCertId}
            availableCertIds={new Set(manifest?.certifications.map((cert) => cert.id) ?? [])}
            isExpanded={expandedId === track.id}
            onToggle={() => setExpandedId(expandedId === track.id ? null : track.id)}
            onActivate={() => handleActivate(track)}
            onSelectCertification={(certId) => handleSelectCertification(track.id, certId)}
          />
        ))}
      </div>

      <p style={{ marginTop: 32, textAlign: 'center', fontSize: 12, color: '#8ea2c2' }}>
        More paths coming as the content library grows.
      </p>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {supportCertId && (
        <SupportAccessModal
          certId={supportCertId}
          certName={catalog.get(supportCertId)?.name ?? supportCertId}
          onClose={() => setSupportCertId(null)}
          onUnlocked={() => {
            setSupportCertId(null);
            const target = tracks
              .flatMap((track) => track.levels.flatMap((level) => level.certs.map((cert) => ({ trackId: track.id, certId: cert.certId }))))
              .find((entry) => entry.certId === supportCertId);
            if (target) void handleSelectCertification(target.trackId, target.certId);
          }}
        />
      )}
    </div>
  );
}

// ── Track card ─────────────────────────────────────────────────────────────

function TrackCard({
  track,
  catalog,
  isActive,
  activeCertId,
  availableCertIds,
  isExpanded,
  onToggle,
  onActivate,
  onSelectCertification,
}: {
  track: CareerTrack;
  catalog: globalThis.Map<string, CatalogCert>;
  isActive: boolean;
  activeCertId: string;
  availableCertIds: Set<string>;
  isExpanded: boolean;
  onToggle: () => void;
  onActivate: () => void;
  onSelectCertification: (certId: string) => void;
}) {
  const detailRef = useRef<HTMLDivElement>(null);

  const foundationCerts = (track.levels.find((l) => l.stage === 'foundation')?.certs ?? []).slice(0, 4);
  const totalCerts = track.levels.reduce((n, l) => n + l.certs.length, 0);
  const freeCerts = track.levels.flatMap((l) => l.certs).filter(({ certId }) => catalog.get(certId)?.accessTier === 'free').length;
  const sortedLevels = [...track.levels].sort((a, b) => LEVEL_ORDER.indexOf(a.stage) - LEVEL_ORDER.indexOf(b.stage));

  const panelId = `track-panel-${track.id}`;
  const buttonId = `track-btn-${track.id}`;

  return (
    <div
      style={{
        gridColumn: isExpanded ? '1 / -1' : undefined,
        position: 'relative',
        borderRadius: 20,
        border: isActive
          ? '1px solid rgba(79,124,255,0.45)'
          : isExpanded
            ? '1px solid var(--border)'
            : '1px solid var(--border)',
        background: isActive
          ? 'linear-gradient(180deg, rgba(79,124,255,0.08), var(--bg-secondary))'
          : 'var(--bg-secondary)',
        boxShadow: isExpanded ? '0 16px 48px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* Colour bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: track.color, opacity: isExpanded || isActive ? 1 : 0.55 }} aria-hidden="true" />

      {/* ── Summary row (always visible, clickable) ── */}
      <button
        id={buttonId}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        aria-label={`${track.name}, ${isExpanded ? 'collapse' : 'expand'}`}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {/* Icon + name + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: track.bg, fontSize: 18, flexShrink: 0 }}
            aria-hidden="true"
          >
            {track.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="text-heading" style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{track.name}</h2>
              {isActive && (
                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', background: 'rgba(79,124,255,0.12)', padding: '2px 7px', borderRadius: 999 }}>
                  Active
                </span>
              )}
            </div>
            <p className="text-muted" style={{ margin: '2px 0 0', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {track.description}
            </p>
          </div>
          <ChevronDown
            style={{ width: 16, height: 16, color: 'var(--text-secondary)', flexShrink: 0, transition: 'transform 0.25s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}
            aria-hidden="true"
          />
        </div>

        {/* Foundation cert chips + stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {foundationCerts.map(({ certId }) => {
              const cert = catalog.get(certId);
              const isFree = cert?.accessTier === 'free';
              return (
                <span
                  key={certId}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: isFree ? 'rgba(45,212,191,0.1)' : 'var(--bg-tertiary)', color: isFree ? 'var(--success)' : 'var(--text-secondary)' }}
                >
                  {!isFree && <Lock style={{ width: 9, height: 9 }} aria-hidden="true" />}
                  {cert?.code ?? certId}
                </span>
              );
            })}
          </div>
          <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock style={{ width: 10, height: 10 }} aria-hidden="true" />
              ~{track.estimatedHoursToComplete}h
            </span>
            <span>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>{freeCerts}</span> free / {totalCerts} certs
            </span>
          </div>
        </div>
      </button>

      {/* ── Expanded detail panel ── */}
      <div
        id={panelId}
        ref={detailRef}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isExpanded}
        style={{
          maxHeight: isExpanded ? 'min(1000px, calc(100dvh - 180px))' : 0,
          overflowX: 'hidden',
          overflowY: isExpanded ? 'auto' : 'hidden',
          overscrollBehavior: 'contain',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 20px 22px' }}>
          {/* Level sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 22 }}>
            {sortedLevels.map((level, li) => (
              <LevelSection
                key={level.stage}
                level={level}
                levelIndex={li}
                catalog={catalog}
                activeCertId={activeCertId}
                availableCertIds={availableCertIds}
                trackColor={track.color}
                isExpanded={isExpanded}
                onSelectCertification={onSelectCertification}
              />
            ))}
          </div>

          {/* Activate / active indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {isActive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                <CheckCircle2 style={{ width: 16, height: 16 }} aria-hidden="true" />
                This is your active path
              </div>
            ) : (
              <button
                onClick={onActivate}
                tabIndex={isExpanded ? 0 : -1}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 12, padding: '11px 22px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                <Zap style={{ width: 14, height: 14 }} aria-hidden="true" />
                Activate this path
              </button>
            )}
            <button
              onClick={onToggle}
              tabIndex={isExpanded ? 0 : -1}
              className="btn-ghost"
              style={{ borderRadius: 12, padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Level section ──────────────────────────────────────────────────────────

function LevelSection({
  level,
  levelIndex,
  catalog,
  activeCertId,
  availableCertIds,
  trackColor,
  onSelectCertification,
}: {
  level: TrackLevel;
  levelIndex: number;
  catalog: globalThis.Map<string, CatalogCert>;
  activeCertId: string;
  availableCertIds: Set<string>;
  trackColor: string;
  isExpanded?: boolean;
  onSelectCertification: (certId: string) => void;
}) {
  return (
    <div>
      {/* Level header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 800, color: '#fff', background: trackColor, flexShrink: 0 }}
          aria-hidden="true"
        >
          {levelIndex + 1}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f4f8' }}>{level.label}</span>
        <span style={{ fontSize: 12, color: '#8ea2c2' }}>— {level.description}</span>
      </div>

      {/* Cert rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, paddingLeft: 32 }}>
        {level.certs.map(({ certId, required, note }) => {
          const cert = catalog.get(certId);
          const isFree = cert?.accessTier === 'free';
          const isActiveCert = certId === activeCertId;
          const hasContent = availableCertIds.has(certId);

          return (
            <div
              key={certId}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: isActiveCert
                  ? '1px solid rgba(45,212,191,0.35)'
                  : isFree
                    ? '1px solid rgba(148,163,184,0.12)'
                    : '1px solid rgba(148,163,184,0.08)',
                background: isActiveCert
                  ? 'rgba(45,212,191,0.06)'
                  : 'rgba(148,163,184,0.04)',
                opacity: isFree ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: note ? 4 : 0, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f4f8' }}>
                  {cert?.name ?? certId}
                </span>
                {cert?.code && (
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8ea2c2', background: 'rgba(148,163,184,0.08)', padding: '1px 6px', borderRadius: 4 }}>
                    {cert.code}
                  </span>
                )}
                {required && (
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffae00' }}>Required</span>
                )}
                {!isFree && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#8ea2c2' }}>
                    <Lock style={{ width: 9, height: 9 }} aria-hidden="true" />
                    Premium
                  </span>
                )}
                {isActiveCert && (
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2dd4bf' }}>● Active</span>
                )}
              </div>
              {note && (
                <p style={{ margin: 0, fontSize: 11, color: '#8ea2c2', lineHeight: 1.5 }}>{note}</p>
              )}
              {hasContent && !isActiveCert && (
                <button
                  type="button"
                  onClick={() => onSelectCertification(certId)}
                  style={{ marginTop: 9, minHeight: 36, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  Set active
                </button>
              )}
              {!hasContent && (
                <span style={{ display: 'block', marginTop: 8, fontSize: 10, color: '#8ea2c2' }}>
                  Content coming soon
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
