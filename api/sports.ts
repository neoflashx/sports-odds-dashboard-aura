import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchSports } from '../lib/odds-api';
import { setCorsHeaders } from '../lib/cors';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const sports = await fetchSports();
    
    // Filter for soccer leagues only
    const soccerLeagues = sports.filter((sport) =>
      sport.group.toLowerCase().includes('soccer')
    );

    res.status(200).json(soccerLeagues);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({
      error: 'Failed to fetch sports',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
