import express from 'express';
import cors from 'cors';
import multer from 'multer';
import evidenceRoutes from './routes/evidence';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

dotenv.config();

const app = express();
const port = 3001;

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Error handling middleware
app.use((err: Error, req: any, res: any, next: any) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(morgan('combined'));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
app.get('/', (_, res) => res.json({ status: 'ChainProof Backend OK', api: '/api/evidence/register (POST txnId+file)' }));

app.use('/api/evidence', evidenceRoutes);

app.listen(port, () => {
  console.log(`🚀 ChainProof Backend running on http://localhost:${port}`);
});

