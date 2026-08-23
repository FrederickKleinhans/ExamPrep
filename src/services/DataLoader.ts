import { CatalogCert, CareerTrack, Certification, CertificationManifest, QuestionBank, QuestionChunk } from '../types';

const DATA_BASE_PATH = '/data';

// ── Typed error class ──────────────────────────────────────────────────────

export type DataErrorKind = 'not-found' | 'corrupt' | 'network';

export class DataLoadError extends Error {
  kind: DataErrorKind;
  asset: string;

  constructor(kind: DataErrorKind, asset: string, message: string) {
    super(message);
    this.name = 'DataLoadError';
    this.kind = kind;
    this.asset = asset;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

// 10s default — long enough for cold start + slow connections, short enough
// that a stuck request doesn't leave the user staring at a spinner.
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

async function fetchJson<T>(url: string, asset: string, timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    window.clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new DataLoadError(
        'network',
        asset,
        `Loading ${asset} took too long. Check your connection and retry.`,
      );
    }
    throw new DataLoadError(
      'network',
      asset,
      `Could not reach the server while loading ${asset}. Check your connection and try again.`,
    );
  }

  window.clearTimeout(timeoutId);

  if (response.status === 404) {
    throw new DataLoadError(
      'not-found',
      asset,
      `Content not found: ${asset}. It may not have been compiled yet.`,
    );
  }

  if (!response.ok) {
    throw new DataLoadError(
      'network',
      asset,
      `Failed to load ${asset} (HTTP ${response.status}).`,
    );
  }

  let data: T;
  try {
    data = await response.json() as T;
  } catch {
    throw new DataLoadError(
      'corrupt',
      asset,
      `The content file for ${asset} appears corrupt or invalid. Try rebuilding the content.`,
    );
  }

  return data;
}

// ── DataLoader ─────────────────────────────────────────────────────────────

export class DataLoader {
  private static manifestCache: CertificationManifest | null = null;
  private static catalogCache: CatalogCert[] | null = null;
  private static tracksCache: CareerTrack[] | null = null;
  private static questionBankCache: globalThis.Map<string, QuestionBank> = new globalThis.Map();
  private static certificationCache: globalThis.Map<string, Certification> = new globalThis.Map();
  private static topicChunkCache: globalThis.Map<string, QuestionChunk> = new globalThis.Map();

  static async loadManifest(): Promise<CertificationManifest> {
    if (this.manifestCache) return this.manifestCache;
    const manifest = await fetchJson<CertificationManifest>(`${DATA_BASE_PATH}/manifest.json`, 'manifest');
    this.manifestCache = manifest;
    return manifest;
  }

  static async loadCatalog(): Promise<CatalogCert[]> {
    if (this.catalogCache) return this.catalogCache;
    const catalog = await fetchJson<CatalogCert[]>(`${DATA_BASE_PATH}/catalog.json`, 'catalog');
    this.catalogCache = catalog;
    return catalog;
  }

  static async loadTracks(): Promise<CareerTrack[]> {
    if (this.tracksCache) return this.tracksCache;
    const tracks = await fetchJson<CareerTrack[]>(`${DATA_BASE_PATH}/tracks.json`, 'tracks');
    this.tracksCache = tracks;
    return tracks;
  }

  static async loadQuestionBank(certificationId: string): Promise<QuestionBank> {
    const cached = this.questionBankCache.get(certificationId);
    if (cached) return cached;
    const questionBank = await fetchJson<QuestionBank>(
      `${DATA_BASE_PATH}/${certificationId}.json`,
      `question bank for ${certificationId}`,
    );
    this.questionBankCache.set(certificationId, questionBank);
    return questionBank;
  }

  static async loadCertification(certificationId: string): Promise<Certification> {
    const cached = this.certificationCache.get(certificationId);
    if (cached) return cached;
    const certification = await fetchJson<Certification>(
      `${DATA_BASE_PATH}/certifications/${certificationId}/manifest.json`,
      `certification manifest for ${certificationId}`,
    );
    this.certificationCache.set(certificationId, certification);
    return certification;
  }

  static async loadTopicChunk(certificationId: string, topicId: string): Promise<QuestionChunk> {
    const cacheKey = `${certificationId}:${topicId}`;
    const cached = this.topicChunkCache.get(cacheKey);
    if (cached) return cached;

    const certification = await this.loadCertification(certificationId);
    const chunk = certification.topicChunks?.find((c) => c.topicId === topicId);

    if (!chunk) {
      throw new DataLoadError(
        'not-found',
        `topic chunk ${certificationId}/${topicId}`,
        `No topic chunk found for "${topicId}" in ${certificationId}. The content may need to be recompiled.`,
      );
    }

    const questionChunk = await fetchJson<QuestionChunk>(
      chunk.path,
      `topic chunk ${certificationId}/${topicId}`,
    );
    this.topicChunkCache.set(cacheKey, questionChunk);
    return questionChunk;
  }

  static clearCache(): void {
    this.manifestCache = null;
    this.catalogCache = null;
    this.tracksCache = null;
    this.questionBankCache.clear();
    this.certificationCache.clear();
    this.topicChunkCache.clear();
  }
}
