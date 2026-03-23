import { computeHashes } from '../utils/hash';

export interface VerificationResult {
  integrity: boolean;
  metadata: boolean;
  chain: boolean;
  trust_score: number;
}

export interface HashesMatch {
  sha256: boolean;
  blake2b: boolean;
}

export class VerificationEngine {
  static verifyHashes(inputBuffer: Buffer, storedHashes: { sha256: string; blake2b: string }): HashesMatch {
    const computed = computeHashes(inputBuffer);
    return {
      sha256: computed.sha256 === storedHashes.sha256,
      blake2b: computed.blake2b === storedHashes.blake2b,
    };
  }

  static verifyMetadata(inputMetadata: any, storedMetadata: any): boolean {
    return JSON.stringify(inputMetadata) === JSON.stringify(storedMetadata);
  }

  static calculateTrustScore(integrity: HashesMatch, metadata: boolean, chain: boolean, signatures = true): number {
    let score = 0;
    if (integrity.sha256 && integrity.blake2b) score += 40;
    else if (integrity.sha256) score += 20;
    if (metadata) score += 25;
    if (chain) score += 25;
    if (signatures) score += 10;
    return Math.round(score);
  }
}
