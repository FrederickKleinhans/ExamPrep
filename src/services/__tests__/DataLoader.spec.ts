import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataLoader } from '../DataLoader';

describe('DataLoader topic chunks', () => {
  beforeEach(() => {
    DataLoader.clearCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads a topic chunk from the generated certification manifest and caches it', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/certifications/az-900/manifest.json')) {
        return new Response(JSON.stringify({
          id: 'az-900',
          topicChunks: [{ topicId: 'cloud', path: '/data/certifications/az-900/topics/cloud.json', questionCount: 1 }],
        }), { status: 200 });
      }
      if (url.endsWith('/topics/cloud.json')) {
        return new Response(JSON.stringify({ certificationId: 'az-900', topicId: 'cloud', version: '1', questions: [] }), { status: 200 });
      }
      return new Response(null, { status: 404, statusText: 'Not Found' });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(DataLoader.loadTopicChunk('az-900', 'cloud')).resolves.toMatchObject({ topicId: 'cloud' });
    await expect(DataLoader.loadTopicChunk('az-900', 'cloud')).resolves.toMatchObject({ topicId: 'cloud' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports a missing topic chunk clearly', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ id: 'az-900', topicChunks: [] }), { status: 200 })));

    await expect(DataLoader.loadTopicChunk('az-900', 'missing')).rejects.toThrow('No topic chunk found');
  });
});
