import { CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Explanation } from '../types';

interface Props {
  explanation: Explanation;
  isCorrect: boolean;
  onNext?: () => void;
}

export function ExplanationPanel({ explanation, isCorrect, onNext }: Props) {
  return (
    <div style={{ marginTop: 20 }} aria-live="polite">
      {/* Result banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        borderRadius: 14,
        marginBottom: 14,
        background: isCorrect ? 'rgba(45,212,191,0.08)' : 'rgba(255,107,107,0.08)',
        border: `1px solid ${isCorrect ? 'rgba(45,212,191,0.3)' : 'rgba(255,107,107,0.3)'}`,
        boxShadow: isCorrect ? '0 0 24px rgba(45,212,191,0.12)' : '0 0 24px rgba(255,107,107,0.12)',
      }}>
        {isCorrect
          ? <CheckCircle style={{ width: 20, height: 20, color: '#2dd4bf', flexShrink: 0 }} aria-hidden="true" />
          : <XCircle style={{ width: 20, height: 20, color: '#ff6b6b', flexShrink: 0 }} aria-hidden="true" />
        }
        <span style={{ fontWeight: 700, fontSize: 15, color: isCorrect ? '#2dd4bf' : '#ff6b6b' }}>
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </span>
      </div>

      {/* Explanation */}
      <div style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#a9b9d0', lineHeight: 1.7 }}>
          {isCorrect ? explanation.correct : explanation.incorrect}
        </p>
      </div>

      {/* Exam tip */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, boxShadow: '0 0 20px rgba(79,124,255,0.08)' }}>
        <Lightbulb style={{ width: 16, height: 16, color: '#58a6ff', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#58a6ff' }}>Exam tip</p>
          <p style={{ margin: 0, fontSize: 13, color: '#a9b9d0', lineHeight: 1.6 }}>{explanation.examTip}</p>
        </div>
      </div>

      {/* Next button */}
      {onNext && (
        <button
          onClick={onNext}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #4f7cff, #3568e8)', border: 'none', borderRadius: 14, padding: '13px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 12px 28px rgba(79,124,255,0.3)' }}
        >
          Next question
          <ArrowRight style={{ width: 16, height: 16 }} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
