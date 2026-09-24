import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface Props {
  onClose: () => void;
}

type Tab = 'signin' | 'signup';

// Google icon as SVG (not in lucide)
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function AuthModal({ onClose }: Props) {
  const { signInWithEmail, signUpWithEmail, signInWithProvider, isLoading, error, clearError } = useAuth();

  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input on open
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 10);
    return () => clearError();
  }, [clearError]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((el) => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, [onClose]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured) {
      setLocalError('Sign-in is temporarily unavailable. Please try again later.');
      return;
    }

    if (!email || !password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const err = tab === 'signin'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password);

    if (!err) {
      if (tab === 'signup') {
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      } else {
        onClose();
      }
    }
  };

  const handleProvider = async (provider: 'google' | 'github') => {
    setLocalError(null);
    if (!isSupabaseConfigured) {
      setLocalError('Sign-in is temporarily unavailable. Please try again later.');
      return;
    }
    await signInWithProvider(provider);
    // Page redirects for OAuth when the provider is configured.
  };

  const displayError = localError || error;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onKeyDown={handleKeyDown}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="modal-surface"
        style={{ width: 'min(100%, 420px)', maxWidth: 420, padding: 'clamp(18px, 5vw, 28px)', boxSizing: 'border-box' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 id="auth-modal-title" className="text-heading" style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              {tab === 'signin' ? 'Sign in to CertArc' : 'Create your account'}
            </h2>
            <p className="text-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
              {tab === 'signin' ? 'Sync your progress across devices.' : 'Free to start — no card needed.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 8, display: 'flex' }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          role="tablist"
          style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4 }}
        >
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`auth-tab-${t}`}
              aria-selected={tab === t}
              aria-controls="auth-form"
              onClick={() => { setTab(t); setLocalError(null); clearError(); setSuccessMsg(null); }}
              style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-secondary)' }}
            >
              {t === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => handleProvider('google')}
            disabled={isLoading}
            aria-label="Continue with Google"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleProvider('github')}
            disabled={isLoading}
            aria-label="Continue with GitHub"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="text-muted" style={{ fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Email form */}
        <form id="auth-form" onSubmit={handleEmailSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-live="polite">
          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="text-muted" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-secondary)' }} aria-hidden="true" />
              <input
                ref={firstInputRef}
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="text-muted" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-secondary)' }} aria-hidden="true" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                required
                style={{ width: '100%', padding: '10px 40px 10px 36px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 2, display: 'flex' }}
              >
                {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </div>

          {/* Error / success */}
          {displayError && (
            <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--error)', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              {displayError}
            </p>
          )}
          {successMsg && (
            <p role="status" style={{ margin: 0, fontSize: 13, color: 'var(--success)', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              {successMsg}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: isLoading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: isLoading ? 'var(--text-secondary)' : '#fff', fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isLoading ? (
              <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--text-secondary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Loading…</>
            ) : (
              tab === 'signin' ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>

        {/* Guest note */}
        <p className="text-muted" style={{ margin: '16px 0 0', fontSize: 12, textAlign: 'center' }}>
          You can always use CertArc without an account — progress saves locally on this device.
        </p>
      </div>
    </div>
  );
}
