import { EvidenceService } from './evidenceService';
import { VerificationEngine, VerificationResult, HashesMatch } from '../verification/engine';
import { computeHashes } from '../utils/hash';
import { initDB } from '../config/db';

export class VerificationService {
  static async verify(evidenceId: string, fileBuffer?: Buffer, metadata?: any): Promise<VerificationResult> {
    const evidence = await EvidenceService.getEvidence(evidenceId);
    if (!evidence) throw new Error('Evidence not found');

    const storedHashes = { sha256: evidence.file_hash, blake2b: evidence.secondary_hash };
    let integrity: HashesMatch;

    if (fileBuffer) {
      integrity = VerificationEngine.verifyHashes(fileBuffer, storedHashes);
    } else {
      integrity = { sha256: true, blake2b: true };
    }

    const metadataMatch = metadata ? VerificationEngine.verifyMetadata(metadata, JSON.parse(evidence.metadata)) : true;
    const chainValid = true;
    const signaturesValid = true;

    const trustScore = VerificationEngine.calculateTrustScore(integrity, metadataMatch, chainValid, signaturesValid);

    const result: VerificationResult = {
      integrity: integrity.sha256 && integrity.blake2b,
      metadata: metadataMatch,
      chain: chainValid,
      trust_score: trustScore,
    };

    const db = await initDB();
    await db.run(
      'INSERT INTO verifications (evidence_id, trust_score, result, timestamp) VALUES (?, ?, ?, ?)',
      [evidenceId, trustScore, JSON.stringify(result), Date.now() / 1000]
    );

    return result;
  }
}

