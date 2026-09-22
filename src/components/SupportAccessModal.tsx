import { Heart, X } from 'lucide-react';
import { grantSupportUnlock } from '../lib/certAccess';

const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/fredintech';

interface Props {
  certId: string;
  certName: string;
  onClose: () => void;
  onUnlocked: () => void;
}

export function SupportAccessModal({ certId, certName, onClose, onUnlocked }: Props) {
  const unlockWithContribution = () => {
    window.open(BUY_ME_A_COFFEE_URL, '_blank', 'noopener,noreferrer');
    grantSupportUnlock(certId);
    onUnlocked();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-access-title"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }}
    >
      <div className="modal-surface" style={{ width: 'min(100%, 440px)', padding: 'clamp(20px, 5vw, 28px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 id="support-access-title" className="text-heading" style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              Unlock another certification
            </h2>
            <p className="text-muted" style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.5 }}>
              Support CertArc to unlock <strong>{certName}</strong> for one certification switch.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close support options" style={{ border: 0, background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
          <button type="button" disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 15px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'not-allowed', opacity: 0.7 }}>
            <span>
              <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 13 }}>Watch a rewarded ad</strong>
              <span style={{ display: 'block', marginTop: 3, fontSize: 11 }}>Google web ad unit configuration required</span>
            </span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>Coming soon</span>
          </button>
          <button type="button" onClick={unlockWithContribution} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 15px', border: 0, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Heart style={{ width: 16, height: 16 }} aria-hidden="true" />
            Buy me a coffee
          </button>
        </div>
        <p className="text-muted" style={{ margin: '14px 0 0', fontSize: 11, lineHeight: 1.5 }}>
          The contribution link is temporary while payment verification is being set up.
        </p>
      </div>
    </div>
  );
}
