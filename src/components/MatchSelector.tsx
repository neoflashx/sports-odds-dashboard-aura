interface Match {
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

interface MatchSelectorProps {
  matches: Match[];
  selectedMatch: string;
  onSelect: (matchId: string) => void;
}

export default function MatchSelector({
  matches,
  selectedMatch,
  onSelect,
}: MatchSelectorProps) {
  if (matches.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-500">No matches available for this league</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Match
      </label>
      <select
        value={selectedMatch}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All matches</option>
        {matches.map((match) => {
          const date = new Date(match.start_at);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
          return (
            <option key={match.id} value={match.id}>
              {match.teams.home} vs {match.teams.away} ({dateStr})
            </option>
          );
        })}
      </select>
      {selectedMatch && (
        <p className="mt-2 text-sm text-gray-500">
          Selected: {matches.find((m) => m.id === selectedMatch)?.teams.home} vs{' '}
          {matches.find((m) => m.id === selectedMatch)?.teams.away}
        </p>
      )}
    </div>
  );
}
