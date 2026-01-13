import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchOdds, OddsApiOddsResponse } from '../lib/odds-api.js';
import { transformOddsData } from '../lib/transform.js';
import { getCacheKey, getCachedData, setCachedData, isCacheValid } from '../lib/cache.js';

const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const formatMatchTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getStyles = (theme: 'dark' | 'light'): string => {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#e0e0e0' : '#333333';
  const borderColor = isDark ? '#333333' : '#e0e0e0';
  const primaryColor = isDark ? '#4a9eff' : '#2563eb';
  const hoverBg = isDark ? '#2a2a2a' : '#f5f5f5';

  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        background: ${bgColor};
        color: ${textColor};
        padding: 16px;
      }

      .widget-container {
        max-width: 100%;
      }

      .matches {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .match {
        border: 1px solid ${borderColor};
        border-radius: 6px;
        padding: 12px;
        transition: background 0.2s;
      }

      .match:hover {
        background: ${hoverBg};
      }

      .match-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        flex-wrap: wrap;
        gap: 8px;
      }

      .teams {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .team {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .vs {
        color: ${isDark ? '#888' : '#666'};
        font-size: 12px;
      }

      .match-time {
        font-size: 12px;
        color: ${isDark ? '#888' : '#666'};
      }

      .odds {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }

      .odd {
        flex: 1;
        min-width: 60px;
        background: ${primaryColor};
        color: white;
        padding: 8px;
        border-radius: 4px;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
      }

      .bookmaker {
        font-size: 11px;
        color: ${isDark ? '#888' : '#666'};
        text-align: right;
      }

      .error {
        text-align: center;
        padding: 20px;
        color: ${isDark ? '#ff6b6b' : '#dc2626'};
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: ${isDark ? '#888' : '#666'};
      }

      @media (max-width: 350px) {
        .match-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .teams {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .vs {
          display: none;
        }

        .odds {
          flex-direction: column;
        }

        .odd {
          width: 100%;
        }
      }
    </style>
  `;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { 'sport-key': sportKey, theme = 'light', bookmaker } = req.query;

  if (!sportKey || typeof sportKey !== 'string') {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Widget Error</title>
          ${getStyles('light')}
        </head>
        <body>
          <div class="error">Sport key is required</div>
        </body>
      </html>
    `);
    return;
  }

  const themeValue = theme === 'dark' ? 'dark' : 'light';
  const cacheKey = getCacheKey(sportKey, 'us', 'h2h');
  const cacheValid = await isCacheValid(cacheKey);

  try {
    let rawData: OddsApiOddsResponse[];
    let transformedData;

    // Check cache first - we cache raw API data
    if (cacheValid) {
      const cachedRawData = await getCachedData<OddsApiOddsResponse[]>(cacheKey);
      if (cachedRawData) {
        rawData = cachedRawData;
        transformedData = transformOddsData(rawData, bookmaker as string | undefined);
      }
    }

    // If no cache, fetch from API
    if (!transformedData) {
      try {
        rawData = await fetchOdds(sportKey, 'us', 'h2h');
        await setCachedData(cacheKey, rawData);
        transformedData = transformOddsData(rawData, bookmaker as string | undefined);
      } catch (apiError) {
        console.error('Error fetching from Odds API:', apiError);
        const staleRawData = await getCachedData<OddsApiOddsResponse[]>(cacheKey);
        if (staleRawData) {
          transformedData = transformOddsData(staleRawData, bookmaker as string | undefined);
        } else {
          throw apiError;
        }
      }
    }

    // Render HTML
    if (!transformedData || transformedData.length === 0) {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Soccer Odds Widget</title>
            ${getStyles(themeValue)}
          </head>
          <body>
            <div class="widget-container">
              <div class="error">No matches available</div>
            </div>
          </body>
        </html>
      `);
      return;
    }

    const matchesHtml = transformedData.map((match) => {
      return `
        <div class="match">
          <div class="match-header">
            <div class="teams">
              <span class="team home">${escapeHtml(match.teams.home)}</span>
              <span class="vs">vs</span>
              <span class="team away">${escapeHtml(match.teams.away)}</span>
            </div>
            <div class="match-time">${formatMatchTime(match.start_at)}</div>
          </div>
          <div class="odds">
            ${match.odds.home !== null ? `<div class="odd home">${match.odds.home.toFixed(2)}</div>` : ''}
            ${match.odds.draw !== null ? `<div class="odd draw">${match.odds.draw.toFixed(2)}</div>` : ''}
            ${match.odds.away !== null ? `<div class="odd away">${match.odds.away.toFixed(2)}</div>` : ''}
          </div>
          <div class="bookmaker">${escapeHtml(match.bookmaker)}</div>
        </div>
      `;
    }).join('');

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Soccer Odds Widget</title>
          ${getStyles(themeValue)}
        </head>
        <body>
          <div class="widget-container">
            <div class="matches">
              ${matchesHtml}
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in widget-render:', error);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Soccer Odds Widget</title>
          ${getStyles(themeValue)}
        </head>
        <body>
          <div class="widget-container">
            <div class="error">Live odds currently unavailable.</div>
          </div>
        </body>
      </html>
    `);
  }
}
