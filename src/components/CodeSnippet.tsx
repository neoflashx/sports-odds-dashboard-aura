import { useState } from 'react';

interface CodeSnippetProps {
  sportKey: string;
  bookmakers: string[];
  theme: 'light' | 'dark';
  apiUrl: string;
  matchId?: string;
}

export default function CodeSnippet({
  sportKey,
  bookmakers,
  theme,
  apiUrl,
  matchId,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const attributes = [
    `sport-key="${sportKey}"`,
    `theme="${theme}"`,
    bookmakers.length > 0 && `bookmakers="${bookmakers.join(',')}"`,
    matchId && `match-id="${matchId}"`,
    `api-url="${apiUrl}"`,
  ]
    .filter(Boolean)
    .join(' ');

  const code = `<script src="${apiUrl}/widget.js"></script>
<soccer-odds ${attributes}></soccer-odds>`;

  const iframeCode = `<iframe 
  src="${apiUrl}/widget/render?sport-key=${sportKey}&theme=${theme}${bookmakers.length > 0 ? `&bookmakers=${encodeURIComponent(bookmakers.join(','))}` : ''}${matchId ? `&match-id=${matchId}` : ''}"
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: none;">
</iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Embed Code</h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Web Component (Recommended)
            </label>
            <button
              onClick={() => copyToClipboard(code)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Iframe Fallback
            </label>
            <button
              onClick={() => copyToClipboard(iframeCode)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
            <code>{iframeCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
