import { useEffect, useRef } from 'react';

interface WidgetPreviewProps {
  sportKey: string;
  bookmaker: string;
  theme: 'light' | 'dark';
  matchId?: string;
}

export default function WidgetPreview({
  sportKey,
  bookmaker,
  theme,
  matchId,
}: WidgetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '<div class="text-gray-500 text-center py-4">Loading widget...</div>';

    // Load widget script if not already loaded
    const loadWidget = () => {
      if (!containerRef.current) return;

      // Create widget element
      const widget = document.createElement('soccer-odds');
      widget.setAttribute('sport-key', sportKey);
      widget.setAttribute('theme', theme);
      if (bookmaker) {
        widget.setAttribute('bookmaker', bookmaker);
      }
      widget.setAttribute('api-url', window.location.origin);
      if (matchId) {
        widget.setAttribute('match-id', matchId);
      }

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(widget);
    };

    // Check if custom element is already defined
    if (customElements.get('soccer-odds')) {
      loadWidget();
    } else {
      // Load widget script
      const existingScript = document.querySelector('script[src*="widget.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = '/widget.js';
        script.async = true;
        script.onload = () => {
          loadWidget();
        };
        script.onerror = () => {
          if (containerRef.current) {
            containerRef.current.innerHTML = '<div class="text-red-600 text-center py-4">Failed to load widget.js. Check that the file exists at /widget.js</div>';
          }
        };
        document.head.appendChild(script);
      } else {
        // Script already loading, wait a bit then try
        setTimeout(loadWidget, 100);
      }
    }
  }, [sportKey, bookmaker, theme, matchId]);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px]">
      <div ref={containerRef} className="widget-preview-container"></div>
    </div>
  );
}
