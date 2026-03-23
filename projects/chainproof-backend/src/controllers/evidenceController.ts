import { Request, Response } from 'express';
import { EvidenceService } from '../services/evidenceService';
import { VerificationService } from '../services/verificationService';
import { TransferService } from '../services/transferService';
import { initDB } from '../config/db';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});

export const registerEvidence = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const fileBuffer = (req.file as any)?.buffer;
      if (!fileBuffer) {
        console.error('No file provided in request');
        return res.status(400).json({ error: 'No file provided' });
      }

      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      const owner = req.body.owner || 'unknown_owner';

      console.log(`Registering evidence: owner=${owner}, filename=${(req.file as any)?.originalname}, size=${fileBuffer.length}`);

      const result = await EvidenceService.registerEvidence(fileBuffer, metadata, owner);
      console.log(`Evidence registered successfully: ${result.evidenceId}`);
      res.json(result);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('Error in registerEvidence:', errorMsg, error);
      res.status(400).json({ error: errorMsg || 'Failed to register evidence' });
    }
  }

];

export const listEvidence = async (req: Request, res: Response) => {
  const db = await initDB();
  const rows = await db.all('SELECT * FROM evidence ORDER BY timestamp DESC');
  res.json(rows);
};

export const getEvidenceHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = await initDB();
  const custody = await db.all('SELECT * FROM custody WHERE evidence_id = ? ORDER BY timestamp', [id]);
  res.json(custody);
};

export const getVerificationLogs = async (req: Request, res: Response) => {
  const db = await initDB();
  const logs = await db.all('SELECT * FROM verifications ORDER BY timestamp DESC');
  res.json(logs);
};

import { generateCertificate } from '../services/certificateService';

export const getCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const pdfBytes = await generateCertificate(id);
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `attachment; filename="certificate-${id}.pdf"`);
  res.send(Buffer.from(pdfBytes));
};

export const verifyEvidence = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const { id, metadata } = req.body;
      const fileBuffer = (req.file as any)?.buffer;

      if (!id) {
        return res.status(400).json({ error: 'Evidence ID is required' });
      }

      console.log(`[VerifyEvidence] Verifying evidence: id=${id}, hasFile=${!!fileBuffer}`);

      const result = await VerificationService.verify(
        id,
        fileBuffer,
        metadata ? JSON.parse(metadata) : undefined
      );

      console.log(`[VerifyEvidence] Verification complete: trust_score=${result.trust_score}`);
      res.json(result);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('[VerifyEvidence] Error:', errorMsg);
      res.status(400).json({ error: errorMsg });
    }
  }
];

export const getEvidence = async (req: Request, res: Response) => {
  const { id } = req.params;
  const evidence = await EvidenceService.getEvidence(id);
  res.json(evidence || null);
};

export const transferOwnership = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newOwner } = req.body;
  const result = await TransferService.transferOwnership(id, newOwner);
  res.json(result);
};

