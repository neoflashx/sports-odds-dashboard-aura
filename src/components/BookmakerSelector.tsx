interface BookmakerSelectorProps {
  bookmakers: string[];
  selectedBookmaker: string;
  onSelect: (bookmaker: string) => void;
}

export default function BookmakerSelector({
  bookmakers,
  selectedBookmaker,
  onSelect,
}: BookmakerSelectorProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Bookmaker (Optional)
      </label>
      <select
        value={selectedBookmaker}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All bookmakers (best odds)</option>
        {bookmakers.map((bookmaker) => (
          <option key={bookmaker} value={bookmaker}>
            {bookmaker}
          </option>
        ))}
      </select>
      {bookmakers.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Loading available bookmakers...
        </p>
      )}
    </div>
  );
}
