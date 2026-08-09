import { CertificationManifest, QuestionBank } from '../types';

const DATA_BASE_PATH = '/data';

export class DataLoader {
  private static manifestCache: CertificationManifest | null = null;
  private static questionBankCache: Map<string, QuestionBank> = new Map();

  static async loadManifest(): Promise<CertificationManifest> {
    if (this.manifestCache) return this.manifestCache;

    const response = await fetch(`${DATA_BASE_PATH}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }

    const manifest: CertificationManifest = await response.json();
    this.manifestCache = manifest;
    return manifest;
  }

  static async loadQuestionBank(certificationId: string): Promise<QuestionBank> {
    const cached = this.questionBankCache.get(certificationId);
    if (cached) return cached;

    const response = await fetch(`${DATA_BASE_PATH}/${certificationId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load question bank for ${certificationId}: ${response.statusText}`);
    }

    const questionBank: QuestionBank = await response.json();
    this.questionBankCache.set(certificationId, questionBank);
    return questionBank;
  }

  static clearCache(): void {
    this.manifestCache = null;
    this.questionBankCache.clear();
  }
}
