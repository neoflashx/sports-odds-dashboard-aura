import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchOdds, OddsApiOddsResponse } from '../lib/odds-api.js';
import { transformMatchesWithBookmakers } from '../lib/match-utils.js';
import { getCacheKey, getCachedData, setCachedData, isCacheValid } from '../lib/cache.js';
import { setCorsHeaders } from '../lib/cors.js';

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

  const { sport, region = 'us', market = 'h2h' } = req.query;

  if (!sport || typeof sport !== 'string') {
    res.status(400).json({ error: 'sport parameter is required' });
    return;
  }

  const cacheKey = getCacheKey(sport, region as string, market as string);
  const cacheValid = await isCacheValid(cacheKey);

  try {
    let rawData: OddsApiOddsResponse[];

    // Check cache first - we cache raw API data
    if (cacheValid) {
      const cachedRawData = await getCachedData<OddsApiOddsResponse[]>(cacheKey);
      if (cachedRawData) {
        rawData = cachedRawData;
      }
    }

    // If no cache, fetch from API
    if (!rawData) {
      try {
        rawData = await fetchOdds(sport, region as string, market as string);
        await setCachedData(cacheKey, rawData);
      } catch (apiError) {
        console.error('Error fetching from Odds API:', apiError);
        const staleRawData = await getCachedData<OddsApiOddsResponse[]>(cacheKey);
        if (staleRawData) {
          console.log('Serving stale cache as fallback');
          rawData = staleRawData;
        } else {
          throw apiError;
        }
      }
    }

    // Transform to include all bookmakers per match
    const matches = transformMatchesWithBookmakers(rawData);

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error in matches endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch matches',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
