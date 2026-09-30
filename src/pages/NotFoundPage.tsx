import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--text-secondary)]">404</p>
      <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Page not found</h1>
      <p className="text-sm text-[var(--text-secondary)]">The page you requested doesn’t exist.</p>
      <Link to="/" className="text-sm font-semibold text-[var(--accent)] hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
