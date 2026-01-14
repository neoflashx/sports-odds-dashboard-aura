import { useState, useRef } from 'react';

interface WidgetPreviewProps {
  sportKey: string;
  bookmakers: string[];
  theme: 'light' | 'dark';
  matchId?: string;
}

export default function WidgetPreview({
  sportKey,
  bookmakers,
  theme,
  matchId,
}: WidgetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadWidget = () => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '<div class="text-gray-500 text-center py-4">Loading widget...</div>';

    const createWidget = () => {
      if (!containerRef.current) return;

      // Create widget element
      const widget = document.createElement('soccer-odds');
      widget.setAttribute('sport-key', sportKey);
      widget.setAttribute('theme', theme);
      if (bookmakers.length > 0) {
        widget.setAttribute('bookmakers', bookmakers.join(','));
      }
      widget.setAttribute('api-url', window.location.origin);
      if (matchId) {
        widget.setAttribute('match-id', matchId);
      }

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(widget);
      setIsLoaded(true);
    };

    // Check if custom element is already defined
    if (customElements.get('soccer-odds')) {
      createWidget();
    } else {
      // Load widget script
      const existingScript = document.querySelector('script[src*="widget.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = '/widget.js';
        script.async = true;
        script.onload = () => {
          createWidget();
        };
        script.onerror = () => {
          if (containerRef.current) {
            containerRef.current.innerHTML = '<div class="text-red-600 text-center py-4">Failed to load widget.js. Check that the file exists at /widget.js</div>';
          }
        };
        document.head.appendChild(script);
      } else {
        // Script already loading, wait a bit then try
        setTimeout(createWidget, 100);
      }
    }
  };

  const handleLoadClick = () => {
    if (!sportKey) {
      alert('Please select a league first');
      return;
    }
    if (!matchId) {
      alert('Please select a match first');
      return;
    }
    if (bookmakers.length === 0) {
      alert('Please select at least one bookmaker');
      return;
    }
    loadWidget();
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px]">
      {!isLoaded ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 mb-4 text-center">
            Click the button below to load the widget preview
          </p>
          <button
            onClick={handleLoadClick}
            disabled={!sportKey || !matchId || bookmakers.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Load Preview
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setIsLoaded(false);
              if (containerRef.current) {
                containerRef.current.innerHTML = '';
              }
            }}
            className="mb-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reload Preview
          </button>
          <div ref={containerRef} className="widget-preview-container"></div>
        </div>
      )}
    </div>
  );
}
