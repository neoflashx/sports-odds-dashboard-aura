import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchOdds, OddsApiOddsResponse } from '../lib/odds-api.js';
import { transformMatchesWithBookmakers } from '../lib/match-utils.js';
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

      .bookmakers-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .bookmaker-odds {
        border: 1px solid ${borderColor};
        border-radius: 4px;
        padding: 10px;
        background: ${isDark ? '#222' : '#f9fafb'};
      }

      .bookmaker-name {
        font-weight: 600;
        font-size: 13px;
        color: ${primaryColor};
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .odds-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }

      .odd-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px;
        background: ${bgColor};
        border-radius: 4px;
        border: 1px solid ${borderColor};
      }

      .odd-label {
        font-size: 11px;
        color: ${isDark ? '#aaa' : '#666'};
        text-align: center;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }

      .odd-value {
        font-size: 18px;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: 4px;
        min-width: 50px;
        text-align: center;
      }

      .odd-value.available {
        background: ${primaryColor};
        color: white;
      }

      .odd-value.unavailable {
        background: ${isDark ? '#333' : '#e5e7eb'};
        color: ${isDark ? '#666' : '#9ca3af'};
        font-size: 14px;
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

        .odds-row {
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .odd-item {
          flex-direction: row;
          justify-content: space-between;
          padding: 10px;
        }

        .odd-label {
          text-align: left;
          font-size: 12px;
        }

        .odd-value {
          font-size: 16px;
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

  const { 'sport-key': sportKey, theme = 'light', bookmaker, bookmakers, 'match-id': matchId } = req.query;
  
  // Support both single and multiple bookmakers
  const selectedBookmakers: string[] = [];
  if (bookmakers && typeof bookmakers === 'string') {
    selectedBookmakers.push(...bookmakers.split(',').map(b => b.trim()).filter(Boolean));
  } else if (bookmaker && typeof bookmaker === 'string') {
    selectedBookmakers.push(bookmaker);
  }

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
    let rawData: OddsApiOddsResponse[] | null = null;

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
        rawData = await fetchOdds(sportKey, 'us', 'h2h');
        await setCachedData(cacheKey, rawData);
      } catch (apiError) {
        console.error('Error fetching from Odds API:', apiError);
        const staleRawData = await getCachedData<OddsApiOddsResponse[]>(cacheKey);
        if (staleRawData) {
          rawData = staleRawData;
        } else {
          throw apiError;
        }
      }
    }

    if (!rawData) {
      throw new Error('Failed to fetch match data');
    }

    // Transform to matches with all bookmakers
    const matches = transformMatchesWithBookmakers(rawData);

    // Filter by match-id if specified
    let filteredMatches = matches;
    if (matchId && typeof matchId === 'string') {
      filteredMatches = matches.filter(m => m.id === matchId);
    }

    // Render HTML
    if (!filteredMatches || filteredMatches.length === 0) {
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

    const matchesHtml = filteredMatches.map((match) => {
      // Filter bookmakers if specific ones are selected
      let displayBookmakers = match.bookmakers;
      if (selectedBookmakers.length > 0) {
        displayBookmakers = match.bookmakers.filter(bm => 
          selectedBookmakers.some(selected => {
            const selectedLower = selected.toLowerCase().trim();
            const titleLower = bm.title.toLowerCase().trim();
            const keyLower = bm.key.toLowerCase().trim();
            
            // Exact match
            if (titleLower === selectedLower || keyLower === selectedLower) {
              return true;
            }
            
            // Partial match - check if selected name is contained in title or vice versa
            // This handles cases like "Unibet (UK)" matching "Unibet"
            if (titleLower.includes(selectedLower) || selectedLower.includes(titleLower)) {
              return true;
            }
            
            return false;
          })
        );
      }

      if (displayBookmakers.length === 0) {
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
            <div class="error">No bookmakers available for selected filters</div>
          </div>
        `;
      }

      // Render each bookmaker's odds
      const bookmakersHtml = displayBookmakers.map(bookmaker => {
        return `
          <div class="bookmaker-odds">
            <div class="bookmaker-name">${escapeHtml(bookmaker.title)}</div>
            <div class="odds-row">
              <div class="odd-item">
                <span class="odd-label">${escapeHtml(match.teams.home)}</span>
                <span class="odd-value ${bookmaker.odds.home !== null ? 'available' : 'unavailable'}">
                  ${bookmaker.odds.home !== null ? bookmaker.odds.home.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div class="odd-item">
                <span class="odd-label">Draw</span>
                <span class="odd-value ${bookmaker.odds.draw !== null ? 'available' : 'unavailable'}">
                  ${bookmaker.odds.draw !== null ? bookmaker.odds.draw.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div class="odd-item">
                <span class="odd-label">${escapeHtml(match.teams.away)}</span>
                <span class="odd-value ${bookmaker.odds.away !== null ? 'available' : 'unavailable'}">
                  ${bookmaker.odds.away !== null ? bookmaker.odds.away.toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        `;
      }).join('');

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
          <div class="bookmakers-list">
            ${bookmakersHtml}
          </div>
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
