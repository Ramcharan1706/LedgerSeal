import { initDB } from '../config/db';
import { computeHashes, hashMetadata } from '../utils/hash';
import { BlockchainService } from '../blockchain/algorandService';
import { VerificationEngine } from '../verification/engine';

export class EvidenceService {
  static dbPromise = initDB();

  static async registerEvidence(fileBuffer: Buffer, metadata: any, owner: string) {
    const db = await this.dbPromise;
    const hashes = computeHashes(fileBuffer);
    const metadataHash = hashMetadata(metadata);
    const evidenceId = 'ev_' + hashes.sha256.slice(0,8);

    console.log(`[EvidenceService] Registering evidence: id=${evidenceId}, owner=${owner}`);

    try {
      // Check if evidence with this file hash already exists
      const existingEvidence = await db.get(
        'SELECT id, owner, txn_id FROM evidence WHERE file_hash = ?',
        [hashes.sha256]
      );

      if (existingEvidence) {
        console.log(`[EvidenceService] Evidence with this file hash already exists: ${existingEvidence.id}`);
        return {
          evidenceId: existingEvidence.id,
          hashes,
          txnId: existingEvidence.txn_id,
          isExisting: true,
          message: `File already registered with ID: ${existingEvidence.id}`
        };
      }

      const blockchainResult = await BlockchainService.registerEvidence(hashes, owner);
      console.log(`[EvidenceService] Blockchain registration successful: ${blockchainResult.txnId}`);

      await db.run(
        `INSERT INTO evidence (id, file_hash, secondary_hash, metadata_hash, metadata, owner, txn_id, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [evidenceId, hashes.sha256, hashes.blake2b, metadataHash, JSON.stringify(metadata), owner, blockchainResult.txnId, Date.now() / 1000]
      );

      console.log(`[EvidenceService] Database insert successful`);
      return { evidenceId, hashes, txnId: blockchainResult.txnId };
    } catch (error) {
      console.error(`[EvidenceService] Error registering evidence:`, error);
      throw error;
    }
  }

  static async getEvidence(evidenceId: string) {
    const db = await this.dbPromise;
    const row = await db.get('SELECT * FROM evidence WHERE id = ?', [evidenceId]);
    return row;
  }
}
