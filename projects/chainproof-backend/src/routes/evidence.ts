import { Router } from 'express';
import { listEvidence, getEvidenceHistory, getVerificationLogs, registerEvidence, verifyEvidence, getEvidence, transferOwnership, getCertificate } from '../controllers/evidenceController';

const router = Router();

router.get('/', listEvidence);
router.post('/register', registerEvidence);
router.get('/logs', getVerificationLogs);
router.get('/:id/history', getEvidenceHistory);
router.get('/:id/certificate', getCertificate);
router.get('/:id', getEvidence);
router.post('/verify', verifyEvidence);
router.post('/:id/transfer', transferOwnership);

export default router;
