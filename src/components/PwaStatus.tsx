import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaStatus() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh && !offlineReady) return null;

  const dismiss = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <div
      role="status"
      className="card-surface"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 420,
        padding: '12px 16px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
      }}
    >
      <span className="text-muted" style={{ fontSize: 13 }}>
        {needRefresh ? 'A new CertArc version is ready.' : 'CertArc is ready to use offline.'}
      </span>
      {needRefresh && (
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="btn-ghost"
          style={{ padding: '6px 10px', fontSize: 12 }}
        >
          Update
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="btn-ghost"
        aria-label="Dismiss offline status"
        style={{ padding: '6px 10px', fontSize: 12 }}
      >
        Dismiss
      </button>
    </div>
  );
}
