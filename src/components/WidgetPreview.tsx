import { useEffect, useRef } from 'react';

interface WidgetPreviewProps {
  sportKey: string;
  bookmaker: string;
  theme: 'light' | 'dark';
}

export default function WidgetPreview({
  sportKey,
  bookmaker,
  theme,
}: WidgetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create widget element
    const widget = document.createElement('soccer-odds');
    widget.setAttribute('sport-key', sportKey);
    widget.setAttribute('theme', theme);
    if (bookmaker) {
      widget.setAttribute('bookmaker', bookmaker);
    }
    widget.setAttribute('api-url', window.location.origin);

    containerRef.current.appendChild(widget);

    // Load widget script if not already loaded
    if (!document.querySelector('script[src*="widget.js"]')) {
      const script = document.createElement('script');
      script.src = '/widget.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [sportKey, bookmaker, theme]);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px]">
      <div ref={containerRef} className="widget-preview-container"></div>
    </div>
  );
}
