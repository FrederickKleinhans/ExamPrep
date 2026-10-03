import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataLoader } from '../../services/DataLoader';
import { ProgressService } from '../../services/ProgressService';
import { useStore } from '../useStore';
import type { Certification, CertificationManifest, Question, QuestionBank } from '../../types';

function makeQuestion(id: string): Question {
  return {
    id,
    type: 'single-choice',
    topicId: 'cloud-concepts',
    difficulty: 'easy',
    points: 1,
    questionText: id,
    options: [{ id: 'a', text: 'A', isCorrect: true }],
    explanation: { correct: '', incorrect: '', examTip: '', relatedTopics: [] },
    metadata: { examObjective: '', references: [], lastUpdated: '' },
  };
}

describe('useStore.startExam', () => {
  const originalState = useStore.getState();

  afterEach(() => {
    useStore.setState(originalState);
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('useStore study session recovery', () => {
    const originalState = useStore.getState();

    afterEach(() => {
      useStore.setState(originalState);
      sessionStorage.clear();
      vi.restoreAllMocks();
    });

    it('restores the active question, answer, and session history after initialization', async () => {
      const question = makeQuestion('q-current');
      const certification: Certification = {
        id: 'az-900',
        name: 'Microsoft Azure Fundamentals',
        provider: 'Microsoft',
        examCode: 'AZ-900',
        version: '2024-01',
        questionCount: 1,
        passingScore: 70,
        timeLimitMinutes: 60,
        topics: [{ id: 'cloud-concepts', name: 'Cloud Concepts', weight: 100 }],
      };
      const manifest: CertificationManifest = { certifications: [certification] };
      const progress = { ...originalState.progress, selectedCertification: 'az-900' };
      vi.spyOn(DataLoader, 'loadManifest').mockResolvedValue(manifest);
      vi.spyOn(DataLoader, 'loadCertification').mockResolvedValue(certification);
      vi.spyOn(DataLoader, 'loadTopicChunk').mockResolvedValue({
        certificationId: 'az-900',
        topicId: 'cloud-concepts',
        version: '2024-01',
        questions: [question],
      });
      vi.spyOn(ProgressService, 'getProgress').mockReturnValue(progress);
      sessionStorage.setItem(
        'certready_study_session',
        JSON.stringify({
          certificationId: 'az-900',
          studyFilter: 'cloud-concepts',
          studySessionLimit: 10,
          studySessionHistory: ['q-previous'],
          studySessionResults: [{ questionId: 'q-previous', isCorrect: false }],
          currentQuestionId: 'q-current',
          studyPoolQuestionIds: null,
          showExplanation: true,
          selectedAnswer: 'a',
          isAnswerCorrect: false,
          questionStartTime: Date.now(),
          isStudyExhausted: false,
        }),
      );

      await useStore.getState().initialize();

      expect(useStore.getState()).toMatchObject({
        currentStudyQuestion: question,
        studySessionHistory: ['q-previous'],
        studySessionResults: [{ questionId: 'q-previous', isCorrect: false }],
        showExplanation: true,
        selectedAnswer: 'a',
        isAnswerCorrect: false,
      });
    });
  });

  it('persists the active exam session in sessionStorage', async () => {
    const fullBank: QuestionBank = {
      certificationId: 'az-900',
      version: '2024-01',
      questions: Array.from({ length: 30 }, (_, index) => makeQuestion(`q${index + 1}`)),
    };
    const manifest: CertificationManifest = {
      certifications: [
        {
          id: 'az-900',
          name: 'Microsoft Azure Fundamentals',
          provider: 'Microsoft',
          examCode: 'AZ-900',
          version: '2024-01',
          questionCount: 30,
          passingScore: 70,
          timeLimitMinutes: 60,
          topics: [{ id: 'cloud-concepts', name: 'Cloud Concepts', weight: 100 }],
        },
      ],
    };
    vi.spyOn(DataLoader, 'loadQuestionBank').mockResolvedValue(fullBank);
    useStore.setState({
      manifest,
      questionBank: fullBank,
      progress: { ...originalState.progress, selectedCertification: 'az-900' },
      examSession: null,
    });

    await useStore.getState().startExam();

    expect(JSON.parse(sessionStorage.getItem('certready_exam_session') ?? 'null')).toMatchObject({
      certificationId: 'az-900',
      currentIndex: 0,
      isCompleted: false,
    });
    const questionId = useStore.getState().examSession!.questions[0].id;
    useStore.getState().submitExamAnswer(questionId, 'a');
    expect(JSON.parse(sessionStorage.getItem('certready_exam_session') ?? 'null').answers[questionId]).toBe(
      'a',
    );
  });

  it('samples a 30-question exam from the full question bank instead of one study chunk', async () => {
    const fullBank: QuestionBank = {
      certificationId: 'az-900',
      version: '2024-01',
      questions: Array.from({ length: 150 }, (_, index) => makeQuestion(`q${index + 1}`)),
    };
    const manifest: CertificationManifest = {
      certifications: [
        {
          id: 'az-900',
          name: 'Microsoft Azure Fundamentals',
          provider: 'Microsoft',
          examCode: 'AZ-900',
          version: '2024-01',
          questionCount: 150,
          passingScore: 70,
          timeLimitMinutes: 60,
          topics: [{ id: 'cloud-concepts', name: 'Cloud Concepts', weight: 100 }],
        },
      ],
    };
    const currentChunk = {
      certificationId: 'az-900',
      version: '2024-01',
      questions: fullBank.questions.slice(0, 30),
    };
    const loadFullBank = vi.spyOn(DataLoader, 'loadQuestionBank').mockResolvedValue(fullBank);

    useStore.setState({
      manifest,
      questionBank: currentChunk,
      progress: { ...originalState.progress, selectedCertification: 'az-900' },
      examSession: null,
    });

    await useStore.getState().startExam();

    expect(loadFullBank).toHaveBeenCalledWith('az-900');
    expect(useStore.getState().examSession?.questions).toHaveLength(30);
    expect(new Set(useStore.getState().examSession?.questions.map((question) => question.id)).size).toBe(30);
    expect(
      useStore.getState().examSession?.questions.every((question) => fullBank.questions.includes(question)),
    ).toBe(true);
  });

  it('limits custom exams to the selected topics and question count', async () => {
    const fullBank: QuestionBank = {
      certificationId: 'az-900',
      version: '2024-01',
      questions: Array.from({ length: 40 }, (_, index) => ({
        ...makeQuestion(`q${index + 1}`),
        topicId: index % 2 === 0 ? 'cloud-concepts' : 'security',
      })),
    };
    const manifest: CertificationManifest = {
      certifications: [
        {
          id: 'az-900',
          name: 'Microsoft Azure Fundamentals',
          provider: 'Microsoft',
          examCode: 'AZ-900',
          version: '2024-01',
          questionCount: 40,
          passingScore: 70,
          timeLimitMinutes: 60,
          topics: [
            { id: 'cloud-concepts', name: 'Cloud Concepts', weight: 50 },
            { id: 'security', name: 'Security', weight: 50 },
          ],
        },
      ],
    };
    vi.spyOn(DataLoader, 'loadQuestionBank').mockResolvedValue(fullBank);
    useStore.setState({
      manifest,
      questionBank: fullBank,
      progress: { ...originalState.progress, selectedCertification: 'az-900' },
      examSession: null,
    });

    await useStore.getState().startExam({ topicIds: ['security'], questionCount: 10 });

    const questions = useStore.getState().examSession?.questions ?? [];
    expect(questions).toHaveLength(10);
    expect(questions.every((question) => question.topicId === 'security')).toBe(true);
  });
});
