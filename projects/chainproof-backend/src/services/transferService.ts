import { EvidenceService } from './evidenceService';
import { BlockchainService } from '../blockchain/algorandService';
import { initDB } from '../config/db';

export class TransferService {
  static async transferOwnership(evidenceId: string, newOwner: string, currentOwner: string) {
    console.log(`[TransferService] transferOwnership: id=${evidenceId}, newOwner=${newOwner}, currentOwner=${currentOwner}`);
    const evidence = await EvidenceService.getEvidence(evidenceId);
    if (!evidence) throw new Error('Evidence not found');
    console.log(`[TransferService] Evidence found: owner=${evidence.owner}, hash=${evidence.file_hash}`);

    const db = await initDB();
    await db.run(
      'INSERT INTO custody (evidence_id, from_owner, to_owner, timestamp) VALUES (?, ?, ?, ?)',
      [evidenceId, evidence.owner, newOwner, Date.now() / 1000]
    );

    await db.run('UPDATE evidence SET owner = ? WHERE id = ?', [newOwner, evidenceId]);
    console.log(`[TransferService] DB updated: owner=${newOwner} for ${evidenceId}`);
  }
}
