# Sports Odds Widget System

A secure, scalable system to generate and serve betting odds widgets for 3rd party sites.

## Architecture

- **Backend**: Vercel Serverless Functions (TypeScript)
- **Caching**: Firebase Firestore
- **Dashboard**: React + Vite + TypeScript + Tailwind CSS
- **Widget**: Vanilla JavaScript Web Components (<20kb)

## Features

- ✅ Secure API proxy (API keys never exposed to client)
- ✅ Firebase Firestore caching (10-minute TTL)
- ✅ Fallback to stale cache when API is down
- ✅ Web Component widget with Shadow DOM
- ✅ Iframe fallback for sites that can't use Web Components
- ✅ Responsive design (mobile-friendly)
- ✅ Dark/Light theme support
- ✅ Auto-refresh functionality
- ✅ Bookmaker selection
- ✅ CORS-enabled for cross-origin embedding

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
THE_ODDS_API_KEY=your_odds_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Create a service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file
4. Extract the following from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
5. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 4. Build Widget

```bash
npm run build:widget
```

This compiles the TypeScript widget to `public/widget.js`.

### 5. Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
```

## Deployment

### Vercel Deployment

📖 **Detailed Guide**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete step-by-step instructions.

**Quick Steps:**
1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `THE_ODDS_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY` (paste the full key including `\n`)
   - `FIREBASE_CLIENT_EMAIL`
4. Deploy

### Firebase Firestore Rules

📖 **Detailed Guide**: See [FIRESTORE_DEPLOYMENT.md](./FIRESTORE_DEPLOYMENT.md) for complete instructions.

**Quick Steps:**
Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

Or manually set in Firebase Console:
- Go to Firestore Database > Rules
- Paste the rules from `firebase/firestore.rules`

## API Endpoints

### GET /api/sports

Returns list of active soccer leagues.

**Response:**
```json
[
  {
    "key": "soccer_epl",
    "title": "Premier League",
    "group": "Soccer",
    "active": true
  }
]
```

### GET /api/odds

Fetches and transforms odds data.

**Query Parameters:**
- `sport` (required): Sport key (e.g., `soccer_epl`)
- `region` (optional): Region code (default: `us`)
- `market` (optional): Market type (default: `h2h`)
- `bookmaker` (optional): Preferred bookmaker name

**Response:**
```json
[
  {
    "id": "game_123",
    "teams": {
      "home": "Arsenal",
      "away": "Chelsea"
    },
    "start_at": "2025-10-24T14:00:00Z",
    "odds": {
      "home": 2.10,
      "draw": 3.10,
      "away": 3.40
    },
    "bookmaker": "FanDuel"
  }
]
```

### GET /widget/render

Iframe fallback route that renders widget UI as full HTML page.

**Query Parameters:**
- `sport-key` (required): Sport key
- `theme` (optional): `light` or `dark` (default: `light`)
- `bookmaker` (optional): Preferred bookmaker

## Widget Usage

### Web Component (Recommended)

```html
<script src="https://your-domain.com/widget.js"></script>
<soccer-odds 
  sport-key="soccer_epl" 
  theme="light"
  bookmaker="FanDuel"
  api-url="https://your-domain.com">
</soccer-odds>
```

### Attributes

- `sport-key` (required): Sport key (e.g., `soccer_epl`)
- `theme` (optional): `light` or `dark` (default: `light`)
- `bookmaker` (optional): Preferred bookmaker name
- `refresh-interval` (optional): Auto-refresh interval in seconds (default: 300)
- `api-url` (optional): API base URL (default: current origin)

### Iframe Fallback

```html
<iframe 
  src="https://your-domain.com/widget/render?sport-key=soccer_epl&theme=light"
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: none;">
</iframe>
```

## Project Structure

```
sports-odds-dashboard/
├── api/                    # Vercel serverless functions
│   ├── sports.ts          # GET /api/sports
│   ├── odds.ts            # GET /api/odds
│   └── widget-render.ts   # GET /widget/render
├── lib/                    # Shared utilities
│   ├── firebase.ts        # Firebase initialization
│   ├── cache.ts           # Firestore caching utilities
│   ├── odds-api.ts        # The Odds API client
│   ├── transform.ts       # Data transformation
│   └── cors.ts            # CORS helpers
├── widget/                 # Widget source
│   └── widget.ts          # Web Component class
├── src/                    # Dashboard (React app)
│   ├── components/        # React components
│   ├── App.tsx
│   └── main.tsx
├── public/                 # Static files
│   └── widget.js          # Compiled widget (generated)
├── firebase/
│   └── firestore.rules    # Firestore security rules
└── vercel.json            # Vercel configuration
```

## Caching Strategy

- **Cache Key**: `odds_{sport}_{region}_{market}`
- **TTL**: 600 seconds (10 minutes)
- **Fallback**: Serves stale cache if API is down
- **Storage**: Firebase Firestore collection `odds_cache`

## Security

- ✅ API keys stored in environment variables (never exposed)
- ✅ CORS configured for cross-origin requests
- ✅ Firestore rules restrict write access
- ✅ All API requests go through proxy server

## License

MIT
