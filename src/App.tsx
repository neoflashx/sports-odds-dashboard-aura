import { useState, useEffect } from 'react';
import LeagueSelector from './components/LeagueSelector';
import BookmakerSelector from './components/BookmakerSelector';
import MatchSelector from './components/MatchSelector';
import WidgetPreview from './components/WidgetPreview';
import CodeSnippet from './components/CodeSnippet';

interface Sport {
  key: string;
  title: string;
  group: string;
}

interface Match {
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

function App() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedBookmakers, setSelectedBookmakers] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [availableBookmakers, setAvailableBookmakers] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [region, setRegion] = useState<string>('us');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await fetch('/api/sports');
      if (response.ok) {
        const data = await response.json();
        setSports(data);
        if (data.length > 0 && !selectedSport) {
          setSelectedSport(data[0].key);
        }
      } else {
        console.error('Failed to fetch sports:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (sportKey: string, regionCode: string) => {
    try {
      const response = await fetch(`/api/matches?sport=${sportKey}&region=${regionCode}&market=h2h`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
        
        // Reset selections when matches change
        setSelectedMatch('');
        setSelectedBookmaker('');
        setAvailableBookmakers([]);
      } else {
        console.error('Failed to fetch matches:', response.status);
        setMatches([]);
        setAvailableBookmakers([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
      setAvailableBookmakers([]);
    }
  };

  // Update available bookmakers when a match is selected
  useEffect(() => {
    if (selectedMatch && matches.length > 0) {
      const match = matches.find((m) => m.id === selectedMatch);
      if (match) {
        const bookmakers = match.bookmakers.map((bm) => bm.title);
        setAvailableBookmakers(bookmakers);
        // Auto-select first bookmaker if none selected
        if (selectedBookmakers.length === 0 && bookmakers.length > 0) {
          setSelectedBookmakers([bookmakers[0]]);
        }
      }
    } else {
      setAvailableBookmakers([]);
      setSelectedBookmakers([]);
    }
  }, [selectedMatch, matches]);

  useEffect(() => {
    if (selectedSport) {
      fetchMatches(selectedSport, region);
    } else {
      setMatches([]);
      setAvailableBookmakers([]);
    }
  }, [selectedSport, region]);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading sports leagues...</div>
      </div>
    );
  }

  if (sports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">No sports leagues found</div>
          <div className="text-gray-600 text-sm mb-4">
            Check browser console for errors
          </div>
          <button
            onClick={fetchSports}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sports Odds Widget Generator
          </h1>
          <p className="text-gray-600">
            Generate embeddable widgets for soccer odds
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>
              
              <LeagueSelector
                sports={sports}
                selectedSport={selectedSport}
                onSelect={setSelectedSport}
              />

              {selectedSport && (
                <>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="au">Australia</option>
                      <option value="eu">Europe</option>
                    </select>
                  </div>

                  <MatchSelector
                    matches={matches}
                    selectedMatch={selectedMatch}
                    onSelect={setSelectedMatch}
                  />

                  {selectedMatch && (
                    <BookmakerSelector
                      bookmakers={availableBookmakers}
                      selectedBookmakers={selectedBookmakers}
                      onSelect={setSelectedBookmakers}
                    />
                  )}
                </>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            {selectedSport && selectedMatch && selectedBookmakers.length > 0 && (
              <CodeSnippet
                sportKey={selectedSport}
                bookmakers={selectedBookmakers}
                theme={theme}
                apiUrl={getApiUrl()}
                matchId={selectedMatch}
              />
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              {selectedSport ? (
                <WidgetPreview
                  sportKey={selectedSport}
                  bookmakers={selectedBookmakers}
                  theme={theme}
                  matchId={selectedMatch}
                />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Select a league to see preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
