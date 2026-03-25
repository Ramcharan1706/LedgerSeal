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
    const sha256Match = computed.sha256 === storedHashes.sha256;
    const blake2bMatch = storedHashes.blake2b ? computed.blake2b === storedHashes.blake2b : true;

    console.log('[VerificationEngine] DEBUG HASHES:');
    console.log('  stored sha256:', storedHashes.sha256.slice(0,16) + '...');
    console.log('  computed sha256:', computed.sha256.slice(0,16) + '...');
    console.log('  sha256 match:', sha256Match);
    if (storedHashes.blake2b) {
      console.log('  stored blake2b:', storedHashes.blake2b.slice(0,16) + '...');
      console.log('  computed blake2b:', computed.blake2b.slice(0,16) + '...');
      console.log('  blake2b match:', blake2bMatch);
    }

    return {
      sha256: sha256Match,
      blake2b: blake2bMatch,
    };
  }

  static verifyMetadata(inputMetadata: any, storedMetadata: any): boolean {
    return JSON.stringify(inputMetadata) === JSON.stringify(storedMetadata);
  }

  static calculateTrustScore(integrity: HashesMatch, chain: boolean, signatures = true): number {
    let score = 0;
    if (integrity.sha256) score += 90; // SHA256 primary
    if (integrity.blake2b) score += 5; // Blake2b bonus
    if (chain) score += 5; // Chain
    return Math.min(100, Math.round(score)); // Cap at 100
  }
}
