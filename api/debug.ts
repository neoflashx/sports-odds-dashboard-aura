import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Security: Only allow in development or with a secret key
  const debugKey = req.query.key;
  if (debugKey !== process.env.DEBUG_KEY && process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const envCheck = {
    THE_ODDS_API_KEY: process.env.THE_ODDS_API_KEY 
      ? `Set (${process.env.THE_ODDS_API_KEY.substring(0, 8)}...)` 
      : 'NOT SET',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY 
      ? `Set (${process.env.FIREBASE_PRIVATE_KEY.substring(0, 30)}...)` 
      : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  };

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: envCheck,
  });
}
