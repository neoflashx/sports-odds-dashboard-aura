import { useState, useEffect } from 'react';
import LeagueSelector from './components/LeagueSelector';
import BookmakerSelector from './components/BookmakerSelector';
import WidgetPreview from './components/WidgetPreview';
import CodeSnippet from './components/CodeSnippet';

interface Sport {
  key: string;
  title: string;
  group: string;
}

function App() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>('');
  const [availableBookmakers, setAvailableBookmakers] = useState<string[]>([]);
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
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmakers = async (sportKey: string) => {
    try {
      const response = await fetch(`/api/odds?sport=${sportKey}&region=us&market=h2h`);
      if (response.ok) {
        const data = await response.json();
        const bookmakers = Array.from(
          new Set(data.map((match: any) => match.bookmaker).filter(Boolean))
        ) as string[];
        setAvailableBookmakers(bookmakers);
      }
    } catch (error) {
      console.error('Error fetching bookmakers:', error);
    }
  };

  useEffect(() => {
    if (selectedSport) {
      fetchBookmakers(selectedSport);
    }
  }, [selectedSport]);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
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
                <BookmakerSelector
                  bookmakers={availableBookmakers}
                  selectedBookmaker={selectedBookmaker}
                  onSelect={setSelectedBookmaker}
                />
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

            {selectedSport && (
              <CodeSnippet
                sportKey={selectedSport}
                bookmaker={selectedBookmaker}
                theme={theme}
                apiUrl={getApiUrl()}
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
                  bookmaker={selectedBookmaker}
                  theme={theme}
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
