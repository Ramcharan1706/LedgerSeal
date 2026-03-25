import { EvidenceService } from './evidenceService';
import { VerificationEngine, VerificationResult, HashesMatch } from '../verification/engine';
import { hashMetadata } from '../utils/hash';
import { initDB } from '../config/db';

export class VerificationService {
  static async verify(evidenceId: string, fileBuffer?: Buffer, metadata?: any): Promise<VerificationResult> {
    console.log(`[VerifyEvidence] Verifying evidence: id=${evidenceId}, hasFile=${!!fileBuffer}`);

    const evidence = await EvidenceService.getEvidence(evidenceId);
    if (!evidence) throw new Error('Evidence not found');

    const storedHashes = { sha256: evidence.file_hash!, blake2b: evidence.secondary_hash || '' };
    let integrity: HashesMatch;

    if (fileBuffer) {
      integrity = VerificationEngine.verifyHashes(fileBuffer, storedHashes);
    } else {
      integrity = { sha256: true, blake2b: true };
    }

    const metadataHash = hashMetadata(metadata || {});
    const metadataMatch = metadataHash === evidence.metadata_hash;
    const chainValid = true;

    const trustScore = VerificationEngine.calculateTrustScore(integrity, chainValid);

    console.log(`[VerifyEvidence] Final: integrity=${integrity.sha256}, sha256=${integrity.sha256}, blake2b=${integrity.blake2b}, metadata=${metadataMatch}, score=${trustScore}`);

    const result: VerificationResult = {
      integrity: integrity.sha256, // Prioritize SHA256 for integrity
      metadata: metadataMatch,
      chain: chainValid,
      trust_score: trustScore,
    };

    const db = await initDB();
    await db.run(
      'INSERT INTO verifications (evidence_id, trust_score, result, timestamp) VALUES (?, ?, ?, ?)',
      [evidenceId, trustScore, JSON.stringify(result), Date.now() / 1000]
    );

    console.log(`[VerifyEvidence] Verification complete: trust_score=${trustScore}`);
    return result;
  }
}

