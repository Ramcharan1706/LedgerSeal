import { initDB } from '../config/db';
import { computeHashes, hashMetadata } from '../utils/hash';
import { BlockchainService } from '../blockchain/algorandService';
import { VerificationEngine } from '../verification/engine';

export class EvidenceService {
  static dbPromise = initDB();

  /**
   * Register evidence file with hashes and metadata to local DB
   */
  static async registerEvidence(txnId: string, fileBuffer: Buffer, metadata: any, owner: string) {
    const db = await this.dbPromise;
    const hashes = computeHashes(fileBuffer);
    const metadataHash = hashMetadata(metadata);
    const evidenceId = `ev_${hashes.sha256.slice(0, 8)}`;

    console.log(`[EvidenceService] Registering evidence: id=${evidenceId}, txnId=${txnId}, owner=${owner}, sha256=${hashes.sha256}`);

    try {
      // Check for duplicates
      const existingEvidence = await db.get(
        'SELECT id, owner, txn_id FROM evidence WHERE file_hash = ?',
        [hashes.sha256]
      );

      if (existingEvidence) {
        console.log(`Already exists: ${existingEvidence.id}`);
        return {
          evidenceId: existingEvidence.id,
          hash: hashes.sha256,
          txnId: existingEvidence.txn_id,
          isExisting: true,
          message: `Already registered: ${existingEvidence.id}`
        };
      }

      await db.run(
        `INSERT INTO evidence (id, file_hash, secondary_hash, metadata_hash, metadata, owner, txn_id, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          evidenceId,
          hashes.sha256,
          hashes.blake2b,
          metadataHash,
          JSON.stringify(metadata),
          owner,
          txnId,
          Date.now() / 1000
        ]
      );

      console.log(`✅ Evidence REGISTERED: ${evidenceId}`);
      return { evidenceId, hash: hashes.sha256, txnId };
    } catch (error) {
      console.error(`[EvidenceService] Registration failed:`, error);
      throw error;
    }
  }

  /**
   * Retrieve evidence by ID
   */
  static async getEvidence(evidenceId: string) {
    const db = await this.dbPromise;
    const row = await db.get('SELECT * FROM evidence WHERE id = ?', [evidenceId]);
    return row;
  }
}

