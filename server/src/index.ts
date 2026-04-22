import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { loadEnv } from './env.js';
import { createAuthRouter } from './routes/auth.js';
import { createInferenceRouter } from './routes/inference.js';
import { createReportsRouter } from './routes/reports.js';

const env = loadEnv();
const app = express();

const corsOptions: cors.CorsOptions =
  env.CORS_ORIGIN === '*'
    ? { origin: true, credentials: true }
    : { origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()), credentials: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: '12mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', createAuthRouter(env));
app.use('/reports', createReportsRouter(env));
app.use('/cv/infer', createInferenceRouter());

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
