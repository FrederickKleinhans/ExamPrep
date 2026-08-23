import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { QuestionCard } from '../components/QuestionCard';
import { Question } from '../types';
import { ProgressService } from '../services/ProgressService';

const difficultyColor: Record<string, { color: string; bg: string }> = {
  easy: { color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
  medium: { color: '#ffae00', bg: 'rgba(255,174,0,0.1)' },
  hard: { color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
};

export function BookmarksPage() {
  const { manifest, questionBank, progress, initialize, isLoading } = useStore();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!manifest) initialize();
  }, [manifest, initialize]);

  if (isLoading || !manifest) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const certId = progress.selectedCertification;

  // No active cert
  if (!certId || !questionBank) {
    return (
      <div style={{ minHeight: '100%', color: '#edf3ff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8ea2c2', marginBottom: 6 }}>Study</p>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#f0f4f8' }}>Bookmarks</h1>
        </div>
        <div style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.78), rgba(15,23,35,0.62))', border: '1px solid rgba(148,163,184,0.13)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#f0f4f8' }}>No active certification</h2>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8ea2c2' }}>Set an active cert in Settings to see your bookmarks.</p>
          <button
            onClick={() => navigate('/settings')}
            style={{ background: 'linear-gradient(135deg, #4f7cff, #3568e8)', border: 'none', borderRadius: 12, padding: '11px 24px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  const certificationProgress = ProgressService.getCertificationProgress(progress, questionBank.certificationId);
  const bookmarkedQuestions = questionBank.questions.filter((q) => certificationProgress.bookmarks.includes(q.id));

  // Question detail view
  if (selectedQuestion) {
    return (
      <div style={{ minHeight: '100%', color: '#edf3ff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        <button
          onClick={() => setSelectedQuestion(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8ea2c2', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to bookmarks
        </button>
        <QuestionCard
          question={selectedQuestion}
          showExplanation={true}
          selectedAnswer={null}
          isCorrect={null}
          onSubmit={() => { }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', color: '#edf3ff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8ea2c2', marginBottom: 6 }}>Study</p>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#f0f4f8', lineHeight: 1.1 }}>Bookmarks</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#8ea2c2' }}>
          {bookmarkedQuestions.length} saved question{bookmarkedQuestions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {bookmarkedQuestions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bookmarkedQuestions.map((question) => {
            const stat = certificationProgress.questionStats[question.id];
            const ds = difficultyColor[question.difficulty] ?? difficultyColor.medium;
            return (
              <button
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: 'linear-gradient(180deg, rgba(17,24,39,0.78), rgba(15,23,35,0.62))', border: '1px solid rgba(148,163,184,0.13)', borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(79,124,255,0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.13)')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 14, color: '#f0f4f8', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {question.questionText}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: ds.bg, color: ds.color, textTransform: 'capitalize' }}>
                      {question.difficulty}
                    </span>
                    <span style={{ fontSize: 11, color: '#8ea2c2' }}>{question.topicId.replace(/-/g, ' ')}</span>
                  </div>
                </div>
                {stat && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: stat.correct > stat.incorrect ? '#2dd4bf' : '#ff6b6b' }}>
                      {stat.correct}/{stat.attempts}
                    </div>
                    <div style={{ fontSize: 10, color: '#8ea2c2' }}>correct</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.78), rgba(15,23,35,0.62))', border: '1px solid rgba(148,163,184,0.13)', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#f0f4f8' }}>No bookmarks yet</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#8ea2c2', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            Tap the bookmark icon on any question during study to save it here.
          </p>
        </div>
      )}
    </div>
  );
}
