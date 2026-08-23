import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Clock, Lock, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { DataLoader } from '../services/DataLoader';
import { useStore } from '../store/useStore';
import { CareerTrack, CatalogCert, TrackLevel } from '../types';

const LEVEL_ORDER = ['foundation', 'associate', 'professional'];

export function TrackDetailPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState<CareerTrack | null>(null);
  const [catalog, setCatalog] = useState<Map<string, CatalogCert>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progress = useStore((s) => s.progress);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tracksData, catalogData] = await Promise.all([
          DataLoader.loadTracks(),
          DataLoader.loadCatalog(),
        ]);
        if (cancelled) return;
        const found = tracksData.find((t) => t.id === trackId) ?? null;
        setTrack(found);
        setCatalog(new Map(catalogData.map((c) => [c.id, c])));
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [trackId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--text-secondary)]">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm">{error ?? 'Track not found.'}</p>
        <Link to="/tracks" className="text-[var(--accent)] text-sm hover:underline">
          Back to tracks
        </Link>
      </div>
    );
  }

  const sortedLevels = [...track.levels].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.stage) - LEVEL_ORDER.indexOf(b.stage),
  );

  return (
    <div className="max-w-3xl mx-auto py-6 px-2 space-y-8">
      {/* Back link */}
      <Link
        to="/tracks"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All tracks
      </Link>

      {/* Track hero */}
      <div
        className="rounded-2xl border border-[var(--border)] p-6"
        style={{ background: track.bg }}
      >
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl border border-white/10"
            style={{ background: 'rgba(0,0,0,0.18)' }}
            aria-hidden="true"
          >
            {track.icon}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{track.name}</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{track.description}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" aria-hidden="true" />
            ~{track.estimatedHoursToComplete} hours to complete
          </span>
          <span>
            {track.levels.reduce((sum, l) => sum + l.certs.length, 0)} certifications across{' '}
            {track.levels.length} levels
          </span>
        </div>
      </div>

      {/* Level sections */}
      <div className="space-y-6">
        {sortedLevels.map((level, levelIndex) => (
          <LevelSection
            key={level.stage}
            level={level}
            levelIndex={levelIndex}
            catalog={catalog}
            progress={progress}
            trackColor={track.color}
          />
        ))}
      </div>
    </div>
  );
}

function LevelSection({
  level,
  levelIndex,
  catalog,
  progress,
  trackColor,
}: {
  level: TrackLevel;
  levelIndex: number;
  catalog: Map<string, CatalogCert>;
  progress: ReturnType<typeof useStore.getState>['progress'];
  trackColor: string;
}) {
  return (
    <div>
      {/* Level header */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: trackColor }}
          aria-hidden="true"
        >
          {levelIndex + 1}
        </span>
        <div>
          <span className="text-base font-bold text-[var(--text-primary)]">{level.label}</span>
          <span className="ml-2 text-sm text-[var(--text-secondary)]">— {level.description}</span>
        </div>
      </div>

      {/* Cert cards */}
      <div className="space-y-3 pl-9">
        {level.certs.map(({ certId, required, note }) => {
          const cert = catalog.get(certId);
          const hasContent = cert !== undefined;
          const isFree = cert?.accessTier === 'free';
          const certProgress = progress.certifications[certId];
          const examCount = certProgress?.examHistory?.length ?? 0;
          const passed = certProgress?.examHistory?.some((e) => e.passed) ?? false;

          return (
            <CertRow
              key={certId}
              certId={certId}
              cert={cert}
              hasContent={hasContent}
              isFree={isFree}
              required={required}
              note={note}
              passed={passed}
              examCount={examCount}
            />
          );
        })}
      </div>
    </div>
  );
}

function CertRow({
  certId,
  cert,
  hasContent,
  isFree,
  required,
  note,
  passed,
  examCount,
}: {
  certId: string;
  cert: CatalogCert | undefined;
  hasContent: boolean;
  isFree: boolean;
  required: boolean;
  note?: string;
  passed: boolean;
  examCount: number;
}) {
  const isAvailable = hasContent && isFree; // only free certs have question content right now
  const isPremiumOnly = hasContent && !isFree;

  const inner = (
    <div
      className={`group relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
        isAvailable
          ? 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/40 hover:shadow-[0_4px_20px_-6px_rgba(79,124,255,0.2)] cursor-pointer'
          : 'border-[var(--border)]/60 bg-[var(--bg-secondary)]/50 cursor-default opacity-70'
      }`}
    >
      {/* Status icon */}
      <span className="shrink-0">
        {passed ? (
          <CheckCircle2 className="w-5 h-5 text-[var(--success)]" aria-label="Passed" />
        ) : (
          <Circle className="w-5 h-5 text-[var(--border)]" aria-label="Not started" />
        )}
      </span>

      {/* Cert info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {cert?.name ?? certId}
          </span>
          {cert?.code && (
            <span className="text-[11px] text-[var(--text-secondary)] font-mono bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
              {cert.code}
            </span>
          )}
          {required && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--warning)] bg-[var(--warning)]/10 px-1.5 py-0.5 rounded">
              Required
            </span>
          )}
        </div>
        {note && (
          <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">{note}</p>
        )}
        {examCount > 0 && (
          <p className="mt-0.5 text-xs text-[var(--accent)]">{examCount} exam{examCount !== 1 ? 's' : ''} taken</p>
        )}
      </div>

      {/* Right side */}
      <div className="shrink-0 flex items-center gap-2">
        {isPremiumOnly && (
          <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-lg">
            <Lock className="w-3 h-3" aria-hidden="true" />
            Coming soon
          </span>
        )}
        {!hasContent && (
          <span className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-lg">
            Coming soon
          </span>
        )}
        {isAvailable && (
          <ChevronRight
            className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );

  if (isAvailable) {
    return (
      <Link to={`/certifications/${certId}`} aria-label={`View ${cert?.name ?? certId}`}>
        {inner}
      </Link>
    );
  }
  return inner;
}
