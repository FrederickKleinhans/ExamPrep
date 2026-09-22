import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Bookmark,
  Clock,
  Target,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { DataLoader } from '../services/DataLoader';
import { useStore } from '../store/useStore';
import { useAuth } from '../store/useAuth';
import { requiresAuthForCert } from '../lib/guestGuard';
import { AuthModal } from '../components/AuthModal';
import { SupportAccessModal } from '../components/SupportAccessModal';
import { requiresSupportUnlock } from '../lib/certAccess';
import { CatalogCert, Certification } from '../types';

type PendingAction = { certId: string; then: 'study' | 'exam' | 'activate' } | null;

export function CertificationPage() {
  const { certId } = useParams<{ certId: string }>();
  const navigate = useNavigate();

  const [catalogEntry, setCatalogEntry] = useState<CatalogCert | null>(null);
  const [certManifest, setCertManifest] = useState<Certification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [pendingSupportAction, setPendingSupportAction] = useState<'study' | 'exam' | 'activate' | null>(null);

  const progress = useStore((s) => s.progress);
  const selectCertification = useStore((s) => s.selectCertification);
  const hasActiveSession = useStore((s) => s.hasActiveSession);
  const { user } = useAuth();

  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmTriggerRef = useRef<HTMLButtonElement>(null);

  const isActiveCert = progress.selectedCertification === certId;

  useEffect(() => {
    if (!certId) return;
    let cancelled = false;
    async function load() {
      try {
        const [catalog, manifest] = await Promise.all([
          DataLoader.loadCatalog(),
          DataLoader.loadCertification(certId!),
        ]);
        if (cancelled) return;
        setCatalogEntry(catalog.find((c) => c.id === certId) ?? null);
        setCertManifest(manifest);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [certId]);

  // Focus management for confirmation modal
  useEffect(() => {
    if (pendingAction) {
      setTimeout(() => cancelBtnRef.current?.focus(), 10);
    }
  }, [pendingAction]);

  // Focus trap + Escape for confirmation modal
  const handleModalKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { setPendingAction(null); return; }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, []);

  // Request an action — show confirmation if a session is active and cert differs
  function requestAction(id: string, action: 'study' | 'exam' | 'activate') {
    if (id === progress.selectedCertification) {
      // Already active cert — no switch needed, just go
      if (action === 'study') navigate('/study');
      else if (action === 'exam') navigate('/exam');
      return;
    }

    // Guest trying to activate a second cert — prompt sign-in
    if (requiresAuthForCert(!!user, id, progress)) {
      setShowAuthModal(true);
      return;
    }
    if (requiresSupportUnlock(id, progress.selectedCertification)) {
      setPendingSupportAction(action);
      setShowSupportModal(true);
      return;
    }

    if (hasActiveSession()) {
      setPendingAction({ certId: id, then: action });
    } else {
      void executeAction(id, action);
    }
  }

  async function executeAction(id: string, action: 'study' | 'exam' | 'activate') {
    await selectCertification(id);
    if (action === 'study') navigate('/study');
    else if (action === 'exam') navigate('/exam');
    // 'activate' just switches the cert, stays on this page
  }

  async function confirmSwitch() {
    if (!pendingAction) return;
    const { certId: id, then } = pendingAction;
    setPendingAction(null);
    await executeAction(id, then);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !certManifest) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--text-secondary)]">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm">{error ?? 'Certification not found.'}</p>
        <Link to="/tracks" className="text-[var(--accent)] text-sm hover:underline">
          Back to tracks
        </Link>
      </div>
    );
  }

  const certProgress = progress.certifications[certManifest.id];
  const examHistory = certProgress?.examHistory ?? [];
  const passed = examHistory.some((e) => e.passed);
  const latestExam = examHistory.at(-1);
  const totalAnswered = Object.keys(certProgress?.questionStats ?? {}).length;
  const totalCorrect = Object.values(certProgress?.questionStats ?? {}).reduce(
    (sum, s) => sum + s.correct, 0,
  );
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

  // SM-2 due questions count
  const dueCount = certProgress
    ? Object.values(certProgress.sm2 ?? {}).filter(
      (s) => s && s.dueDate <= new Date().toISOString().split('T')[0],
    ).length
    : 0;

  const vendor = catalogEntry?.vendor ?? certManifest.provider;
  const vendorColor = catalogEntry?.vendorColor ?? 'var(--accent)';
  const description = catalogEntry?.description ?? '';
  const examDetails = catalogEntry?.examDetails ?? {
    durationMinutes: certManifest.timeLimitMinutes,
    questionCount: certManifest.questionCount,
    passingScore: certManifest.passingScore,
    priceUSD: 0,
  };
  const resources = certManifest.resources ?? [];

  return (
    <div className="max-w-3xl mx-auto py-6 px-2 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="h-1.5" style={{ background: vendorColor }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${vendorColor}20`, color: vendorColor }}>
                  {vendor}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                  {certManifest.examCode}
                </span>
                <LevelBadge level={catalogEntry?.level ?? 'beginner'} />
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{certManifest.name}</h1>
              {description && <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {passed && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--success)] bg-[var(--success)]/10 px-3 py-1.5 rounded-xl border border-[var(--success)]/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Passed
                </span>
              )}
              {isActiveCert ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-xl border border-[var(--accent)]/20">
                  ● Active cert
                </span>
              ) : (
                <button
                  ref={confirmTriggerRef}
                  onClick={() => certId && requestAction(certId, 'activate')}
                  aria-haspopup="dialog"
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
                >
                  Set as active
                </button>
              )}
            </div>
          </div>

          {/* Exam meta */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaStat icon={<Clock className="w-4 h-4" />} label="Duration" value={`${examDetails.durationMinutes} min`} />
            <MetaStat icon={<Target className="w-4 h-4" />} label="Questions" value={String(examDetails.questionCount)} />
            <MetaStat icon={<ClipboardCheck className="w-4 h-4" />} label="Pass score" value={`${examDetails.passingScore}%`} />
            <MetaStat icon={<DollarSign className="w-4 h-4" />} label="Exam price" value={examDetails.priceUSD > 0 ? `$${examDetails.priceUSD}` : 'Free'} />
          </div>
        </div>
      </div>

      {/* Progress snapshot */}
      {totalAnswered > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Your progress</h2>
            {dueCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,174,0,0.12)', color: 'var(--warning)', border: '1px solid rgba(255,174,0,0.25)' }}
                title="Questions scheduled for review today"
              >
                <Bell style={{ width: 11, height: 11 }} aria-hidden="true" />
                {dueCount} due for review
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ProgressStat label="Questions answered" value={String(totalAnswered)} />
            <ProgressStat label="Accuracy" value={accuracy !== null ? `${accuracy}%` : '—'} />
            <ProgressStat label="Exams taken" value={String(examHistory.length)} />
          </div>
          {latestExam && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">
                Latest exam — {new Date(latestExam.date).toLocaleDateString()} ·{' '}
                <span className={latestExam.passed ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                  {latestExam.score}%{latestExam.passed ? ' passed' : ' failed'}
                </span>
              </span>
              <Link to="/analytics" className="flex items-center gap-1 text-[var(--accent)] hover:underline">
                Full analytics <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Primary actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ActionButton
          icon={<BookOpen className="w-5 h-5" />}
          label="Study"
          description="Practice questions"
          color="var(--accent)"
          onClick={() => certId && requestAction(certId, 'study')}
        />
        <ActionButton
          icon={<ClipboardCheck className="w-5 h-5" />}
          label="Exam"
          description="Timed mock exam"
          color="var(--warning)"
          onClick={() => certId && requestAction(certId, 'exam')}
        />
        <Link
          to="/analytics"
          className="flex flex-col items-start gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 hover:border-[rgba(45,212,191,0.4)] hover:shadow-[0_4px_20px_-6px_rgba(45,212,191,0.2)] transition-all"
        >
          <span className="text-[var(--success)]"><BarChart3 className="w-5 h-5" /></span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Analytics</span>
          <span className="text-xs text-[var(--text-secondary)]">Topic breakdown</span>
        </Link>
        <Link
          to="/bookmarks"
          className="flex flex-col items-start gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 hover:border-[rgba(255,174,0,0.4)] hover:shadow-[0_4px_20px_-6px_rgba(255,174,0,0.2)] transition-all"
        >
          <span className="text-[var(--warning)]"><Bookmark className="w-5 h-5" /></span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Bookmarks</span>
          <span className="text-xs text-[var(--text-secondary)]">Saved questions</span>
        </Link>
      </div>

      {/* Topic weights */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Exam topics</h2>
        <div className="space-y-3">
          {certManifest.topics.map((topic) => (
            <div key={topic.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-primary)]">{topic.name}</span>
                <span className="text-[var(--text-secondary)]">{topic.weight}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${topic.weight}%`, background: vendorColor, opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      {resources.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Official resources</h2>
          <ul className="space-y-2">
            {resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Auth modal — shown when guest tries to activate a second cert */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showSupportModal && certManifest && (
        <SupportAccessModal
          certId={certManifest.id}
          certName={certManifest.name}
          onClose={() => setShowSupportModal(false)}
          onUnlocked={() => {
            setShowSupportModal(false);
            const action = pendingSupportAction ?? 'activate';
            setPendingSupportAction(null);
            if (hasActiveSession()) {
              setPendingAction({ certId: certManifest.id, then: action });
            } else {
              void executeAction(certManifest.id, action);
            }
          }}
        />
      )}

      {/* Confirmation modal — switching cert mid-session */}
      {pendingAction && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-switch-title"
          aria-describedby="cert-switch-desc"
          onKeyDown={handleModalKeyDown}
          onClick={(e) => { if (e.target === e.currentTarget) setPendingAction(null); }}
        >
          <div className="modal-surface" style={{ padding: '32px 28px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <AlertTriangle style={{ width: 40, height: 40, color: 'var(--warning)', margin: '0 auto 16px' }} aria-hidden="true" />
            <h2 id="cert-switch-title" className="text-heading" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              End your current session?
            </h2>
            <p id="cert-switch-desc" className="text-muted" style={{ margin: '0 0 24px', fontSize: 13, lineHeight: 1.6 }}>
              You have a study or exam session in progress. Switching to a different cert will end that session and discard any unsaved answers.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                ref={cancelBtnRef}
                onClick={() => setPendingAction(null)}
                className="btn-ghost"
                style={{ flex: 1, borderRadius: 12, padding: '11px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
              >
                Stay here
              </button>
              <button
                onClick={() => void confirmSwitch()}
                style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 12, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Switch {pendingAction.then === 'study' ? '& Study' : pendingAction.then === 'exam' ? '& Take Exam' : 'Cert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    beginner: { bg: 'rgba(45,212,191,0.12)', text: '#2dd4bf' },
    intermediate: { bg: 'rgba(79,124,255,0.12)', text: '#4f7cff' },
    advanced: { bg: 'rgba(255,174,0,0.12)', text: '#ffae00' },
    expert: { bg: 'rgba(248,81,73,0.12)', text: '#f85149' },
  };
  const s = styles[level] ?? styles.beginner;
  return (
    <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
      {level}
    </span>
  );
}

function MetaStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[var(--bg-tertiary)] p-3">
      <span className="text-[var(--text-secondary)]">{icon}</span>
      <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
      <span className="text-sm font-bold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function ProgressStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-extrabold text-[var(--text-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</div>
    </div>
  );
}

function ActionButton({ icon, label, description, color, onClick }: {
  icon: React.ReactNode; label: string; description: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 transition-all hover:-translate-y-0.5 text-left"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}66`;
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px -6px ${color}44`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
      <span className="text-xs text-[var(--text-secondary)]">{description}</span>
    </button>
  );
}
