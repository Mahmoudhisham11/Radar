<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# RADAR — Technology Stack Rules

## 1. JavaScript ONLY
- Use **JavaScript** and **JSX** only (`.js`, `.jsx`).
- **NO TypeScript** (`.ts`, `.tsx`). Convert any TypeScript examples/libraries to JS/JSX.

## 2. CSS Modules ONLY
- Use `*.module.css` for component and page-specific styles.
- **NO Tailwind CSS**, NO utility class frameworks, NO Tailwind classes.

## 3. Minimal Global CSS
- `app/globals.css` is restricted to CSS reset, base typography, and CSS variables design system.

## 4. Design System
- Maintain design tokens using CSS variables (`--radar-*`).

## 5. Component Styling & Architecture
- Import and use `styles.className` from `*.module.css`.
- Modular structure under `components/layout/`, `components/ui/`, `components/radar/`, etc.

## 6. Official RADAR Stack
- **Frontend**: Next.js, React, JavaScript, JSX, CSS Modules
- **Backend**: Next.js server actions / API routes
- **Database**: Firebase Firestore
- **AI**: OpenRouter
- **External Integration**: TikTok Developer Sandbox
- **No Technology Drift**: No Styled Components, Emotion, Bootstrap, MUI, Chakra, or Tailwind.
