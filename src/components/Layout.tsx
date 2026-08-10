import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Bookmark,
  Settings,
  Flame,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../store/useTheme';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/study', icon: BookOpen, label: 'Practice' },
  { to: '/exam', icon: ClipboardCheck, label: 'Exam' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout() {
  const progress = useStore((s) => s.progress);
  const { theme, toggle } = useTheme();

  return (
    <div className="h-full w-full flex flex-col bg-[var(--bg-primary)]">
      {/* Top header bar */}
      <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-base font-bold gradient-text hidden sm:block">CertReady</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          {progress.studyStreak.current > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/20">
              <Flame className="w-4 h-4 text-[var(--warning)] animate-pulse-flame" aria-hidden="true" />
              <span className="text-sm font-semibold text-[var(--warning)]">
                {progress.studyStreak.current}
              </span>
              <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">day streak</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-[var(--bg-tertiary)] border border-[var(--border)]
              hover:border-[var(--accent)]/50 transition-all
              text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav
          className="w-16 lg:w-64 shrink-0 flex flex-col py-4 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]"
          aria-label="Main navigation"
        >
          <ul className="flex flex-col gap-2 px-3 lg:px-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group relative ${
                      isActive
                        ? `bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_8px_24px_-16px_var(--sidebar-active-shadow)]`
                        : `text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] hover:outline-[var(--warning)] hover:outline-2 hover:outline-offset-4 focus-visible:outline-[var(--warning)] focus-visible:outline-2 focus-visible:outline-offset-4`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-5 rounded-r-full bg-[var(--accent)]" />
                      )}
                      <Icon className="w-7 h-7 shrink-0 ml-0.5 lg:ml-0" aria-hidden="true" />
                      <span className="hidden lg:block text-lg font-semibold">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[calc(100%-4rem)] mx-auto px-4 lg:px-6 py-4 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <footer className="h-12 shrink-0 flex items-center justify-center border-t border-[var(--border)] bg-[var(--bg-secondary)]/80 text-xs text-[var(--text-secondary)]">
        Made by FredInTech
      </footer>
    </div>
  );
}
