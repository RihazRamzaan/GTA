import app from '../server/src/app.js';
import { connectDatabase } from '../server/src/config/db.js';

// Reuse initialization across requests in a warm function. A failed connection
// is cleared so a later request can retry after a database outage.
let databaseReady;

export default async function handler(req, res) {
  if (!databaseReady) {
    databaseReady = connectDatabase().catch((error) => {
      databaseReady = undefined;
      throw error;
    });
  }

  try {
    await databaseReady;
  } catch (error) {
    console.error('API database initialization failed:', error.message);
    return res.status(503).json({
      success: false,
      error: { code: 'DATABASE_UNAVAILABLE', message: 'The database is unavailable.' },
    });
  }

  return app(req, res);
}
