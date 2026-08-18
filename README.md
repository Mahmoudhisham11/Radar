# RADAR — AI Marketing Intelligence System

> **DATA → INTELLIGENCE → DECISION → ACTION**

RADAR is an AI-powered Marketing Intelligence and Growth Management system designed for a Cashier & POS software business. It continuously monitors the marketing and business environment, detects problems and opportunities with concrete data evidence, manages goals and pacing, and leverages AI to generate context-aware action plans.

---

## 🛠 Technology Stack Standards

| Layer | Standard | Constraint |
| :--- | :--- | :--- |
| **Language** | **JavaScript & JSX** (`.js`, `.jsx`) | **NO TypeScript** (`.ts`, `.tsx`) |
| **Styling** | **CSS Modules** (`*.module.css`) | **NO Tailwind CSS**, No utility CSS frameworks |
| **Design Tokens** | CSS Variables (`--radar-*`) in `app/globals.css` | Minimal global CSS |
| **Frontend** | Next.js 16 (App Router), React 19 | Modular components |
| **Database** | Firebase Firestore (Client & Server SDKs) | No direct DB queries in UI |
| **AI Provider** | OpenRouter (Claude 3.5 Sonnet / GPT-4o-mini) | Server-side abstraction layer |
| **Integration** | TikTok Developer Sandbox | Dedicated isolated module |

---

## 🏛 System Architecture

```text
RADAR Architecture Overview:

  ┌────────────────────────────────────────────────────────┐
  │                 RADAR UI (App Router)                  │
  │   Command Center • Intelligence • TikTok • Content     │
  │   Customers • Leads • Goals • Ask RADAR • Settings     │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │                 Presentation Components                │
  │   Layout (AppShell, Sidebar, Header)                   │
  │   UI (Button, Card, Badge, StatCard)                   │
  │   RADAR (InsightCard, AttentionBanner, GoalProgress)   │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │               Application & Services Layer             │
  │   HealthService • BusinessService • GoalService        │
  └─────────────┬────────────────────────────┬─────────────┘
                │                            │
  ┌─────────────▼──────────────┐ ┌───────────▼─────────────┐
  │      AI Service Layer      │ │   TikTok Integration    │
  │  OpenRouterAdapter         │ │   TikTokClient          │
  │  ContextBuilder            │ │   TikTokAuthService     │
  │  AITools & Schemas         │ │   TikTokSandboxApi      │
  │  AITools & Schemas         │ │   TikTokService         │
  └─────────────┬──────────────┘ │   TikTokTransformers    │
                │                └───────────┬─────────────┘
                │                            │
  ┌─────────────▼────────────────────────────▼─────────────┐
  │           Data Access & Repositories Layer             │
  │   BaseRepository • ConnectionRepository                │
  │   TikTokRepository • CustomerRepository                │
  │   LeadRepository • SalesRepository • GoalRepository    │
  │   InsightRepository • AttentionRepository              │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │                   Database & State                     │
  │   Firebase Firestore (Server Admin + Client Realtime)  │
  └────────────────────────────────────────────────────────┘
```

---

## 📱 Phase 1: TikTok Developer Sandbox Integration

### 1. Overview
Phase 1 establishes a robust, production-grade connection between RADAR and the **TikTok Developer Sandbox** via the official TikTok OAuth 2.0 protocol and TikTok APIs v2.

### 2. TikTok Sandbox Setup Instructions
1. Log in to [TikTok for Developers](https://developers.tiktok.com/).
2. Create an App under your developer account.
3. In App details, find your **Client Key** and **Client Secret**.
4. In **Sandbox Settings**, add your TikTok test account as a Sandbox User.
5. In **Redirect Domains / URIs**, register:
   ```text
   http://localhost:3000/api/integrations/tiktok/callback
   ```
6. Ensure the application is configured with the required permissions/scopes.

### 3. Required TikTok Environment Variables
Configure these in `.env.local` (server-side only, never prefixed with `NEXT_PUBLIC_`):
```bash
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/integrations/tiktok/callback
TIKTOK_SANDBOX_MODE=true
```

### 4. Required TikTok Scopes
- `user.info.basic`: OpenID, username, profile display info
- `user.info.profile`: Avatar URLs, bio description, verification status
- `user.info.stats`: Follower count, following count, likes count, video count
- `video.list`: Access to user's uploaded videos list and metadata
- `video.insights`: Access to video performance statistics

### 5. Official TikTok Endpoints (v2)
- **Authorization URL**: `https://www.tiktok.com/v2/auth/authorize/`
- **Token Endpoint**: `https://open.tiktokapis.com/v2/oauth/token/` (POST, `application/x-www-form-urlencoded`)
- **User Profile Endpoint**: `https://open.tiktokapis.com/v2/user/info/?fields=...` (GET with Bearer token)
- **Video List Endpoint**: `https://open.tiktokapis.com/v2/video/list/?fields=...` (POST with `{ max_count, cursor }`)

### 6. OAuth & Persistence Lifecycle
```text
User clicks [Connect TikTok]
       ↓
RADAR Server generates OAuth URL with CSRF state
       ↓
User authorizes app on TikTok Sandbox page
       ↓
TikTok redirects back to /api/integrations/tiktok/callback?code=...
       ↓
Server exchanges authorization code for access & refresh tokens
       ↓
Initial user profile fetched & tokens saved in Firestore (connections/tiktok)
       ↓
User redirected to /tiktok?status=connected
```

### 7. Persistent Connection Strategy
- Stored credentials are saved server-side in Firestore under `connections/tiktok`.
- React frontend never reads from localStorage or directly accesses raw tokens.
- Frontend queries `/api/integrations/tiktok/status` which returns sanitized state:
  ```json
  {
    "status": "connected",
    "username": "CashierPro Demo",
    "displayName": "CashierPro Demo",
    "avatarUrl": "https://...",
    "connectedAt": "2026-08-18T...",
    "lastUpdated": "2026-08-18T..."
  }
  ```
- Application restarts automatically reload connection status from Firestore.

### 8. Token Refresh Strategy
- Tokens include an `expiresAt` timestamp.
- When an API request is made within 5 minutes of expiration, `getValidAccessToken()` automatically triggers a refresh using the stored `refreshToken`.
- When manual refresh is requested, `/api/integrations/tiktok/refresh` calls the TikTok token endpoint with `grant_type=refresh_token`.
- If refresh fails (e.g. user revoked permission or token invalidated), status updates to `requires_reconnection` without crashing the application.

### 9. Disconnect & Reconnect
- **Disconnect**: Clicking `[ Disconnect ]` calls `/api/integrations/tiktok/disconnect`, clearing credentials from Firestore and setting status to `disconnected`.
- **Reconnect**: Clicking `[ Reconnect ]` prompts the user through the OAuth flow to generate a fresh token pair.

### 10. Sandbox-Specific Limitations
1. **Sandbox Test Users**: TikTok Sandbox only allows authenticating accounts explicitly added to the Developer App's Sandbox user list in the TikTok Developer Portal.
2. **Video Visibility**: Videos listed via `video.list` are limited to videos uploaded by the authenticated Sandbox user.
3. **Public Metrics**: Follower count, video count, and likes are only populated when available for that Sandbox user account.

### 11. Intentionally NOT Implemented in Phase 1
- Full background scheduled synchronization engine (Phase 2)
- Time-series metric snapshots (Phase 2)
- AI Marketing Assistant & Chat (Phase 7-9)
- Marketing Intelligence problem/opportunity engine (Phase 8)
- Facebook / Instagram integrations

---

## 📁 Directory Structure

```text
radar/
├── app/
│   ├── api/
│   │   ├── health/route.js                   # Diagnostic endpoint
│   │   └── integrations/tiktok/
│   │       ├── authorize/route.js            # Initiates OAuth flow
│   │       ├── callback/route.js             # OAuth redirect handler
│   │       ├── disconnect/route.js           # Revokes/clears connection
│   │       ├── profile/route.js              # Live profile endpoint
│   │       ├── refresh/route.js              # Token refresh endpoint
│   │       ├── status/route.js               # Sanitized status endpoint
│   │       └── videos/route.js               # Video catalog endpoint
│   ├── ask-radar/                            # AI assistant (Phase 9)
│   ├── attention/                            # Alert center (Phase 8)
│   ├── content/                              # Content intelligence (Phase 5)
│   ├── customers/                            # Customer roster (Phase 4)
│   ├── goals/                                # Goals & pacing (Phase 6)
│   ├── intelligence/                         # Problems & opportunities (Phase 8)
│   ├── leads/                                # Lead pipeline (Phase 4)
│   ├── settings/                             # Business memory & credentials
│   ├── tiktok/                               # TikTok connection & catalog page
│   ├── globals.css                           # CSS variables & base reset
│   ├── layout.js                             # Root layout with AppShell
│   └── page.js                               # Command Center dashboard
│
├── components/
│   ├── layout/                               # AppShell, Header, Sidebar
│   ├── ui/                                   # Button, Card, Badge, StatCard
│   └── radar/                                # InsightCard, AttentionBanner, GoalProgress, SystemHealth
│
├── integrations/
│   └── tiktok/                               # Dedicated TikTok Sandbox integration
│       ├── api/sandboxApi.js                 # Sandbox endpoints (profile, videos)
│       ├── auth/tiktokAuth.js                # OAuth 2.0 & token persistence/refresh
│       ├── client/tiktokClient.js            # Resilient HTTP client with backoff
│       ├── schemas/tiktokSchemas.js          # Scopes & endpoint constants
│       ├── services/tiktokService.js         # Unified domain service
│       └── transformers/tiktokTransformers.js# Normalization into RADAR models
│
├── lib/
│   ├── ai/                                   # OpenRouter AI provider
│   ├── firebase/                             # Firestore Admin & Client SDKs
│   ├── logger/                               # Structured logging with token redaction
│   ├── repositories/                         # Data access layer (Connection, TikTok, etc.)
│   └── services/                             # Business & health services
│
├── scripts/
│   └── test-phase1.mjs                       # Automated Phase 1 test suite
│
├── .env.example                              # Full environment variables reference
└── AGENTS.md                                 # Pinned architecture & technology rules
```

---

## 🧪 Testing

Run the automated test suite:
```bash
npm run test:tiktok
```

Run lint and build verification:
```bash
npm run lint
npm run build
```

---

## 🚀 Development Phases Roadmap

- [x] **Phase 0 — Foundation & Architecture**: Next.js App Router, CSS Modules design system, 10 core pages, repository pattern, logger, TikTok Sandbox skeleton, OpenRouter AI skeleton, health diagnostics.
- [x] **Phase 1 — TikTok Developer Sandbox Integration**: Complete Sandbox OAuth v2 flow, server-side callback route, persistent token storage in Firestore, automatic token refresh, sanitized status endpoint, full connection management UI.
- [ ] **Phase 2 — TikTok Data Engine**: Profile & video ingestion, normalization, historical time-series snapshots, synchronization engine.
- [ ] **Phase 3 — Realtime Synchronization**: Firestore listeners, zero-reload UI updates.
- [ ] **Phase 4 — Business Data**: Customer & lead pipeline management, sales tracking.
- [ ] **Phase 5 — Analytics & Performance Scoring**: Velocity, decay, hook analysis.
- [ ] **Phase 6 — Goal Engine**: Automated target pacing & forecasting.
- [ ] **Phase 7 — AI Foundation & Context**: OpenRouter dynamic prompt builder & tools.
- [ ] **Phase 8 — RADAR Intelligence**: Automated problem/opportunity detection with data evidence.
- [ ] **Phase 9 — Ask RADAR**: Conversational AI assistant with tool calling.
- [ ] **Phase 10 — Action Engine**: User-confirmed marketing automations.
