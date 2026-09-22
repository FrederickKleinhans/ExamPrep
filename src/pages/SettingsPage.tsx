import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProgressService } from '../services/ProgressService';
import { DataLoader } from '../services/DataLoader';
import { usePreferences } from '../store/usePreferences';
import { useTheme } from '../store/useTheme';
import { useAuth } from '../store/useAuth';
import { requiresAuthForCert } from '../lib/guestGuard';
import { AuthModal } from '../components/AuthModal';
import { SupportAccessModal } from '../components/SupportAccessModal';
import { requiresSupportUnlock } from '../lib/certAccess';
import { CareerTrack } from '../types';

export function SettingsPage() {
  const { manifest, progress, initialize, isLoading, selectCertification, selectTrack, refreshProgress, hasActiveSession } = useStore();
  const { analyticsEnabled, toggleAnalytics, debugMode, toggleDebugMode } = usePreferences();
  const { theme, toggle: toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [supportCertId, setSupportCertId] = useState<string | null>(null);
  const [pendingCertId, setPendingCertId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const certSwitchCancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!manifest) initialize();
  }, [manifest, initialize]);

  useEffect(() => {
    let cancelled = false;
    void DataLoader.loadTracks().then((loadedTracks) => {
      if (!cancelled) setTracks(loadedTracks);
    }).catch(() => {
      console.warn('[SettingsPage] Failed to load track metadata for certification selection');
    });
    return () => { cancelled = true; };
  }, []);

  // Move focus into modal on open; restore on close
  useEffect(() => {
    if (showResetConfirm) {
      // Defer to next tick so the modal is rendered
      setTimeout(() => cancelBtnRef.current?.focus(), 10);
    } else if (pendingCertId === null) {
      // Only restore focus to reset button when no other modal is open
      resetTriggerRef.current?.focus();
    }
  }, [showResetConfirm, pendingCertId]);

  useEffect(() => {
    if (pendingCertId !== null) {
      setTimeout(() => certSwitchCancelRef.current?.focus(), 10);
    }
  }, [pendingCertId]);

  // Focus trap inside reset / cert-switch modals
  const handleModalKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      if (showResetConfirm) setShowResetConfirm(false);
      else if (pendingCertId !== null) setPendingCertId(null);
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [showResetConfirm, pendingCertId]);

  if (isLoading || !manifest) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const handleExport = () => {
    const data = ProgressService.exportProgress();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certarc-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = ProgressService.importProgress(json);
      setImportStatus(success ? 'success' : 'error');
      if (success) refreshProgress();
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    ProgressService.resetProgress();
    refreshProgress();
    setShowResetConfirm(false);
  };

  const findTrackForCertification = (certId: string): string | undefined => {
    const currentTrack = tracks.find((track) =>
      track.id === progress.selectedTrackId &&
      track.levels.some((level) => level.certs.some((cert) => cert.certId === certId)),
    );
    if (currentTrack) return currentTrack.id;

    return tracks.find((track) =>
      track.levels.some((level) => level.certs.some((cert) => cert.certId === certId)),
    )?.id;
  };

  const selectCertAndTrack = async (certId: string) => {
    const trackId = findTrackForCertification(certId);
    if (trackId) {
      await selectTrack(trackId);
    }
    await selectCertification(certId);
  };

  const handleCertChangeRequest = (newCertId: string) => {
    if (newCertId === '' || newCertId === progress.selectedCertification) return;

    // Guest trying to switch to a second cert — require sign-in first
    if (requiresAuthForCert(!!user, newCertId, progress)) {
      setShowAuthModal(true);
      return;
    }
    if (requiresSupportUnlock(newCertId, progress.selectedCertification)) {
      setSupportCertId(newCertId);
      return;
    }

    // If a study or exam session is in progress, require confirmation —
    // switching certs will wipe the in-flight session.
    if (hasActiveSession()) {
      setPendingCertId(newCertId);
    } else {
      void selectCertAndTrack(newCertId);
    }
  };

  const confirmCertSwitch = () => {
    if (pendingCertId) {
      void selectCertAndTrack(pendingCertId);
    }
    setPendingCertId(null);
  };

  const activeCertId = progress.selectedCertification;

  return (
    <div className="page-root" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Preferences</p>
        <h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>Settings</h1>
        <p className="text-muted" style={{ margin: '6px 0 0', fontSize: 13 }}>Manage your active cert, data, and preferences</p>
      </div>

      {/* Active certification */}
      <Section title="Active certification" titleId="cert-section-title">
        <p className="text-muted" style={{ margin: '0 0 10px', fontSize: 13 }}>
          This is the cert your study, exam, analytics, and bookmarks operate on.
        </p>
        <label htmlFor="cert-select" className="text-muted" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
          Select certification
        </label>
        <select
          id="cert-select"
          value={activeCertId}
          onChange={(e) => handleCertChangeRequest(e.target.value)}
          className="input-surface"
          style={{ width: '100%', appearance: 'none' }}
        >
          <option value="" disabled>Select a certification…</option>
          {manifest.certifications.map((cert) => (
            <option key={cert.id} value={cert.id}>
              {cert.examCode} — {cert.name}
            </option>
          ))}
        </select>
        {activeCertId && (
          <p className="text-muted" style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--success)' }}>
            ✓ Active: {manifest.certifications.find((c) => c.id === activeCertId)?.name ?? activeCertId}
          </p>
        )}
      </Section>

      {/* Data management */}
      <Section title="Data management" titleId="data-section-title">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ActionRow
            icon={<Download style={{ width: 18, height: 18, color: 'var(--accent)' }} aria-hidden="true" />}
            label="Export progress"
            description="Download your progress as JSON"
            onClick={handleExport}
          />
          <ActionRow
            icon={<Upload style={{ width: 18, height: 18, color: 'var(--accent)' }} aria-hidden="true" />}
            label="Import progress"
            description="Load a previously exported file"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-hidden="true"
          />
          {importStatus === 'success' && (
            <p role="status" className="text-muted" style={{ margin: 0, fontSize: 13, color: 'var(--success)', padding: '4px 0' }}>
              ✓ Progress imported successfully
            </p>
          )}
          {importStatus === 'error' && (
            <p role="alert" className="text-muted" style={{ margin: 0, fontSize: 13, color: 'var(--error)', padding: '4px 0' }}>
              Invalid file. Please use a CertArc export.
            </p>
          )}
        </div>
      </Section>
      {/* Preferences */}
      <Section title="Preferences" titleId="prefs-section-title">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ToggleRow
            label="Anonymous analytics"
            description="Send anonymous study and exam events for better insights"
            enabled={analyticsEnabled}
            onToggle={toggleAnalytics}
          />
          <ToggleRow
            label="Debug mode"
            description="Log analytics events to the browser console"
            enabled={debugMode}
            onToggle={toggleDebugMode}
          />
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" titleId="appearance-section-title">
        <ToggleRow
          label={theme === 'dark' ? 'Dark mode' : 'Light mode'}
          description="Switch between light and dark theme"
          enabled={theme === 'dark'}
          onToggle={toggleTheme}
          icon={theme === 'dark'
            ? <Moon style={{ width: 18, height: 18, color: 'var(--accent)' }} aria-hidden="true" />
            : <Sun style={{ width: 18, height: 18, color: 'var(--warning)' }} aria-hidden="true" />
          }
        />
      </Section>

      {/* Danger zone */}
      <div className="card-surface" style={{ borderColor: 'rgba(255,107,107,0.25)', padding: '18px 20px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Danger zone
        </h3>
        <button
          ref={resetTriggerRef}
          onClick={() => setShowResetConfirm(true)}
          aria-haspopup="dialog"
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.18)', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}
        >
          <Trash2 style={{ width: 18, height: 18, color: 'var(--error)', flexShrink: 0 }} aria-hidden="true" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--error)' }}>Reset all progress</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Permanently delete stats, streaks, and exam history</div>
          </div>
        </button>
      </div>

      {/* Auth modal — shown when guest tries to switch to a second cert */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {supportCertId && (
        <SupportAccessModal
          certId={supportCertId}
          certName={manifest.certifications.find((cert) => cert.id === supportCertId)?.name ?? supportCertId}
          onClose={() => setSupportCertId(null)}
          onUnlocked={() => {
            const targetCertId = supportCertId;
            setSupportCertId(null);
            if (hasActiveSession()) {
              setPendingCertId(targetCertId);
            } else {
              void selectCertAndTrack(targetCertId);
            }
          }}
        />
      )}

      {/* Reset confirmation modal — with focus trap, focus management, aria-labelledby, Escape */}
      {showResetConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
          onKeyDown={handleModalKeyDown}
          // Clicking the backdrop closes the modal
          onClick={(e) => { if (e.target === e.currentTarget) setShowResetConfirm(false); }}
        >
          <div className="modal-surface" style={{ padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <AlertTriangle style={{ width: 40, height: 40, color: 'var(--error)', margin: '0 auto 16px' }} aria-hidden="true" />
            <h2 id="reset-dialog-title" className="text-heading" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              Reset all progress?
            </h2>
            <p className="text-muted" style={{ margin: '0 0 24px', fontSize: 13, lineHeight: 1.6 }}>
              This will permanently delete all your question stats, exam history, study streaks, and bookmarks. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                ref={cancelBtnRef}
                onClick={() => setShowResetConfirm(false)}
                className="btn-ghost"
                style={{ flex: 1, borderRadius: 12, padding: '11px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                style={{ flex: 1, background: 'linear-gradient(135deg, var(--error), #e84545)', border: 'none', borderRadius: 12, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cert-switch confirm modal — shown when a session is in progress */}
      {pendingCertId && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-switch-title"
          aria-describedby="cert-switch-desc"
          onKeyDown={handleModalKeyDown}
          onClick={(e) => { if (e.target === e.currentTarget) setPendingCertId(null); }}
        >
          <div className="modal-surface" style={{ padding: '32px 28px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <AlertTriangle style={{ width: 40, height: 40, color: 'var(--warning)', margin: '0 auto 16px' }} aria-hidden="true" />
            <h2 id="cert-switch-title" className="text-heading" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              End your current session?
            </h2>
            <p id="cert-switch-desc" className="text-muted" style={{ margin: '0 0 24px', fontSize: 13, lineHeight: 1.6 }}>
              You have a study or exam session in progress. Switching the active
              cert will end that session and discard any unsaved answers.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                ref={certSwitchCancelRef}
                onClick={() => setPendingCertId(null)}
                className="btn-ghost"
                style={{ flex: 1, borderRadius: 12, padding: '11px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
              >
                Keep current cert
              </button>
              <button
                onClick={confirmCertSwitch}
                style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 12, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Switch anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, titleId, children }: { title: string; titleId: string; children: React.ReactNode }) {
  return (
    <div className="card-surface" style={{ padding: '18px 20px', marginBottom: 14 }}>
      <h3 id={titleId} className="text-heading" style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ActionRow({ icon, label, description, onClick }: { icon: React.ReactNode; label: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(79,124,255,0.35)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <span aria-hidden="true">{icon}</span>
      <div>
        <div className="text-heading" style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{description}</div>
      </div>
    </button>
  );
}

function ToggleRow({ label, description, enabled, onToggle, icon }: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <span aria-hidden="true" style={{ flexShrink: 0 }}>{icon}</span>}
        <div>
          <div className="text-heading" style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{description}</div>
        </div>
      </div>
      <span
        aria-hidden="true"
        style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: enabled ? 'rgba(45,212,191,0.15)' : 'var(--bg-tertiary)', color: enabled ? 'var(--success)' : 'var(--text-secondary)', border: `1px solid ${enabled ? 'rgba(45,212,191,0.25)' : 'var(--border)'}` }}
      >
        {enabled ? 'On' : 'Off'}
      </span>
    </button>
  );
}
