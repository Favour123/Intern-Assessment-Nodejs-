import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import integrationsRouter from '../server/routes/integrations.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get('/', (_req, res) => {
  res.json({message : "Welcome to Internship GetResponse and Mailchimp API"});
});

app.use('/api/integrations', integrationsRouter);

app.use(errorHandler);

export default app;

