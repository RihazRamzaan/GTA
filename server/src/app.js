import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import publicRoutes from './routes/public.routes.js';
import authRoutes from './routes/auth.routes.js';
import teamRoutes from './routes/team.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler, httpError } from './middleware/error.js';
import { originCheck } from './middleware/originCheck.js';

const app = express();
// Hosts put the API behind one proxy; secure cookies and rate limits need the real protocol and IP.
if (env.nodeEnv === 'production') app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(originCheck);
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: env.sessionSecret, resave: false, saveUninitialized: false, store: MongoStore.create({ mongoUrl: env.mongoUri }), cookie: { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 } }));

app.get('/api/health', (_req, res) => {
  if (mongoose.connection.readyState !== 1) throw httpError(503, 'DATABASE_UNAVAILABLE', 'The database is unavailable.');
  res.json({ success: true, data: { status: 'ok' } });
});
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
