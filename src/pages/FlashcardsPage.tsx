import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProgressService } from '../services/ProgressService';
import { DataLoader, DataLoadError } from '../services/DataLoader';
import { createFlashcards } from '../services/FlashcardService';
import type { Flashcard } from '../services/FlashcardService';
import type { FlashcardSchedule, Topic } from '../types';

const EMPTY_SCHEDULES: Record<string, FlashcardSchedule> = {};
const EMPTY_FLASHCARDS: Flashcard[] = [];
const today = () => new Date().toISOString().slice(0, 10);

export function FlashcardsPage() {
  const progress = useStore((state) => state.progress);
  const manifest = useStore((state) => state.manifest);
  const refreshProgress = useStore((state) => state.refreshProgress);
  const certificationId = progress.selectedCertification;
  const certification = manifest?.certifications.find((item) => item.id === certificationId);
  const [bankQuestions, setBankQuestions] = useState<Flashcard[] | null>(null);
  const [bankTopics, setBankTopics] = useState<Topic[]>([]);
  const [bankCertificationName, setBankCertificationName] = useState('');
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle');
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [topic, setTopic] = useState('all');
  const [dueOnly, setDueOnly] = useState(true);
  const [sessionSize, setSessionSize] = useState(10);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[] | null>(null);
  const schedules = progress.certifications[certificationId]?.flashcards ?? EMPTY_SCHEDULES;

  useEffect(() => {
    setBankQuestions(null);
    setBankTopics([]);
    setBankCertificationName('');
    setTopic('all');
    setDueOnly(true);
    setRevealed(false);
    setSession([]);
    setQueue(null);

    if (!certificationId) {
      setLoadState('idle');
      return;
    }

    let cancelled = false;
    setLoadState('loading');
    setLoadError('');

    void Promise.all([
      DataLoader.loadQuestionBank(certificationId),
      DataLoader.loadCertification(certificationId),
    ]).then(([bank, certificationData]) => {
      if (cancelled) return;
      setBankQuestions(createFlashcards(bank.questions));
      setBankTopics(certificationData.topics);
      setBankCertificationName(certificationData.name);
      setLoadState('ready');
    }).catch((error: unknown) => {
      if (cancelled) return;
      if (error instanceof DataLoadError && error.kind === 'not-found') {
        setLoadState('unavailable');
        return;
      }
      const message = error instanceof Error ? error.message : 'Could not load this certification question bank.';
      setLoadError(message);
      setLoadState('error');
    });

    return () => {
      cancelled = true;
    };
  }, [certificationId, retryKey]);

  const flashcards = bankQuestions ?? EMPTY_FLASHCARDS;
  const topics = bankTopics.length > 0 ? bankTopics : certification?.topics ?? [];
  const certificationName = bankCertificationName || certification?.name || 'Active certification';
  const dueCards = useMemo(() => flashcards.filter((card) => {
    const matchesTopic = topic === 'all' || card.topicId === topic;
    const schedule = schedules[card.id];
    const due = !schedule || schedule.dueDate <= today();
    return matchesTopic && (!dueOnly || due);
  }), [flashcards, topic, dueOnly, schedules]);
  const queueIds = queue ?? dueCards.slice(0, sessionSize).map((card) => card.id);
  const cardById = useMemo(() => new Map(flashcards.map((card) => [card.id, card])), [flashcards]);
  const card = cardById.get(queueIds[0]);
  const reviewedCount = flashcards.reduce((count, item) => count + Number(Boolean(schedules[item.id])), 0);

  function resetSession() {
    setSession([]);
    setRevealed(false);
    setQueue(null);
  }

  function rate(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!card || !certificationId) return;
    ProgressService.rateFlashcard(certificationId, card.id, rating);
    refreshProgress();
    setSession((current) => [...current, card.id]);
    setQueue(queueIds.filter((id) => id !== card.id));
    setRevealed(false);
  }

  function restart() {
    setSession([]);
    setRevealed(false);
    setQueue(dueCards.slice(0, sessionSize).map((item) => item.id));
  }

  if (!certificationId) {
    return <main className="page-root flashcards-page">
      <header style={{ marginBottom: 22 }}>
        <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em' }}>Question bank review</p>
        <h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Flashcards</h1>
      </header>
      <section className="card-surface flashcard-empty">
        <h2 className="text-heading" style={{ marginTop: 0 }}>Choose a certification</h2>
        <p className="text-muted" style={{ lineHeight: 1.6 }}>Activate a certification to review flashcards made from its question bank.</p>
        <Link to="/tracks" className="flashcard-reveal" style={{ display: 'inline-block', textDecoration: 'none' }}>Browse career paths</Link>
      </section>
    </main>;
  }

  return <main className="page-root flashcards-page">
    <header className="page-header flashcards-header">
      <div>
        <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 6 }}>{certificationName}</p>
        <h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Flashcards</h1>
        <p className="text-muted" style={{ margin: '6px 0 0', fontSize: 13 }}>Recall the answer, reveal it, then rate how well you remembered.</p>
      </div>
      {loadState === 'ready' && flashcards.length > 0 && <div className="page-header-controls">
        <select className="input-surface" aria-label="Filter flashcards by topic" value={topic} onChange={(event) => { setTopic(event.target.value); resetSession(); }}>
          <option value="all">All topics</option>
          {topics.filter((item) => flashcards.some((cardItem) => cardItem.topicId === item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select
          className="input-surface"
          aria-label="Flashcards per session"
          value={sessionSize}
          onChange={(event) => {
            setSessionSize(Number(event.target.value));
            resetSession();
          }}
        >
          {[5, 10, 15, 20].map((count) => <option key={count} value={count}>{count} cards</option>)}
        </select>
        <button type="button" className="btn-ghost" aria-pressed={dueOnly} onClick={() => { setDueOnly((value) => !value); resetSession(); }} style={{ borderRadius: 10, padding: '9px 12px' }}>{dueOnly ? 'Due cards' : 'All cards'}</button>
      </div>}
    </header>

    {loadState === 'loading' && <section className="card-surface flashcard-empty" role="status"><p className="text-muted">Loading the question bank…</p></section>}

    {loadState === 'error' && <section className="card-surface flashcard-empty" role="alert">
      <h2 className="text-heading">Could not load flashcards</h2>
      <p className="text-muted" style={{ lineHeight: 1.6 }}>{loadError}</p>
      <button type="button" className="btn-ghost" onClick={() => setRetryKey((value) => value + 1)}>Retry</button>
    </section>}

    {loadState === 'unavailable' && <section className="card-surface flashcard-empty">
      <h2 className="text-heading">Question bank not available yet</h2>
      <p className="text-muted" style={{ lineHeight: 1.6 }}>This certification does not have a compiled question bank, so there are no flashcards to review yet.</p>
      <Link to="/tracks" className="flashcard-reveal" style={{ display: 'inline-block', textDecoration: 'none' }}>Browse career paths</Link>
    </section>}

    {loadState === 'ready' && flashcards.length === 0 && <section className="card-surface flashcard-empty">
      <h2 className="text-heading">No flashcards available</h2>
      <p className="text-muted" style={{ lineHeight: 1.6 }}>This question bank has no questions with a supported answer format yet.</p>
    </section>}

    {loadState === 'ready' && flashcards.length > 0 && <>
      <section aria-label="Flashcard progress" className="card-surface flashcard-progress">
        <span className="text-muted"><strong className="text-heading">{reviewedCount}</strong> of {flashcards.length} cards reviewed</span>
        <span className="text-muted"><strong className="text-heading">{queueIds.length}</strong> in this session</span>
        {session.length > 0 && <span className="text-muted"><strong className="text-heading">{session.length}</strong> rated this session</span>}
      </section>

      {card ? <section className="card-surface flashcard-review">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span className="text-muted" style={{ fontSize: 12 }}>{topics.find((item) => item.id === card.topicId)?.name ?? 'Certification concepts'}</span>
          <span className="text-muted" style={{ fontSize: 12 }}>Card {session.length + 1} · {queueIds.length} remaining</span>
        </div>
        <div key={card.id} className={`flashcard-scene${revealed ? ' is-flipped' : ''}`} aria-live="polite" aria-atomic="true">
          <div className="flashcard-flipper">
            <div className="flashcard-face flashcard-front" aria-hidden={revealed}>
              <p className="text-muted flashcard-eyebrow">Question</p>
              <h2 className="text-heading flashcard-copy">{card.front}</h2>
            </div>
            <div id="flashcard-answer" className="flashcard-face flashcard-back" aria-hidden={!revealed}>
              <p className="text-muted flashcard-eyebrow">Answer</p>
              <p className="text-heading flashcard-copy flashcard-answer-copy">{card.back}</p>
              {card.source && <p className="text-muted flashcard-source">{/^https?:\/\//i.test(card.source)
                ? <>Source: <a href={card.source} target="_blank" rel="noreferrer">{card.source}</a></>
                : `Source: ${card.source}`}</p>}
            </div>
          </div>
        </div>
        <div>
          <button type="button" aria-expanded={revealed} aria-controls="flashcard-answer" onClick={() => setRevealed((value) => !value)} className="flashcard-reveal">{revealed ? 'Show question' : 'Reveal answer'}</button>
          {revealed && <div style={{ marginTop: 16 }}>
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 12, margin: '0 0 10px' }}>How well did you recall it?</p>
            <div className="flashcard-ratings">{([['again', 'Again'], ['hard', 'Hard'], ['good', 'Good'], ['easy', 'Easy']] as const).map(([rating, label]) => <button key={rating} type="button" onClick={() => rate(rating)}>{label}</button>)}</div>
          </div>}
        </div>
      </section> : <section className="card-surface flashcard-empty">
        <div style={{ fontSize: 34, marginBottom: 10 }}>✓</div>
        <h2 className="text-heading" style={{ margin: '0 0 8px' }}>{queue !== null ? 'Review session complete' : 'No cards due'}</h2>
        <p className="text-muted" style={{ lineHeight: 1.6 }}>{queue !== null ? `You rated ${session.length} ${session.length === 1 ? 'card' : 'cards'}. Your flashcard schedule is saved separately from practice and exam history.` : 'You are all caught up for this topic. Switch to All cards to keep studying.'}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button type="button" className="btn-ghost" onClick={restart} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 12, padding: '10px 14px' }}><RotateCcw size={15} /> Restart view</button>
          {dueOnly && <button type="button" className="btn-ghost" onClick={() => { setDueOnly(false); resetSession(); }} style={{ borderRadius: 12, padding: '10px 14px' }}>Study all cards</button>}
        </div>
      </section>}
    </>}
  </main>;
}
