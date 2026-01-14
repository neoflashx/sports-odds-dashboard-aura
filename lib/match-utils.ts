import { OddsApiOddsResponse } from './odds-api.js';

export interface MatchWithBookmakers {
  id: string;
  teams: {
    home: string;
    away: string;
  };
  start_at: string;
  bookmakers: Array<{
    key: string;
    title: string;
    odds: {
      home: number | null;
      draw: number | null;
      away: number | null;
    };
  }>;
}

export const transformMatchesWithBookmakers = (
  rawData: OddsApiOddsResponse[]
): MatchWithBookmakers[] => {
  return rawData.map((game) => {
    const bookmakers = game.bookmakers.map((bookmaker) => {
      const h2hMarket = bookmaker.markets.find((m) => m.key === 'h2h');
      const outcomes = h2hMarket?.outcomes || [];

      const homeOutcome = outcomes.find((o) => o.name === game.home_team);
      const awayOutcome = outcomes.find((o) => o.name === game.away_team);
      const drawOutcome = outcomes.find((o) => o.name === 'Draw' || o.name === 'draw');

      return {
        key: bookmaker.key,
        title: bookmaker.title,
        odds: {
          home: homeOutcome?.price || null,
          draw: drawOutcome?.price || null,
          away: awayOutcome?.price || null,
        },
      };
    });

    return {
      id: game.id,
      teams: {
        home: game.home_team,
        away: game.away_team,
      },
      start_at: game.commence_time,
      bookmakers,
    };
  });
};
