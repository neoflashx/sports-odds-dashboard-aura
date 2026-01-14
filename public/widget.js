class SoccerOdds extends HTMLElement {
    constructor() {
        super();
        this.sportKey = '';
        this.theme = 'light';
        this.bookmakers = [];
        this.matchId = '';
        this.refreshInterval = 300000; // 5 minutes default
        this.refreshTimer = null;
        this.apiBaseUrl = '';
        this._shadowRoot = null;
        // Attach shadow root and store it
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
    }
    get shadow() {
        if (!this._shadowRoot) {
            this._shadowRoot = this.attachShadow({ mode: 'closed' });
        }
        return this._shadowRoot;
    }
    static get observedAttributes() {
        return ['sport-key', 'theme', 'bookmaker', 'bookmakers', 'match-id', 'refresh-interval', 'api-url'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        switch (name) {
            case 'sport-key':
                this.sportKey = newValue || '';
                break;
            case 'theme':
                this.theme = (newValue === 'dark' ? 'dark' : 'light');
                break;
            case 'bookmaker':
                // Support legacy single bookmaker attribute
                this.bookmakers = newValue ? [newValue] : [];
                break;
            case 'bookmakers':
                // Support multiple bookmakers (comma-separated)
                this.bookmakers = newValue ? newValue.split(',').map(b => b.trim()).filter(Boolean) : [];
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
        // Support both single and multiple bookmaker attributes
        const bookmakersAttr = this.getAttribute('bookmakers');
        const bookmakerAttr = this.getAttribute('bookmaker');
        if (bookmakersAttr) {
            this.bookmakers = bookmakersAttr.split(',').map(b => b.trim()).filter(Boolean);
        }
        else if (bookmakerAttr) {
            this.bookmakers = [bookmakerAttr];
        }
        else {
            this.bookmakers = [];
        }
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
    checkMobileLayout() {
        const width = this.getBoundingClientRect().width;
        if (width < 350) {
            this.classList.add('is-mobile');
        }
        else {
            this.classList.remove('is-mobile');
        }
    }
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshTimer = window.setInterval(() => {
            this.loadData();
        }, this.refreshInterval);
    }
    stopAutoRefresh() {
        if (this.refreshTimer !== null) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    async loadData() {
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
            // Use the matches endpoint to get all bookmakers
            const response = await fetch(`${this.apiBaseUrl}/api/matches?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.renderMatches(data);
        }
        catch (error) {
            console.error('Error loading odds:', error);
            this.renderError('Live odds currently unavailable.');
        }
    }
    renderLoading() {
        this.shadow.innerHTML = `
      ${this.getStyles()}
      <div class="widget-container ${this.theme}">
        <div class="loading">Loading odds...</div>
      </div>
    `;
    }
    renderError(message) {
        this.shadow.innerHTML = `
      ${this.getStyles()}
      <div class="widget-container ${this.theme}">
        <div class="error">${message}</div>
      </div>
    `;
    }
    renderMatches(matches) {
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
            // Filter bookmakers if specific ones are selected
            let displayBookmakers = match.bookmakers;
            if (this.bookmakers.length > 0) {
                displayBookmakers = match.bookmakers.filter(bm => this.bookmakers.some(selected => bm.title.toLowerCase() === selected.toLowerCase() ||
                    bm.key.toLowerCase() === selected.toLowerCase()));
            }
            if (displayBookmakers.length === 0) {
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
            <div class="no-bookmakers">No bookmakers available for selected filters</div>
          </div>
        `;
            }
            // Render each bookmaker's odds
            const bookmakersHtml = displayBookmakers.map(bookmaker => {
                return `
          <div class="bookmaker-odds">
            <div class="bookmaker-name">${this.escapeHtml(bookmaker.title)}</div>
            <div class="odds-row">
              <div class="odd-item">
                <span class="odd-label">${this.escapeHtml(match.teams.home)}</span>
                <span class="odd-value ${bookmaker.odds.home !== null ? 'available' : 'unavailable'}">
                  ${bookmaker.odds.home !== null ? bookmaker.odds.home.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div class="odd-item">
                <span class="odd-label">Draw</span>
                <span class="odd-value ${bookmaker.odds.draw !== null ? 'available' : 'unavailable'}">
                  ${bookmaker.odds.draw !== null ? bookmaker.odds.draw.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div class="odd-item">
                <span class="odd-label">${this.escapeHtml(match.teams.away)}</span>
                <span class="odd-value ${bookmaker.odds.away !== null ? 'available' : 'unavailable'}">
                  ${bookmaker.odds.away !== null ? bookmaker.odds.away.toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        `;
            }).join('');
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
          <div class="bookmakers-list">
            ${bookmakersHtml}
          </div>
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
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    getStyles() {
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
          margin-bottom: 16px;
        }

        .match:hover {
          background: ${hoverBg};
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid ${borderColor};
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

        .bookmakers-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bookmaker-odds {
          border: 1px solid ${borderColor};
          border-radius: 4px;
          padding: 10px;
          background: ${isDark ? '#222' : '#f9fafb'};
        }

        .bookmaker-name {
          font-weight: 600;
          font-size: 13px;
          color: ${primaryColor};
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .odds-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }

        .odd-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: ${bgColor};
          border-radius: 4px;
          border: 1px solid ${borderColor};
        }

        .odd-label {
          font-size: 11px;
          color: ${isDark ? '#aaa' : '#666'};
          text-align: center;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }

        .odd-value {
          font-size: 18px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 4px;
          min-width: 50px;
          text-align: center;
        }

        .odd-value.available {
          background: ${primaryColor};
          color: white;
        }

        .odd-value.unavailable {
          background: ${isDark ? '#333' : '#e5e7eb'};
          color: ${isDark ? '#666' : '#9ca3af'};
          font-size: 14px;
        }

        .no-bookmakers {
          text-align: center;
          padding: 16px;
          color: ${isDark ? '#888' : '#666'};
          font-style: italic;
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

        :host(.is-mobile) .odds-row {
          grid-template-columns: 1fr;
          gap: 6px;
        }

        :host(.is-mobile) .odd-item {
          flex-direction: row;
          justify-content: space-between;
          padding: 10px;
        }

        :host(.is-mobile) .odd-label {
          text-align: left;
          font-size: 12px;
        }

        :host(.is-mobile) .odd-value {
          font-size: 16px;
        }
      </style>
    `;
    }
}
customElements.define('soccer-odds', SoccerOdds);
