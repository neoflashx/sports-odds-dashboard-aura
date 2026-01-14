interface BookmakerSelectorProps {
  bookmakers: string[];
  selectedBookmakers: string[];
  onSelect: (bookmakers: string[]) => void;
}

export default function BookmakerSelector({
  bookmakers,
  selectedBookmakers,
  onSelect,
}: BookmakerSelectorProps) {
  const handleToggle = (bookmaker: string) => {
    if (selectedBookmakers.includes(bookmaker)) {
      onSelect(selectedBookmakers.filter((bm) => bm !== bookmaker));
    } else {
      onSelect([...selectedBookmakers, bookmaker]);
    }
  };

  const handleSelectAll = () => {
    if (selectedBookmakers.length === bookmakers.length) {
      onSelect([]);
    } else {
      onSelect([...bookmakers]);
    }
  };

  if (bookmakers.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-500">Select a match to see available bookmakers</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Bookmakers ({selectedBookmakers.length} selected)
        </label>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {selectedBookmakers.length === bookmakers.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
        {bookmakers.map((bookmaker) => (
          <label
            key={bookmaker}
            className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2"
          >
            <input
              type="checkbox"
              checked={selectedBookmakers.includes(bookmaker)}
              onChange={() => handleToggle(bookmaker)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{bookmaker}</span>
          </label>
        ))}
      </div>
      {selectedBookmakers.length === 0 && (
        <p className="mt-2 text-sm text-amber-600">
          Please select at least one bookmaker
        </p>
      )}
    </div>
  );
}
