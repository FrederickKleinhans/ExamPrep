import { useEffect, useState } from 'react'; import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Map as MapIcon,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Bookmark,
  Settings,
  Flame,
  ChevronRight,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../store/useTheme';
import { useAuth, getUserDisplayName, getUserAvatar } from '../store/useAuth';
import { DataLoader } from '../services/DataLoader';
import { CareerTrack, CatalogCert } from '../types';
import { AuthModal } from './AuthModal';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tracks', icon: MapIcon, label: 'Tracks' },
  { to: '/study', icon: BookOpen, label: 'Practice' },
  { to: '/exam', icon: ClipboardCheck, label: 'Exam' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const mobileTabItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/tracks', icon: MapIcon, label: 'Tracks' },
  { to: '/study', icon: BookOpen, label: 'Study' },
  { to: '/exam', icon: ClipboardCheck, label: 'Exam' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout() {
  const progress = useStore((s) => s.progress);
  const manifest = useStore((s) => s.manifest);
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [catalog, setCatalog] = useState<globalThis.Map<string, CatalogCert>>(new globalThis.Map());

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
        // non-critical
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const activeCertId = progress.selectedCertification;
  const activeTrackId = progress.selectedTrackId;

  const activeCert =
    catalog.get(activeCertId) ??
    (manifest?.certifications.find((c) => c.id === activeCertId)
      ? {
        code: manifest.certifications.find((c) => c.id === activeCertId)!.examCode,
        name: manifest.certifications.find((c) => c.id === activeCertId)!.name,
        vendorColor: 'var(--accent)',
      } as unknown as CatalogCert
      : null);

  const activeTrack = activeTrackId ? tracks.find((t) => t.id === activeTrackId) : null;
  const trackCertIds = activeTrack?.levels.flatMap((l) => l.certs.map((c) => c.certId)) ?? [];
  const certIndexInTrack = trackCertIds.indexOf(activeCertId);
  const certPosition = certIndexInTrack >= 0 ? `cert ${certIndexInTrack + 1} of ${trackCertIds.length}` : null;

  return (
    // Full-viewport shell
    <div
      className="bg-[var(--bg-primary)]"
      style={{ height: '100svh', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Skip to main content — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
        style={{ position: 'absolute', top: 8, left: 8, zIndex: 9999, background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
      >
        Skip to main content
      </a>
      {/* ── Inner flex row: sidebar + content ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 16, padding: 16 }}>

        {/* ── Sidebar (hidden on mobile, icon-only on tablet, full on desktop) ── */}
        <aside
          aria-label="Main navigation"
          className="sidebar-desktop sidebar-inner"
          style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
        >
          <div
            className="rounded-[28px] border border-[var(--sidebar-border)] backdrop-blur-xl"
            style={{
              height: '100%',
              background: 'var(--sidebar-bg)',
              boxShadow: theme === 'light'
                ? '0 4px 24px rgba(59,110,248,0.08), 0 1px 4px rgba(59,110,248,0.06)'
                : '0 22px 50px rgba(11,14,20,0.44)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {/* Brand */}
            <NavLink
              to="/"
              end
              aria-label="CertArc dashboard"
              className="sidebar-brand gradient-text"
              style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', padding: '8px 8px' }}
            >
              CertArc
            </NavLink>

            {/* Nav items */}
            <nav style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `sidebar-nav-item group relative flex items-center gap-3 rounded-2xl transition-all duration-200 ${isActive
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                    }`
                  }
                  style={{ padding: '10px 12px' }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="sidebar-active-bar absolute rounded-full bg-[var(--accent)]"
                          style={{ left: 8, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20 }}
                        />
                      )}
                      <span
                        className={`flex items-center justify-center rounded-xl border transition-all ${isActive
                          ? 'border-[var(--accent)]/20 bg-[var(--accent)]/10'
                          : 'border-transparent bg-[var(--bg-tertiary)]/80'
                          }`}
                        style={{ width: 34, height: 34, flexShrink: 0 }}
                      >
                        <Icon style={{ width: 15, height: 15 }} aria-hidden="true" />
                      </span>
                      <span className="sidebar-label" style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Active cert widget */}
            <div className="sidebar-cert-widget active-cert-widget" style={{ marginTop: 'auto', minWidth: 0 }}>
              {activeCert ? (
                <Link
                  to={`/certifications/${activeCertId}`}
                  className="group block hover:border-[var(--accent)]/30 transition-colors"
                  style={{
                    borderRadius: 20,
                    border: '1px solid rgba(var(--accent), 0.15)',
                    borderColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                    background: theme === 'light'
                      ? 'linear-gradient(135deg, #ffffff, #eef4ff)'
                      : 'rgba(var(--bg-tertiary), 0.6)',
                    backgroundColor: theme === 'light' ? '#f5f8ff' : undefined,
                    padding: 14,
                    boxShadow: theme === 'light' ? '0 2px 8px rgba(59,110,248,0.08)' : 'none',
                    textDecoration: 'none',
                    display: 'block',
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                  aria-label={`Go to ${activeCert.name}`}
                >
                  {activeTrack ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 13 }} aria-hidden="true">{activeTrack.icon}</span>
                      <span className="text-[var(--text-secondary)]" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        {activeTrack.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[var(--text-secondary)]" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
                      Current cert
                    </div>
                  )}
                  <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: (activeCert as CatalogCert).vendorColor ?? 'var(--accent)', overflowWrap: 'anywhere' }}>
                    {(activeCert as CatalogCert).code ?? activeCertId.toUpperCase()}
                  </div>
                  <div className="text-[var(--text-secondary)]" style={{ marginTop: 6, fontSize: 11, lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                    {activeCert.name}
                  </div>
                  {certPosition && (
                    <div className="text-[var(--text-secondary)]" style={{ marginTop: 4, fontSize: 10, opacity: 0.6 }}>{certPosition}</div>
                  )}
                  <div className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                    Open <ChevronRight style={{ width: 12, height: 12 }} />
                  </div>
                </Link>
              ) : (
                <Link
                  to="/tracks"
                  className="block text-center hover:border-[var(--accent)]/30 transition-colors"
                  style={{ borderRadius: 20, border: '1px dashed var(--border)', padding: 14, textDecoration: 'none', backgroundColor: theme === 'light' ? 'rgba(59,110,248,0.03)' : 'rgba(255,255,255,0.02)' }}
                >
                  <div className="text-[var(--text-secondary)]" style={{ fontSize: 11, marginBottom: 4 }}>No path selected</div>
                  <div className="text-[var(--accent)]" style={{ fontSize: 12, fontWeight: 700 }}>Choose a track →</div>
                </Link>
              )}
            </div>

            {/* Auth widget */}
            <div className="sidebar-auth-widget" style={{ marginTop: 10, minWidth: 0 }}>
              {user ? (
                <div className="sidebar-user-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                  {getUserAvatar(user) ? (
                    <img src={getUserAvatar(user)!} alt="" aria-hidden="true" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }} aria-hidden="true">
                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    </span>
                  )}
                  <span className="sidebar-label text-[var(--text-secondary)]" style={{ fontSize: 12, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getUserDisplayName(user)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    aria-label="Sign out"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2, flexShrink: 0 }}
                    title="Sign out"
                  >
                    <LogOut style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  aria-label="Sign in to CertArc"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 12px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  <LogIn style={{ width: 14, height: 14 }} aria-hidden="true" />
                  <span className="sidebar-label">Sign in</span>
                </button>
              )}
            </div>

            {/* Study streak */}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 4px' }}>
              {progress.studyStreak.current > 0 && (
                <div className="sidebar-label text-[var(--warning)]" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, marginRight: 'auto' }}>
                  <Flame style={{ width: 14, height: 14 }} className="animate-pulse-flame" aria-hidden="true" />
                  <span>{progress.studyStreak.current}d streak</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main id="main-content" style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <div style={{ width: '100%', padding: '4px 8px', minHeight: '100%' }}>
            <ErrorBanner />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer — hidden on mobile */}
      <footer
        className="border-t border-[var(--border)] text-[var(--text-secondary)]"
        style={{
          height: 40,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          background: theme === 'light' ? '#ffffff' : 'rgba(18,23,31,0.8)',
        }}
      >
        <span className="hidden md:block">Made by FredInTech</span>
      </footer>

      {/* Auth modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--sidebar-border)]"
        aria-label="Mobile navigation"
        style={{
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: 'none', // shown via CSS media query
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '6px 0' }}>
          {mobileTabItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={{ textDecoration: 'none' }}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-[var(--accent)]/12' : ''
                      }`}
                    style={{ width: 36, height: 28 }}
                  >
                    <Icon style={{ width: 18, height: 18 }} aria-hidden="true" />
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
          {/* Auth button in mobile tab bar */}
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[var(--text-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ width: 36, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getUserAvatar(user) ? (
                  <img src={getUserAvatar(user)!} alt="" aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                ) : (
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }} aria-hidden="true">
                    {getUserDisplayName(user).charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>Account</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              aria-label="Sign in"
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ width: 36, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogIn style={{ width: 18, height: 18 }} aria-hidden="true" />
              </span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>Sign in</span>
            </button>
          )}
        </div>
      </nav>

      {/* Polite live region — screen readers announce non-critical
          state changes (cert switched, exam finished) without stealing
          visual focus. The element is visually hidden but always in the
          accessibility tree. */}
      <div
        id="certarc-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}

// ── Error banner ────────────────────────────────────────────────────────────

function ErrorBanner() {
  const error = useStore((s) => s.error);
  const retryLastLoad = useStore((s) => s.retryLastLoad);
  const dismissError = useStore((s) => s.dismissError);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      // Auto-retry when connection is restored and there's a pending error
      if (error) void retryLastLoad();
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [error, retryLastLoad]);

  const displayMessage = isOffline
    ? 'You appear to be offline. Check your connection.'
    : error;

  if (!displayMessage) return null;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        padding: '11px 16px',
        borderRadius: 12,
        background: isOffline ? 'rgba(255,174,0,0.08)' : 'rgba(255,107,107,0.08)',
        border: `1px solid ${isOffline ? 'rgba(255,174,0,0.25)' : 'rgba(255,107,107,0.25)'}`,
        fontSize: 13,
        color: isOffline ? 'var(--warning)' : 'var(--error)',
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true">
        {isOffline ? '📶' : '⚠️'}
      </span>
      <span style={{ flex: 1 }}>{displayMessage}</span>
      {!isOffline && error && (
        <>
          <button
            type="button"
            onClick={() => void retryLastLoad()}
            aria-label="Retry loading"
            className="btn-ghost"
            style={{ borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: 'var(--error)', cursor: 'pointer', flexShrink: 0 }}
          >
            Retry
          </button>
          <button
            type="button"
            onClick={dismissError}
            aria-label="Dismiss error"
            style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
