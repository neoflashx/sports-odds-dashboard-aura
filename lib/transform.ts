import { OddsApiOddsResponse } from './odds-api.js';

export interface TransformedOdds {
  id: string;
  teams: {
    home: string;
    away: string;
  };
  start_at: string;
  odds: {
    home: number | null;
    draw: number | null;
    away: number | null;
  };
  bookmaker: string;
}

export const transformOddsData = (
  rawData: OddsApiOddsResponse[],
  preferredBookmaker?: string
): TransformedOdds[] => {
  return rawData.map((game) => {
    // Find bookmaker - prefer user selection, otherwise first available
    let selectedBookmaker = game.bookmakers[0];
    
    if (preferredBookmaker) {
      const preferredLower = preferredBookmaker.toLowerCase();
      const preferred = game.bookmakers.find(
        (bm) => 
          bm.key.toLowerCase() === preferredLower ||
          bm.title.toLowerCase() === preferredLower
      );
      if (preferred) {
        selectedBookmaker = preferred;
      }
    }

    // Extract h2h market
    const h2hMarket = selectedBookmaker?.markets.find((m) => m.key === 'h2h');
    const outcomes = h2hMarket?.outcomes || [];

    // Map outcomes to home/draw/away
    const homeOutcome = outcomes.find((o) => o.name === game.home_team);
    const awayOutcome = outcomes.find((o) => o.name === game.away_team);
    const drawOutcome = outcomes.find((o) => o.name === 'Draw' || o.name === 'draw');

    return {
      id: game.id,
      teams: {
        home: game.home_team,
        away: game.away_team,
      },
      start_at: game.commence_time,
      odds: {
        home: homeOutcome?.price || null,
        draw: drawOutcome?.price || null,
        away: awayOutcome?.price || null,
      },
      bookmaker: selectedBookmaker?.title || 'Unknown',
    };
  });
};
