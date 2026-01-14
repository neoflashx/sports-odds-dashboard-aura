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

class SoccerOdds extends HTMLElement {
  private sportKey: string = '';
  private theme: 'dark' | 'light' = 'light';
  private bookmaker: string = '';
  private matchId: string = '';
  private refreshInterval: number = 300000; // 5 minutes default
  private refreshTimer: number | null = null;
  private apiBaseUrl: string = '';

  private _shadowRoot: ShadowRoot | null = null;

  constructor() {
    super();
    // Attach shadow root and store it
    this._shadowRoot = this.attachShadow({ mode: 'closed' });
  }

  private get shadow(): ShadowRoot {
    if (!this._shadowRoot) {
      this._shadowRoot = this.attachShadow({ mode: 'closed' });
    }
    return this._shadowRoot;
  }

  static get observedAttributes() {
    return ['sport-key', 'theme', 'bookmaker', 'match-id', 'refresh-interval', 'api-url'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'sport-key':
        this.sportKey = newValue || '';
        break;
      case 'theme':
        this.theme = (newValue === 'dark' ? 'dark' : 'light');
        break;
      case 'bookmaker':
        this.bookmaker = newValue || '';
        break;
      case 'match-id':
        this.matchId = newValue || '';
        break;
      case 'refresh-interval':
        this.refreshInterval = parseInt(newValue, 10) * 1000 || 300000;
        break;
      case 'api-url':
        this.apiBaseUrl = newValue || '';
        break;
    }

    if (this.isConnected) {
      this.loadData();
    }
  }

  connectedCallback() {
    this.sportKey = this.getAttribute('sport-key') || '';
    this.theme = (this.getAttribute('theme') === 'dark' ? 'dark' : 'light');
    this.bookmaker = this.getAttribute('bookmaker') || '';
    this.matchId = this.getAttribute('match-id') || '';
    const refreshAttr = this.getAttribute('refresh-interval');
    this.refreshInterval = refreshAttr ? parseInt(refreshAttr, 10) * 1000 : 300000;
    this.apiBaseUrl = this.getAttribute('api-url') || window.location.origin;

    // Check container width for mobile
    this.checkMobileLayout();

    // Initial load
    this.loadData();

    // Set up auto-refresh
    this.startAutoRefresh();

    // Listen for resize events
    window.addEventListener('resize', () => this.checkMobileLayout());
  }

  disconnectedCallback() {
    this.stopAutoRefresh();
    window.removeEventListener('resize', () => this.checkMobileLayout());
  }

  private checkMobileLayout() {
    const width = this.getBoundingClientRect().width;
    if (width < 350) {
      this.classList.add('is-mobile');
    } else {
      this.classList.remove('is-mobile');
    }
  }

  private startAutoRefresh() {
    this.stopAutoRefresh();
    this.refreshTimer = window.setInterval(() => {
      this.loadData();
    }, this.refreshInterval);
  }

  private stopAutoRefresh() {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async loadData() {
    if (!this.sportKey) {
      this.renderError('Sport key is required');
      return;
    }

    // Ensure shadow root is ready
    if (!this.shadow) {
      console.error('Shadow root not available');
      return;
    }

    this.renderLoading();

    try {
      const params = new URLSearchParams({
        sport: this.sportKey,
        region: 'us',
        market: 'h2h',
      });

      if (this.bookmaker) {
        params.append('bookmaker', this.bookmaker);
      }

      const response = await fetch(`${this.apiBaseUrl}/api/odds?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Match[] = await response.json();
      this.renderMatches(data);
    } catch (error) {
      console.error('Error loading odds:', error);
      this.renderError('Live odds currently unavailable.');
    }
  }

  private renderLoading() {
    this.shadow.innerHTML = `
      ${this.getStyles()}
      <div class="widget-container ${this.theme}">
        <div class="loading">Loading odds...</div>
      </div>
    `;
  }

  private renderError(message: string) {
    this.shadow.innerHTML = `
      ${this.getStyles()}
      <div class="widget-container ${this.theme}">
        <div class="error">${message}</div>
      </div>
    `;
  }

  private renderMatches(matches: Match[]) {
    // Filter by match-id if specified
    let filteredMatches = matches;
    if (this.matchId) {
      filteredMatches = matches.filter(m => m.id === this.matchId);
      if (filteredMatches.length === 0) {
        this.renderError(`Match not found (ID: ${this.matchId})`);
        return;
      }
    }

    if (filteredMatches.length === 0) {
      this.renderError('No matches available');
      return;
    }

    const matchesHtml = filteredMatches.map(match => {
      const startTime = new Date(match.start_at);
      const timeStr = startTime.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      return `
        <div class="match">
          <div class="match-header">
            <div class="teams">
              <span class="team home">${this.escapeHtml(match.teams.home)}</span>
              <span class="vs">vs</span>
              <span class="team away">${this.escapeHtml(match.teams.away)}</span>
            </div>
            <div class="match-time">${timeStr}</div>
          </div>
          <div class="odds">
            ${match.odds.home !== null ? `<div class="odd home">${match.odds.home.toFixed(2)}</div>` : ''}
            ${match.odds.draw !== null ? `<div class="odd draw">${match.odds.draw.toFixed(2)}</div>` : ''}
            ${match.odds.away !== null ? `<div class="odd away">${match.odds.away.toFixed(2)}</div>` : ''}
          </div>
          <div class="bookmaker">${this.escapeHtml(match.bookmaker)}</div>
        </div>
      `;
    }).join('');

    this.shadow.innerHTML = `
      ${this.getStyles()}
      <div class="widget-container ${this.theme}">
        <div class="matches">
          ${matchesHtml}
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private getStyles(): string {
    const isDark = this.theme === 'dark';
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const borderColor = isDark ? '#333333' : '#e0e0e0';
    const primaryColor = isDark ? '#4a9eff' : '#2563eb';
    const hoverBg = isDark ? '#2a2a2a' : '#f5f5f5';

    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          font-size: 14px;
        }

        .widget-container {
          background: ${bgColor};
          color: ${textColor};
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .loading, .error {
          text-align: center;
          padding: 20px;
          color: ${isDark ? '#888' : '#666'};
        }

        .error {
          color: ${isDark ? '#ff6b6b' : '#dc2626'};
        }

        .matches {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .match {
          border: 1px solid ${borderColor};
          border-radius: 6px;
          padding: 12px;
          transition: background 0.2s;
        }

        .match:hover {
          background: ${hoverBg};
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .teams {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .team {
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .vs {
          color: ${isDark ? '#888' : '#666'};
          font-size: 12px;
        }

        .match-time {
          font-size: 12px;
          color: ${isDark ? '#888' : '#666'};
        }

        .odds {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .odd {
          flex: 1;
          min-width: 60px;
          background: ${primaryColor};
          color: white;
          padding: 8px;
          border-radius: 4px;
          text-align: center;
          font-weight: 600;
          font-size: 16px;
        }

        .bookmaker {
          font-size: 11px;
          color: ${isDark ? '#888' : '#666'};
          text-align: right;
        }

        :host(.is-mobile) .match-header {
          flex-direction: column;
          align-items: flex-start;
        }

        :host(.is-mobile) .teams {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        :host(.is-mobile) .vs {
          display: none;
        }

        :host(.is-mobile) .odds {
          flex-direction: column;
        }

        :host(.is-mobile) .odd {
          width: 100%;
        }
      </style>
    `;
  }
}

customElements.define('soccer-odds', SoccerOdds);
