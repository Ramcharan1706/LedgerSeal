import { EvidenceService } from './evidenceService';
import { initDB } from '../config/db';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateCertificate(evidenceId: string) {
  const evidence = await EvidenceService.getEvidence(evidenceId);
  if (!evidence) throw new Error('Evidence not found');

  const db = await initDB();
  const latestVerification = await db.get(
    'SELECT * FROM verifications WHERE evidence_id = ? ORDER BY timestamp DESC LIMIT 1',
    [evidenceId]
  );
  const trustScore = latestVerification?.trust_score ?? 0;
  const verificationTime = latestVerification?.timestamp ? new Date(latestVerification.timestamp * 1000).toLocaleString() : 'N/A';

  const metadata = evidence.metadata ? JSON.parse(evidence.metadata) : {};

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage([640, 520]);
  const { width, height } = page.getSize();

  page.drawText('ChainProof Evidence Certificate', {
    x: 40,
    y: height - 60,
    size: 26,
    font: timesRomanFont,
    color: rgb(0.04, 0.4, 0.6),
  });

  page.drawText('Verified Proof of Evidence on LedgerSeal', {
    x: 40,
    y: height - 90,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Evidence ID: ${evidence.id}`, {
    x: 40,
    y: height - 130,
    size: 12,
    font: timesRomanFont,
  });

  page.drawText(`File hash (SHA-256): ${evidence.file_hash}`, {
    x: 40,
    y: height - 150,
    size: 10,
    font: timesRomanFont,
  });

  page.drawText(`Secondary hash (SHA3-256): ${evidence.secondary_hash}`, {
    x: 40,
    y: height - 170,
    size: 10,
    font: timesRomanFont,
  });

  page.drawText(`Metadata hash: ${evidence.metadata_hash}`, {
    x: 40,
    y: height - 190,
    size: 10,
    font: timesRomanFont,
  });

  page.drawText(`Owner: ${evidence.owner}`, {
    x: 40,
    y: height - 210,
    size: 12,
    font: timesRomanFont,
  });

  page.drawText(`Txn ID: ${evidence.txn_id}`, {
    x: 40,
    y: height - 230,
    size: 12,
    font: timesRomanFont,
  });

  page.drawText(`Evidence registered at: ${new Date(evidence.timestamp * 1000).toLocaleString()}`, {
    x: 40,
    y: height - 250,
    size: 12,
    font: timesRomanFont,
  });

  page.drawText(`Latest trust score: ${trustScore}%`, {
    x: 40,
    y: height - 280,
    size: 12,
    font: timesRomanFont,
  });

  page.drawText(`Last verification: ${verificationTime}`, {
    x: 40,
    y: height - 300,
    size: 12,
    font: timesRomanFont,
  });

  page.drawText('Metadata snapshot:', {
    x: 40,
    y: height - 330,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.35, 0.35, 0.35),
  });

  const metadataLine = JSON.stringify(metadata, null, 2).slice(0, 380);
  page.drawText(metadataLine, {
    x: 40,
    y: height - 350,
    size: 9,
    font: timesRomanFont,
    maxWidth: width - 80,
    lineHeight: 12,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
