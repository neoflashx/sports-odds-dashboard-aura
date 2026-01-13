import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchOdds, OddsApiOddsResponse } from '../lib/odds-api.js';
import { transformOddsData, TransformedOdds } from '../lib/transform.js';
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

  const { sport, region = 'us', market = 'h2h', bookmaker } = req.query;

  if (!sport || typeof sport !== 'string') {
    res.status(400).json({ error: 'sport parameter is required' });
    return;
  }

  const cacheKey = getCacheKey(sport, region as string, market as string);
  const cacheValid = await isCacheValid(cacheKey);

  try {
    let rawData: OddsApiOddsResponse[];
    let transformedData: TransformedOdds[];

    // Check cache first - we cache raw API data, not transformed
    if (cacheValid) {
      const cachedRawData = await getCachedData<OddsApiOddsResponse[]>(cacheKey);
      if (cachedRawData) {
        rawData = cachedRawData;
        // Transform on-demand based on bookmaker preference
        transformedData = transformOddsData(rawData, bookmaker as string | undefined);
        res.status(200).json(transformedData);
        return;
      }
    }

    // Cache miss or expired - fetch from API
    try {
      rawData = await fetchOdds(sport, region as string, market as string);
      
      // Cache the raw API data (not transformed, so we can transform with different bookmakers)
      await setCachedData(cacheKey, rawData);
      
      // Transform based on bookmaker preference
      transformedData = transformOddsData(rawData, bookmaker as string | undefined);
      
      res.status(200).json(transformedData);
    } catch (apiError) {
      console.error('Error fetching from Odds API:', apiError);
      
      // Fallback: try to serve stale cache if available
      const staleRawData = await getCachedData<OddsApiOddsResponse[]>(cacheKey);
      if (staleRawData) {
        console.log('Serving stale cache as fallback');
        transformedData = transformOddsData(staleRawData, bookmaker as string | undefined);
        res.status(200).json(transformedData);
        return;
      }
      
      // No cache available, return error
      throw apiError;
    }
  } catch (error) {
    console.error('Error in odds endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch odds',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
