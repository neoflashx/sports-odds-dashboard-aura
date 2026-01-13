import axios from 'axios';

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

export interface OddsApiSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface OddsApiOddsResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
}

export const fetchSports = async (): Promise<OddsApiSport[]> => {
  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey) {
    throw new Error('THE_ODDS_API_KEY environment variable is not set');
  }

  const response = await axios.get<OddsApiSport[]>(`${ODDS_API_BASE_URL}/sports`, {
    params: {
      apiKey,
    },
  });

  return response.data;
};

export const fetchOdds = async (
  sport: string,
  region: string = 'us',
  market: string = 'h2h'
): Promise<OddsApiOddsResponse[]> => {
  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey) {
    throw new Error('THE_ODDS_API_KEY environment variable is not set');
  }

  const response = await axios.get<OddsApiOddsResponse[]>(
    `${ODDS_API_BASE_URL}/sports/${sport}/odds`,
    {
      params: {
        apiKey,
        regions: region,
        markets: market,
      },
    }
  );

  return response.data;
};
