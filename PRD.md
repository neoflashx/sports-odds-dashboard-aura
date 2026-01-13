Project Specification: Sports Odds Widget System
Role: You are an Expert Full-Stack Developer specialized in Widget Architecture and API integrations. Goal: Build a secure, scalable system to generate and serve betting odds widgets for 3rd party sites.

1. Tech Stack & Constraints
Backend (Proxy Server): Node.js + Express.

Caching: node-cache (Critical: The Odds API has strict rate limits).

Frontend (Dashboard): React (Vite) + Tailwind CSS.

Widget (The Embed): Vanilla JavaScript (Web Components) - No frameworks inside the widget to keep bundle size <20kb.

Security: API Keys must NEVER be exposed to the client. All requests must go through the Proxy Server.

2. Architecture Overview
3rd Party Site: Embeds <soccer-odds> tag or <iframe>.

Widget: Fetches data from Your Proxy Server (not The Odds API directly).

Proxy Server:

Checks Cache.

If missing, calls The Odds API.

Transforms complex JSON -> Simple JSON.

Returns data to Widget.

3. Backend Specification (Node.js)
3.1 Data Transformation (Logic)
The AI must transform the provider's complex response into a flat structure for the widget.

Input (The Odds API - /v4/sports/{sport}/odds):

JSON

{
  "home_team": "Arsenal",
  "away_team": "Chelsea",
  "commence_time": "2025-10-24T14:00:00Z",
  "bookmakers": [
    {
      "key": "fanduel",
      "markets": [
        { "key": "h2h", "outcomes": [{"name": "Arsenal", "price": 2.10}, {"name": "Chelsea", "price": 3.40}] }
      ]
    }
  ]
}
Output (Proxy Response - Sent to Widget): Simplify the data to reduce bandwidth.

JSON

{
  "id": "game_123",
  "teams": { "home": "Arsenal", "away": "Chelsea" },
  "start_at": "2025-10-24T14:00:00Z",
  "odds": { "home": 2.10, "away": 3.40, "draw": 3.10 },
  "bookie": "FanDuel"
}
3.2 Endpoints
GET /api/sports: Returns list of active soccer leagues.

Filter: group must contain "Soccer".

GET /api/odds:

Query Params: sport (required), region (default 'us'), market (default 'h2h').

Cache Strategy: Cache key = sport_region_market. TTL = 600 seconds (10 mins).

4. Frontend Specification (Widget)
4.1 Web Component: <soccer-odds>
Create a Custom Element that works anywhere.

Attributes:

sport-key: (e.g., soccer_epl)

theme: (e.g., dark, light)

Lifecycle:

connectedCallback(): Read attributes.

Check container width. If <350px, add class is-mobile (stack layout).

Fetch data from Your Proxy Server.

Render Shadow DOM (isolated styles).

Error State: If fetch fails, render: <div class="error">Live odds currently unavailable.</div>

4.2 Iframe Fallback
Create a route /widget/render that accepts query params and renders the same UI as the Web Component, but as a full HTML page.

5. Development Prompt Sequence
Feed these instructions to the AI one by one for best results.

Prompt 1 (Backend Setup):

"Initialize a Node.js Express server. Install axios, dotenv, and node-cache. Create a route GET /api/odds that accepts sport and region. In this route, call The Odds API endpoint v4/sports/{sport}/odds. Implement a 10-minute cache mechanism so we don't hit the external API on every request. Return the raw JSON for now."

Prompt 2 (Data Cleaning):

"Refactor the GET /api/odds route. Instead of returning the raw API data, write a utility function transformOddsData(rawData). It should map the complex external JSON into a simplified array: { teams: {home, away}, time, odds: {home, draw, away}, bookmaker_name }. Use the first available bookmaker in the list."

Prompt 3 (Web Component):

"Create a vanilla JavaScript file widget.js. Define a class SoccerOdds extending HTMLElement. In connectedCallback, read the sport-key attribute, fetch data from our local /api/odds, and render a simple list of matches using Shadow DOM. Use a <style> tag inside the shadow root for basic styling."

Prompt 4 (Dashboard):

"Create a simple index.html dashboard. Add a dropdown to select a Soccer League (hardcode a few IDs like soccer_epl for now). When selected, generate the code snippet for the user to copy: <script src='.../widget.js'></script><soccer-odds sport-key='...'></soccer-odds>."