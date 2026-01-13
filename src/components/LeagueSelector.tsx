interface Sport {
  key: string;
  title: string;
  group: string;
}

interface LeagueSelectorProps {
  sports: Sport[];
  selectedSport: string;
  onSelect: (sportKey: string) => void;
}

export default function LeagueSelector({
  sports,
  selectedSport,
  onSelect,
}: LeagueSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Soccer League
      </label>
      <select
        value={selectedSport}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a league...</option>
        {sports.map((sport) => (
          <option key={sport.key} value={sport.key}>
            {sport.title}
          </option>
        ))}
      </select>
      {selectedSport && (
        <p className="mt-2 text-sm text-gray-500">
          Selected: {sports.find((s) => s.key === selectedSport)?.title}
        </p>
      )}
    </div>
  );
}
