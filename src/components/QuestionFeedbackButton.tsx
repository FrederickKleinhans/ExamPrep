import { FormEvent, useState } from 'react';
import { Flag } from 'lucide-react';
import type { QuestionFeedbackCategory } from '../services/QuestionFeedbackService';
import { submitQuestionFeedback } from '../services/QuestionFeedbackService';
import { useAuth } from '../store/useAuth';

interface Props {
  certificationId: string;
  questionId: string;
}

export function QuestionFeedbackButton({ certificationId, questionId }: Props) {
  const userId = useAuth((state) => state.user?.id ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<QuestionFeedbackCategory>('incorrect');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await submitQuestionFeedback({ certificationId, questionId, category, details, userId });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit this report.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setSubmitted(false);
          setError(null);
        }}
        className="btn-ghost"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 10px', fontSize: 12 }}
      >
        <Flag size={14} aria-hidden="true" /> Report question
      </button>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="question-feedback-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="modal-surface"
            style={{ width: '100%', maxWidth: 440, padding: 24 }}
          >
            <h2
              id="question-feedback-title"
              className="text-heading"
              style={{ margin: '0 0 8px', fontSize: 20 }}
            >
              Report this question
            </h2>
            {submitted ? (
              <>
                <p role="status" className="text-muted" style={{ margin: '12px 0 20px', fontSize: 14 }}>
                  Thanks — your report has been sent to the content team.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost"
                  style={{ width: '100%' }}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <p className="text-muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
                  Your report includes the certification and question ID.
                </p>
                <label
                  className="text-muted"
                  htmlFor="feedback-category"
                  style={{ display: 'block', marginBottom: 6, fontSize: 12 }}
                >
                  What’s the issue?
                </label>
                <select
                  id="feedback-category"
                  className="input-surface"
                  value={category}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (
                      value === 'incorrect' ||
                      value === 'unclear' ||
                      value === 'outdated' ||
                      value === 'other'
                    ) {
                      setCategory(value);
                    }
                  }}
                  style={{ width: '100%', marginBottom: 14 }}
                >
                  <option value="incorrect">Incorrect answer or explanation</option>
                  <option value="unclear">Unclear wording</option>
                  <option value="outdated">Outdated information</option>
                  <option value="other">Other issue</option>
                </select>
                <label
                  className="text-muted"
                  htmlFor="feedback-details"
                  style={{ display: 'block', marginBottom: 6, fontSize: 12 }}
                >
                  Details (optional)
                </label>
                <textarea
                  id="feedback-details"
                  className="input-surface"
                  value={details}
                  maxLength={2000}
                  onChange={(event) => setDetails(event.target.value)}
                  rows={4}
                  style={{ width: '100%', resize: 'vertical', marginBottom: 8 }}
                />
                {error && (
                  <p role="alert" style={{ color: 'var(--error)', fontSize: 13 }}>
                    {error}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Sending…' : 'Send report'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}
