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
    // Check if API key is set
    if (!process.env.THE_ODDS_API_KEY) {
      console.error('THE_ODDS_API_KEY is not set');
      res.status(500).json({
        error: 'Configuration error',
        message: 'THE_ODDS_API_KEY environment variable is not set',
      });
      return;
    }

    const sports = await fetchSports();
    
    // Filter for soccer leagues only
    const soccerLeagues = sports.filter((sport) =>
      sport.group.toLowerCase().includes('soccer')
    );

    res.status(200).json(soccerLeagues);
  } catch (error) {
    console.error('Error fetching sports:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    } : { message: errorMessage };

    res.status(500).json({
      error: 'Failed to fetch sports',
      message: errorMessage,
      details: errorDetails,
    });
  }
}
