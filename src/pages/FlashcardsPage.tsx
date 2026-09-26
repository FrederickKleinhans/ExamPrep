import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProgressService } from '../services/ProgressService';
import { az900Flashcards, flashcardTopicName } from '../content/az900Flashcards';
import { FlashcardSchedule } from '../types';

const PILOT_CERT_ID = 'az-900';
const EMPTY_SCHEDULES: Record<string, FlashcardSchedule> = {};
const today = () => new Date().toISOString().slice(0, 10);

export function FlashcardsPage() {
  const { progress, manifest, refreshProgress } = useStore();
  const [topic, setTopic] = useState('all');
  const [dueOnly, setDueOnly] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[] | null>(null);
  const selectedCert = progress.selectedCertification;
  const certProgress = progress.certifications[PILOT_CERT_ID];
  const schedules = certProgress?.flashcards ?? EMPTY_SCHEDULES;
  const topics = manifest?.certifications.find((c) => c.id === PILOT_CERT_ID)?.topics ?? [];

  const dueCards = useMemo(() => az900Flashcards.filter((card) => {
    const matchesTopic = topic === 'all' || card.topicId === topic;
    const schedule = schedules[card.id];
    const due = !schedule || schedule.dueDate <= today();
    return matchesTopic && (!dueOnly || due);
  }), [topic, dueOnly, schedules]);

  const reviewedCount = Object.keys(schedules).length;
  const queueIds = queue ?? dueCards.map((item) => item.id);
  const card = az900Flashcards.find((item) => item.id === queueIds[0]);

  function rate(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!card) return;
    ProgressService.rateFlashcard(PILOT_CERT_ID, card.id, rating);
    refreshProgress();
    setSession((current) => [...current, card.id]);
    setQueue(queueIds.filter((id) => id !== card.id));
    setRevealed(false);
  }

  function restart() {
    setSession([]);
    setRevealed(false);
    setQueue(dueCards.map((item) => item.id));
  }

  if (selectedCert !== PILOT_CERT_ID) {
    return <main className="page-root flashcards-page">
      <header style={{ marginBottom: 22 }}><p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em' }}>Free pilot deck</p><h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Flashcards</h1></header>
      <section className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
        <h2 className="text-heading" style={{ marginTop: 0 }}>AZ-900 flashcards</h2>
        <p className="text-muted" style={{ lineHeight: 1.6 }}>This pilot deck is available with Microsoft Azure Fundamentals. Activate AZ-900 to review 22 purpose-written concept cards.</p>
        <Link to="/tracks" style={{ display: 'inline-block', marginTop: 10, padding: '11px 18px', borderRadius: 12, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Browse career paths</Link>
      </section>
    </main>;
  }

  return <main className="page-root flashcards-page">
    <header className="page-header flashcards-header">
      <div><p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 6 }}>Microsoft Azure Fundamentals · Free pilot</p><h1 className="text-heading" style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Flashcards</h1><p className="text-muted" style={{ margin: '6px 0 0', fontSize: 13 }}>Recall the idea first, then reveal and rate how well you knew it.</p></div>
      <div className="page-header-controls">
        <select className="input-surface" aria-label="Filter flashcards by topic" value={topic} onChange={(event) => { setTopic(event.target.value); setQueue(null); setSession([]); setRevealed(false); }}>
          <option value="all">All topics</option>{topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button type="button" className="btn-ghost" aria-pressed={dueOnly} onClick={() => { setDueOnly((value) => !value); setQueue(null); setSession([]); setRevealed(false); }} style={{ borderRadius: 10, padding: '9px 12px' }}>{dueOnly ? 'Due cards' : 'All cards'}</button>
      </div>
    </header>

    <section aria-label="Flashcard progress" className="card-surface flashcard-progress">
      <span className="text-muted"><strong className="text-heading">{reviewedCount}</strong> of {az900Flashcards.length} cards reviewed</span>
      <span className="text-muted"><strong className="text-heading">{queueIds.length}</strong> in this session</span>
      {session.length > 0 && <span className="text-muted"><strong className="text-heading">{session.length}</strong> rated this session</span>}
    </section>

    {card ? <section className="card-surface flashcard-review">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><span className="text-muted" style={{ fontSize: 12 }}>{flashcardTopicName(topics, card.topicId)}</span><span className="text-muted" style={{ fontSize: 12 }}>Card {session.length + 1} · {queueIds.length} remaining</span></div>
      <div key={card.id} className={`flashcard-scene${revealed ? ' is-flipped' : ''}`} aria-live="polite" aria-atomic="true">
        <div className="flashcard-flipper">
          <div className="flashcard-face flashcard-front" aria-hidden={revealed}>
            <p className="text-muted flashcard-eyebrow">Think of the answer</p>
            <h2 className="text-heading flashcard-copy">{card.front}</h2>
          </div>
          <div id="flashcard-answer" className="flashcard-face flashcard-back" aria-hidden={!revealed}>
            <p className="text-muted flashcard-eyebrow">Answer</p>
            <h2 className="text-heading flashcard-copy">{card.back}</h2>
            <p className="text-muted flashcard-source">Source: {card.source}</p>
          </div>
        </div>
      </div>
      <div>
        <button type="button" aria-expanded={revealed} aria-controls="flashcard-answer" onClick={() => setRevealed((value) => !value)} className="flashcard-reveal">{revealed ? 'Show question' : 'Reveal answer'}</button>
        {revealed && <div style={{ marginTop: 16 }}><p className="text-muted" style={{ textAlign: 'center', fontSize: 12, margin: '0 0 10px' }}>How well did you recall it?</p><div className="flashcard-ratings">{([['again', 'Again'], ['hard', 'Hard'], ['good', 'Good'], ['easy', 'Easy']] as const).map(([rating, label]) => <button key={rating} type="button" onClick={() => rate(rating)}>{label}</button>)}</div></div>}
      </div>
    </section> : <section className="card-surface flashcard-empty">
      <div style={{ fontSize: 34, marginBottom: 10 }}>✓</div><h2 className="text-heading" style={{ margin: '0 0 8px' }}>{queue !== null ? 'Review session complete' : 'No cards due'}</h2><p className="text-muted" style={{ lineHeight: 1.6 }}>{queue !== null ? `You rated ${session.length} ${session.length === 1 ? 'card' : 'cards'}. Your flashcard schedule is saved separately from practice and exam history.` : 'You are all caught up for this topic. Switch to All cards to keep studying.'}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 18 }}><button type="button" className="btn-ghost" onClick={restart} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 12, padding: '10px 14px' }}><RotateCcw size={15} /> Restart view</button>{dueOnly && <button type="button" className="btn-ghost" onClick={() => { setDueOnly(false); setQueue(null); setSession([]); setRevealed(false); }} style={{ borderRadius: 12, padding: '10px 14px' }}>Study all cards</button>}</div>
    </section>}
  </main>;
}
