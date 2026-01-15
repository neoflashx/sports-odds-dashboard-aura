class SoccerOdds extends HTMLElement {
    constructor() {
        super();
        this.sportKey = '';
        this.theme = 'light';
        this.bookmakers = [];
        this.matchId = '';
        this.region = 'us'; // Default to US
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
        return ['sport-key', 'theme', 'bookmaker', 'bookmakers', 'match-id', 'region', 'refresh-interval', 'api-url'];
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
                console.log('Bookmaker attribute changed:', this.bookmakers);
                break;
            case 'bookmakers':
                // Support multiple bookmakers (comma-separated)
                this.bookmakers = newValue ? newValue.split(',').map(b => b.trim()).filter(Boolean) : [];
                console.log('Bookmakers attribute changed:', this.bookmakers);
                break;
            case 'match-id':
                this.matchId = newValue || '';
                break;
            case 'region':
                this.region = newValue || 'us';
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
        console.log('Widget connected with bookmakers:', this.bookmakers);
        this.matchId = this.getAttribute('match-id') || '';
        this.region = this.getAttribute('region') || 'us';
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
                region: this.region,
                market: 'h2h',
            });
            // Use the matches endpoint to get all bookmakers
            const response = await fetch(`${this.apiBaseUrl}/api/matches?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Loaded matches data:', {
                matchCount: data.length,
                selectedBookmakers: this.bookmakers,
                matchId: this.matchId,
            });
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
            const dateStr = startTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
            const timeStr = startTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            });
            // Filter bookmakers if specific ones are selected
            let displayBookmakers = match.bookmakers;
            if (this.bookmakers.length > 0) {
                displayBookmakers = match.bookmakers.filter(bm => this.bookmakers.some(selected => {
                    const selectedLower = selected.toLowerCase().trim();
                    const titleLower = bm.title.toLowerCase().trim();
                    const keyLower = bm.key.toLowerCase().trim();
                    const normalize = (str) => {
                        return str
                            .replace(/\s*\([^)]*\)/g, '')
                            .replace(/[^a-z0-9]/g, '')
                            .toLowerCase();
                    };
                    const selectedNormalized = normalize(selectedLower);
                    const titleNormalized = normalize(titleLower);
                    const keyNormalized = normalize(keyLower);
                    return titleLower === selectedLower || keyLower === selectedLower ||
                        titleNormalized === selectedNormalized || keyNormalized === selectedNormalized ||
                        titleLower.includes(selectedLower) || selectedLower.includes(titleLower) ||
                        titleNormalized.includes(selectedNormalized) || selectedNormalized.includes(titleNormalized);
                }));
            }
            if (displayBookmakers.length === 0) {
                return `
          <div class="match">
            <div class="match-header">
              <div class="league-info">
                <span class="league-name">${this.sportKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                <span class="match-date">${dateStr}</span>
              </div>
            </div>
            <div class="no-bookmakers">No bookmakers available for selected filters</div>
          </div>
        `;
            }
            // Calculate best odds for each outcome
            const bestHome = displayBookmakers
                .map(bm => ({ value: bm.odds.home, bookmaker: bm.title }))
                .filter(o => o.value !== null)
                .sort((a, b) => b.value - a.value)[0];
            const bestDraw = displayBookmakers
                .map(bm => ({ value: bm.odds.draw, bookmaker: bm.title }))
                .filter(o => o.value !== null)
                .sort((a, b) => b.value - a.value)[0];
            const bestAway = displayBookmakers
                .map(bm => ({ value: bm.odds.away, bookmaker: bm.title }))
                .filter(o => o.value !== null)
                .sort((a, b) => b.value - a.value)[0];
            // Build table header with bookmaker names
            const bookmakerHeaders = displayBookmakers.map(bm => `<th class="bookmaker-header">${this.escapeHtml(bm.title)}</th>`).join('');
            // Build rows for each outcome
            const homeRow = this.buildOddsRow(match.teams.home, displayBookmakers.map(bm => bm.odds.home), bestHome?.value);
            const drawRow = this.buildOddsRow('Draw', displayBookmakers.map(bm => bm.odds.draw), bestDraw?.value);
            const awayRow = this.buildOddsRow(match.teams.away, displayBookmakers.map(bm => bm.odds.away), bestAway?.value);
            return `
        <div class="match">
          <div class="match-header">
            <div class="league-info">
              <span class="league-name">${this.sportKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <span class="match-date">${dateStr} ${timeStr}</span>
            </div>
          </div>
          <div class="match-content">
            <div class="match-info">
              <div class="team-info">
                <div class="team-name">${this.escapeHtml(match.teams.home)}</div>
              </div>
              <div class="team-info">
                <div class="team-name">${this.escapeHtml(match.teams.away)}</div>
              </div>
              <div class="team-info">
                <div class="team-name">Draw</div>
              </div>
            </div>
            <div class="best-odds">
              <div class="best-odd-item">
                <div class="best-odd-value">${bestHome?.value ? bestHome.value.toFixed(2) : 'N/A'}</div>
                <div class="best-odd-bookmaker">${bestHome?.bookmaker || 'N/A'}</div>
              </div>
              <div class="best-odd-item">
                <div class="best-odd-value">${bestDraw?.value ? bestDraw.value.toFixed(2) : 'N/A'}</div>
                <div class="best-odd-bookmaker">${bestDraw?.bookmaker || 'N/A'}</div>
              </div>
              <div class="best-odd-item">
                <div class="best-odd-value">${bestAway?.value ? bestAway.value.toFixed(2) : 'N/A'}</div>
                <div class="best-odd-bookmaker">${bestAway?.bookmaker || 'N/A'}</div>
              </div>
            </div>
            <div class="odds-table-container">
              <table class="odds-table">
                <thead>
                  <tr>
                    <th class="outcome-header"></th>
                    ${bookmakerHeaders}
                  </tr>
                </thead>
                <tbody>
                  ${homeRow}
                  ${drawRow}
                  ${awayRow}
                </tbody>
              </table>
            </div>
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
    buildOddsRow(label, odds, bestValue) {
        const cells = odds.map((odd) => {
            const isBest = odd !== null && bestValue !== null && odd === bestValue;
            const cellClass = odd !== null ? 'available' : 'unavailable';
            const bestClass = isBest ? 'best-odd' : '';
            return `
        <td class="odds-cell ${cellClass} ${bestClass}">
          ${odd !== null ? odd.toFixed(2) : 'N/A'}
        </td>
      `;
        }).join('');
        return `
      <tr class="odds-row">
        <td class="outcome-label">${this.escapeHtml(label)}</td>
        ${cells}
      </tr>
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
        const bestOddColor = '#3b82f6';
        const headerBg = isDark ? '#2a2a2a' : '#f8f9fa';
        return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          font-size: 14px;
          width: 100%;
        }

        .widget-container {
          background: ${bgColor};
          color: ${textColor};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .loading, .error {
          text-align: center;
          padding: 40px 20px;
          color: ${isDark ? '#888' : '#666'};
        }

        .error {
          color: ${isDark ? '#ff6b6b' : '#dc2626'};
        }

        .matches {
          display: flex;
          flex-direction: column;
        }

        .match {
          background: ${bgColor};
          border-bottom: 1px solid ${borderColor};
        }

        .match:last-child {
          border-bottom: none;
        }

        .match-header {
          background: ${headerBg};
          padding: 12px 16px;
          border-bottom: 2px solid ${borderColor};
        }

        .league-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .league-name {
          font-weight: 600;
          font-size: 15px;
          color: ${textColor};
        }

        .match-date {
          font-size: 13px;
          color: ${isDark ? '#aaa' : '#666'};
        }

        .match-content {
          display: grid;
          grid-template-columns: 200px 180px 1fr;
          gap: 0;
          padding: 16px;
        }

        .match-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 16px;
          border-right: 1px solid ${borderColor};
        }

        .team-info {
          display: flex;
          align-items: center;
          min-height: 40px;
        }

        .team-name {
          font-weight: 500;
          font-size: 14px;
          color: ${textColor};
        }

        .best-odds {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 16px;
          border-right: 1px solid ${borderColor};
        }

        .best-odd-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40px;
        }

        .best-odd-value {
          font-size: 20px;
          font-weight: 700;
          color: ${primaryColor};
          margin-bottom: 4px;
        }

        .best-odd-bookmaker {
          font-size: 11px;
          color: ${isDark ? '#aaa' : '#666'};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .odds-table-container {
          overflow-x: auto;
          padding-left: 16px;
        }

        .odds-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 400px;
        }

        .odds-table thead {
          background: ${headerBg};
        }

        .outcome-header {
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${isDark ? '#aaa' : '#666'};
          border-bottom: 2px solid ${borderColor};
        }

        .bookmaker-header {
          padding: 10px 12px;
          text-align: center;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${textColor};
          border-bottom: 2px solid ${borderColor};
          white-space: nowrap;
          min-width: 100px;
        }

        .odds-row {
          border-bottom: 1px solid ${borderColor};
        }

        .odds-row:last-child {
          border-bottom: none;
        }

        .outcome-label {
          padding: 12px;
          font-weight: 500;
          font-size: 14px;
          color: ${textColor};
          text-align: left;
          vertical-align: middle;
        }

        .odds-cell {
          padding: 12px;
          text-align: center;
          font-size: 15px;
          font-weight: 600;
          vertical-align: middle;
          border-left: 1px solid ${borderColor};
        }

        .odds-cell.available {
          color: ${textColor};
        }

        .odds-cell.unavailable {
          color: ${isDark ? '#555' : '#9ca3af'};
        }

        .odds-cell.best-odd {
          background: ${bestOddColor};
          color: white;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        .no-bookmakers {
          text-align: center;
          padding: 40px 20px;
          color: ${isDark ? '#888' : '#666'};
          font-style: italic;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .match-content {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .match-info,
          .best-odds {
            border-right: none;
            border-bottom: 1px solid ${borderColor};
            padding-bottom: 16px;
            padding-right: 0;
          }

          .match-info {
            flex-direction: row;
            gap: 16px;
            flex-wrap: wrap;
          }

          .best-odds {
            flex-direction: row;
            gap: 16px;
            padding-left: 0;
          }

          .odds-table-container {
            padding-left: 0;
          }

          .odds-table {
            font-size: 12px;
          }

          .bookmaker-header,
          .odds-cell {
            padding: 8px 6px;
            min-width: 80px;
          }
        }
      </style>
    `;
    }
}
customElements.define('soccer-odds', SoccerOdds);
