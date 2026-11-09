import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  for (const name of ['MONGODB_URI', 'SESSION_SECRET', 'CLIENT_ORIGIN']) {
    if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buildathon',
  sessionSecret: process.env.SESSION_SECRET || 'local-development-only-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  // Registration is free, so there is no fee setting. Team size is a placeholder until the supervisor confirms it.
  teamMinSize: Number(process.env.TEAM_MIN_SIZE || 2),
  teamMaxSize: Number(process.env.TEAM_MAX_SIZE || 4),
};
