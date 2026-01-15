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

const getStyles = (theme: 'dark' | 'light'): string => {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#e0e0e0' : '#333333';
  const borderColor = isDark ? '#333333' : '#e0e0e0';
  const primaryColor = isDark ? '#4a9eff' : '#2563eb';

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
      }

      .match {
        background: ${bgColor};
        border-bottom: 1px solid ${borderColor};
      }

      .match:last-child {
        border-bottom: none;
      }

      .match-header {
        background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
        padding: 12px 16px;
        border-bottom: 2px solid ${borderColor};
      }

      .league-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .league-name {
        font-weight: 600;
        font-size: 15px;
        color: ${textColor};
      }

      .match-date {
        font-size: 13px;
        color: ${isDark ? '#aaa' : '#666'};
      }

      .match-content {
        display: grid;
        grid-template-columns: 200px 180px 1fr;
        gap: 0;
        padding: 16px;
      }

      .match-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-right: 16px;
        border-right: 1px solid ${borderColor};
      }

      .team-info {
        display: flex;
        align-items: center;
        min-height: 40px;
      }

      .team-name {
        font-weight: 500;
        font-size: 14px;
        color: ${textColor};
      }

      .best-odds {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 0 16px;
        border-right: 1px solid ${borderColor};
      }

      .best-odd-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 40px;
      }

      .best-odd-value {
        font-size: 20px;
        font-weight: 700;
        color: ${primaryColor};
        margin-bottom: 4px;
      }

      .best-odd-bookmaker {
        font-size: 11px;
        color: ${isDark ? '#aaa' : '#666'};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .odds-table-container {
        overflow-x: auto;
        padding-left: 16px;
      }

      .odds-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 400px;
      }

      .odds-table thead {
        background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
      }

      .outcome-header {
        padding: 10px 12px;
        text-align: left;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${isDark ? '#aaa' : '#666'};
        border-bottom: 2px solid ${borderColor};
      }

      .bookmaker-header {
        padding: 10px 12px;
        text-align: center;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${textColor};
        border-bottom: 2px solid ${borderColor};
        white-space: nowrap;
        min-width: 100px;
      }

      .odds-row {
        border-bottom: 1px solid ${borderColor};
      }

      .odds-row:last-child {
        border-bottom: none;
      }

      .outcome-label {
        padding: 12px;
        font-weight: 500;
        font-size: 14px;
        color: ${textColor};
        text-align: left;
        vertical-align: middle;
      }

      .odds-cell {
        padding: 12px;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
        vertical-align: middle;
        border-left: 1px solid ${borderColor};
      }

      .odds-cell.available {
        color: ${textColor};
      }

      .odds-cell.unavailable {
        color: ${isDark ? '#555' : '#9ca3af'};
      }

      .odds-cell.best-odd {
        background: #3b82f6;
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
      }

      .no-bookmakers {
        text-align: center;
        padding: 40px 20px;
        color: ${isDark ? '#888' : '#666'};
        font-style: italic;
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

      @media (max-width: 768px) {
        .match-content {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .match-info,
        .best-odds {
          border-right: none;
          border-bottom: 1px solid ${borderColor};
          padding-bottom: 16px;
          padding-right: 0;
        }

        .match-info {
          flex-direction: row;
          gap: 16px;
          flex-wrap: wrap;
        }

        .best-odds {
          flex-direction: row;
          gap: 16px;
          padding-left: 0;
        }

        .odds-table-container {
          padding-left: 0;
        }

        .odds-table {
          font-size: 12px;
        }

        .bookmaker-header,
        .odds-cell {
          padding: 8px 6px;
          min-width: 80px;
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

  const { 'sport-key': sportKey, theme = 'light', bookmaker, bookmakers, 'match-id': matchId, region = 'us' } = req.query;
  
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
  const regionValue = typeof region === 'string' ? region : 'us';
  const cacheKey = getCacheKey(sportKey, regionValue, 'h2h');
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
        rawData = await fetchOdds(sportKey, regionValue, 'h2h');
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
      const startTime = new Date(match.start_at);
      const dateStr = startTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const timeStr = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      // Filter bookmakers if specific ones are selected
      let displayBookmakers = match.bookmakers;
      if (selectedBookmakers.length > 0) {
        const normalize = (str: string) => {
          return str
            .replace(/\s*\([^)]*\)/g, '')
            .replace(/[^a-z0-9]/g, '')
            .toLowerCase();
        };
        
        displayBookmakers = match.bookmakers.filter(bm => 
          selectedBookmakers.some(selected => {
            const selectedLower = selected.toLowerCase().trim();
            const titleLower = bm.title.toLowerCase().trim();
            const keyLower = bm.key.toLowerCase().trim();
            
            const selectedNormalized = normalize(selectedLower);
            const titleNormalized = normalize(titleLower);
            const keyNormalized = normalize(keyLower);
            
            return titleLower === selectedLower || keyLower === selectedLower ||
                   titleNormalized === selectedNormalized || keyNormalized === selectedNormalized ||
                   titleLower.includes(selectedLower) || selectedLower.includes(titleLower) ||
                   titleNormalized.includes(selectedNormalized) || selectedNormalized.includes(titleNormalized);
          })
        );
      }

      if (displayBookmakers.length === 0) {
        return `
          <div class="match">
            <div class="match-header">
              <div class="league-info">
                <span class="league-name">${escapeHtml(sportKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</span>
                <span class="match-date">${dateStr}</span>
              </div>
            </div>
            <div class="no-bookmakers">No bookmakers available for selected filters</div>
          </div>
        `;
      }

      // Calculate best odds for each outcome
      const bestHome = displayBookmakers
        .map(bm => ({ value: bm.odds.home, bookmaker: bm.title }))
        .filter(o => o.value !== null)
        .sort((a, b) => (b.value as number) - (a.value as number))[0];
      
      const bestDraw = displayBookmakers
        .map(bm => ({ value: bm.odds.draw, bookmaker: bm.title }))
        .filter(o => o.value !== null)
        .sort((a, b) => (b.value as number) - (a.value as number))[0];
      
      const bestAway = displayBookmakers
        .map(bm => ({ value: bm.odds.away, bookmaker: bm.title }))
        .filter(o => o.value !== null)
        .sort((a, b) => (b.value as number) - (a.value as number))[0];

      // Build table header with bookmaker names
      const bookmakerHeaders = displayBookmakers.map(bm => 
        `<th class="bookmaker-header">${escapeHtml(bm.title)}</th>`
      ).join('');

      // Build rows for each outcome
      const buildOddsRow = (label: string, odds: (number | null)[], bestValue: number | null) => {
        const cells = odds.map((odd) => {
          const isBest = odd !== null && bestValue !== null && odd === bestValue;
          const cellClass = odd !== null ? 'available' : 'unavailable';
          const bestClass = isBest ? 'best-odd' : '';
          return `
            <td class="odds-cell ${cellClass} ${bestClass}">
              ${odd !== null ? odd.toFixed(2) : 'N/A'}
            </td>
          `;
        }).join('');
        
        return `
          <tr class="odds-row">
            <td class="outcome-label">${escapeHtml(label)}</td>
            ${cells}
          </tr>
        `;
      };

      const homeRow = buildOddsRow(
        match.teams.home,
        displayBookmakers.map(bm => bm.odds.home),
        bestHome?.value as number | null
      );
      
      const drawRow = buildOddsRow(
        'Draw',
        displayBookmakers.map(bm => bm.odds.draw),
        bestDraw?.value as number | null
      );
      
      const awayRow = buildOddsRow(
        match.teams.away,
        displayBookmakers.map(bm => bm.odds.away),
        bestAway?.value as number | null
      );

      return `
        <div class="match">
          <div class="match-header">
            <div class="league-info">
              <span class="league-name">${escapeHtml(sportKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</span>
              <span class="match-date">${dateStr} ${timeStr}</span>
            </div>
          </div>
          <div class="match-content">
            <div class="match-info">
              <div class="team-info">
                <div class="team-name">${escapeHtml(match.teams.home)}</div>
              </div>
              <div class="team-info">
                <div class="team-name">${escapeHtml(match.teams.away)}</div>
              </div>
              <div class="team-info">
                <div class="team-name">Draw</div>
              </div>
            </div>
            <div class="best-odds">
              <div class="best-odd-item">
                <div class="best-odd-value">${bestHome?.value ? bestHome.value.toFixed(2) : 'N/A'}</div>
                <div class="best-odd-bookmaker">${bestHome?.bookmaker || 'N/A'}</div>
              </div>
              <div class="best-odd-item">
                <div class="best-odd-value">${bestDraw?.value ? bestDraw.value.toFixed(2) : 'N/A'}</div>
                <div class="best-odd-bookmaker">${bestDraw?.bookmaker || 'N/A'}</div>
              </div>
              <div class="best-odd-item">
                <div class="best-odd-value">${bestAway?.value ? bestAway.value.toFixed(2) : 'N/A'}</div>
                <div class="best-odd-bookmaker">${bestAway?.bookmaker || 'N/A'}</div>
              </div>
            </div>
            <div class="odds-table-container">
              <table class="odds-table">
                <thead>
                  <tr>
                    <th class="outcome-header"></th>
                    ${bookmakerHeaders}
                  </tr>
                </thead>
                <tbody>
                  ${homeRow}
                  ${drawRow}
                  ${awayRow}
                </tbody>
              </table>
            </div>
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
