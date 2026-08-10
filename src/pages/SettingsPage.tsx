import { useEffect, useRef, useState } from 'react';
import { Settings, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProgressService } from '../services/ProgressService';
import { usePreferences } from '../store/usePreferences';

export function SettingsPage() {
  const { manifest, progress, initialize, isLoading, selectCertification, refreshProgress } = useStore();
  const { analyticsEnabled, toggleAnalytics, debugMode, toggleDebugMode } = usePreferences();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!manifest) initialize();
  }, [manifest, initialize]);

  if (isLoading || !manifest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  const handleExport = () => {
    const data = ProgressService.exportProgress();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certready-progress-${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--accent)]" aria-hidden="true" />
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your certification, data, and preferences
        </p>
      </div>

      {/* Certification Selector */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Active Certification</h3>
        <select
          value={progress.selectedCertification}
          onChange={(e) => selectCertification(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] 
            text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]
            min-h-[44px] cursor-pointer"
          aria-label="Select certification"
        >
          {manifest.certifications.map((cert) => (
            <option key={cert.id} value={cert.id}>
              {cert.examCode} — {cert.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Switching certifications loads a new question bank. Your progress is saved per certification.
        </p>
      </div>

      {/* Data Management */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Data Management</h3>
        <div className="space-y-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)]
              hover:bg-[var(--border)] transition-colors text-left min-h-[44px]"
          >
            <Download className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Export Progress</div>
              <div className="text-xs text-[var(--text-secondary)]">Download your progress as JSON</div>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)]
              hover:bg-[var(--border)] transition-colors text-left min-h-[44px]"
          >
            <Upload className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Import Progress</div>
              <div className="text-xs text-[var(--text-secondary)]">Load previously exported progress</div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            aria-label="Import progress file"
          />

          {importStatus === 'success' && (
            <p className="text-sm text-[var(--success)] px-4">Progress imported successfully!</p>
          )}
          {importStatus === 'error' && (
            <p className="text-sm text-[var(--error)] px-4">Invalid file format. Please use a CertReady export file.</p>
          )}
        </div>
      </div>

      {/* Analytics & Privacy */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Analytics & Privacy</h3>
        <div className="space-y-3">
          <button
            type="button"
            onClick={toggleAnalytics}
            aria-pressed={analyticsEnabled}
            className="w-full text-left px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Anonymous analytics</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Allow CertReady to send anonymous study and exam event data for better progress insights.
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  analyticsEnabled ? 'bg-[var(--success)] text-black' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                {analyticsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={toggleDebugMode}
            aria-pressed={debugMode}
            className="w-full text-left px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Debug mode</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Show analytics event logs in the console and help troubleshoot behavior.
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  debugMode ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                {debugMode ? 'On' : 'Off'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--error)]/30 p-5">
        <h3 className="text-sm font-semibold text-[var(--error)] mb-3">Danger Zone</h3>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--error)]/10
            hover:bg-[var(--error)]/20 transition-colors text-left min-h-[44px] border border-[var(--error)]/20"
        >
          <Trash2 className="w-5 h-5 text-[var(--error)] shrink-0" aria-hidden="true" />
          <div>
            <div className="text-sm font-medium text-[var(--error)]">Reset All Progress</div>
            <div className="text-xs text-[var(--text-secondary)]">
              Permanently delete all stats, streaks, and exam history
            </div>
          </div>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full">
            <AlertTriangle className="w-10 h-10 text-[var(--error)] mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">Reset All Progress?</h2>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This will permanently delete all your question stats, exam history, study streaks, and bookmarks.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg border border-[var(--border)] text-[var(--text-secondary)]
                  hover:bg-[var(--bg-tertiary)] transition-colors text-sm min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 rounded-lg bg-[var(--error)] text-white font-medium
                  hover:bg-[var(--error)]/80 transition-colors text-sm min-h-[44px]"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
