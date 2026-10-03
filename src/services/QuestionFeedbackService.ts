import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type QuestionFeedbackCategory = 'incorrect' | 'unclear' | 'outdated' | 'other';

export interface QuestionFeedbackInput {
  certificationId: string;
  questionId: string;
  category: QuestionFeedbackCategory;
  details: string;
  userId: string | null;
}

export async function submitQuestionFeedback(input: QuestionFeedbackInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Question reporting is unavailable until Supabase is configured.');
  }

  const details = input.details.trim();
  if (details.length > 2000) {
    throw new Error('Please keep feedback under 2,000 characters.');
  }

  const { error } = await supabase.from('question_feedback').insert({
    certification_id: input.certificationId,
    question_id: input.questionId,
    category: input.category,
    details: details || null,
    user_id: input.userId,
  });

  if (error) {
    console.error('[QuestionFeedbackService] Report submission failed:', error.message);
    throw new Error('Could not submit this report. Please try again later.');
  }
}
