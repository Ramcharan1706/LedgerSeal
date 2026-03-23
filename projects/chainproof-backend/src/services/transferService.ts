import { EvidenceService } from './evidenceService';
import { BlockchainService } from '../blockchain/algorandService';
import { initDB } from '../config/db';

export class TransferService {
  static async transferOwnership(evidenceId: string, newOwner: string) {
    const evidence = await EvidenceService.getEvidence(evidenceId);
    if (!evidence) throw new Error('Evidence not found');

    // Mock authorization - in prod use wallet sig
    const txnId = await BlockchainService.transferOwnership(evidence.file_hash, newOwner);

    const db = await initDB();
    await db.run(
      'INSERT INTO custody (evidence_id, from_owner, to_owner, txn_id, timestamp) VALUES (?, ?, ?, ?, ?)',
      [evidenceId, evidence.owner, newOwner, txnId, Date.now() / 1000]
    );

    await db.run('UPDATE evidence SET owner = ? WHERE id = ?', [newOwner, evidenceId]);

    return { txnId, newOwner };
  }
}
