# RADAR — AI Marketing Intelligence System

> **DATA → INTELLIGENCE → DECISION → ACTION**

RADAR is a personal AI-powered Marketing Intelligence and Growth Management system designed for a Cashier & POS software business. It continuously monitors the marketing and business environment, detects problems and opportunities with concrete data evidence, manages goals and pacing, and leverages AI to generate context-aware action plans.

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
  └─────────────┬──────────────┘ │   TikTokSyncEngine      │
                │                │   TikTokTransformers    │
                │                └───────────┬─────────────┘
                │                            │
  ┌─────────────▼────────────────────────────▼─────────────┐
  │           Data Access & Repositories Layer             │
  │   BaseRepository • ConnectionRepository                │
  │   TikTokRepository • CustomerRepository                │
  │   LeadRepository • SalesRepository • GoalRepository    │
  │   InsightRepository • AttentionRepository • SyncRepo   │
  └───────────────────────────┬────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │                   Database & State                     │
  │   Firebase Firestore (Server Admin + Client Realtime)  │
  └────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```text
radar/
├── app/
│   ├── api/
│   │   └── health/route.js        # Subsystem diagnostic endpoint
│   ├── ask-radar/                 # Context-aware AI assistant
│   ├── attention/                 # High-priority alert center
│   ├── content/                   # Content intelligence & hook ranking
│   ├── customers/                 # Customer roster & lifetime metrics
│   ├── goals/                     # Goals & pacing engine
│   ├── intelligence/              # Problems, opportunities & evidence
│   ├── leads/                     # Lead pipeline & conversion tracking
│   ├── settings/                  # Business memory & credentials
│   ├── tiktok/                    # TikTok Sandbox catalog & sync status
│   ├── globals.css                # CSS variables & base reset
│   ├── layout.js                  # Root layout with AppShell
│   └── page.js                    # Command Center dashboard
│
├── components/
│   ├── layout/                    # AppShell, Header, Sidebar
│   ├── ui/                        # Button, Card, Badge, StatCard
│   └── radar/                     # InsightCard, AttentionBanner, GoalProgress, SystemHealth
│
├── integrations/
│   └── tiktok/                    # Isolated TikTok Developer Sandbox integration
│       ├── api/sandboxApi.js      # Sandbox endpoints (profile, videos)
│       ├── auth/tiktokAuth.js     # OAuth 2.0 & token persistence/refresh
│       ├── client/tiktokClient.js # Resilient HTTP client with backoff
│       ├── schemas/               # Scopes & endpoint constants
│       ├── sync/syncEngine.js     # Multi-step synchronization & snapshots
│       └── transformers/          # Normalize raw TikTok payloads to RADAR models
│
├── lib/
│   ├── ai/                        # OpenRouter adapter, context builder, tools & schemas
│   ├── firebase/                  # Client & Admin SDK init, collection constants
│   ├── logger/                    # Structured logging with token redaction
│   ├── repositories/              # Clean repository layer for Firestore
│   └── services/                  # Business & health services
│
├── .env.example                   # Full environment variables reference
└── AGENTS.md                      # Pinned architecture & technology rules
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Server-Only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# TikTok Sandbox (Server-Only)
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=http://localhost:3000/api/integrations/tiktok/callback
TIKTOK_SANDBOX_MODE=true

# OpenRouter AI (Server-Only)
OPENROUTER_API_KEY=
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
```

---

## 🚀 Development Phases Roadmap

- [x] **Phase 0 — Foundation & Architecture**: Next.js App Router, CSS Modules design system, 10 core pages, repository pattern, logger, TikTok Sandbox skeleton, OpenRouter AI skeleton, health diagnostics.
- [ ] **Phase 1 — TikTok Connection & Persistent Auth**: Complete Sandbox OAuth flow, callback route, persistent token storage, token auto-refresh.
- [ ] **Phase 2 — TikTok Data Engine**: Profile & video ingestion, normalization, historical time-series snapshots.
- [ ] **Phase 3 — Realtime Synchronization**: Firestore listeners, zero-reload UI updates.
- [ ] **Phase 4 — Business Data**: Customer & lead pipeline management, sales tracking.
- [ ] **Phase 5 — Analytics & Performance Scoring**: Velocity, decay, hook analysis.
- [ ] **Phase 6 — Goal Engine**: Automated target pacing & forecasting.
- [ ] **Phase 7 — AI Foundation & Context**: OpenRouter dynamic prompt builder & tools.
- [ ] **Phase 8 — RADAR Intelligence**: Automated problem/opportunity detection with data evidence.
- [ ] **Phase 9 — Ask RADAR**: Conversational AI assistant with tool calling.
- [ ] **Phase 10 — Action Engine**: User-confirmed marketing automations.
"# Radar" 
