
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# Comparison with `origin/main`

This document outlines the differences between the current working directory (the `clone` branch) and the remote `main` branch of the `empower-her-platform` repository.

## Overview of Changes

The changes generally revolve around updating the build tooling, integrating Firebase configurations, removing unused files/configs, and modifying existing components and services.

### 🌟 New Files Added
- `firebase-applet-config.json` - Firebase applet configuration.
- `firebase-blueprint.json` - Firebase blueprint architecture schema.
- `firestore.rules` - Security rules for Firestore database.
- `metadata.json` - General project metadata.

### 🗑️ Files Removed
- **CI/CD:** `.github/workflows/deploy.yml`
- **Package Manager:** `bun.lock`, `bun.lockb`
- **Public Assets:** `public/404.html`, `public/favicon.ico`, `public/placeholder.svg`, `public/robots.txt`
- **Pages:** `src/pages/EventDetail.tsx`
- **TypeScript & Testing Configs:** `tsconfig.app.json`, `tsconfig.node.json`, `vitest.config.ts`

### 🔄 Files Modified
**Configuration & Root Files:**
- `.env.example`, `.gitignore`, `README.md`
- `eslint.config.js`, `package.json`, `package-lock.json`
- `tailwind.config.ts`, `tsconfig.json`

**Application Code (`src/`):**
- **Core:** `App.tsx`, `index.css`
- **Context & State:** `contexts/AuthContext.tsx`, `stores/eventStore.ts`
- **Components:** 
  - `components/PastEvents.tsx`, `components/UpcomingEvents.tsx`, `components/ProtectedRoute.tsx`
  - Admin: `components/admin/EventFormDialog.tsx`
  - UI Library: `components/ui/calendar.tsx`, `components/ui/chart.tsx`, `components/ui/command.tsx`, `components/ui/textarea.tsx`
- **Pages:** `pages/AdminDashboard.tsx`, `pages/AdminLogin.tsx`
- **Services:** 
  - `services/firebase.ts`, `services/mock-blob-storage.ts`
  - Interfaces: `services/interfaces/database.ts`
  - Providers: `services/providers/firebase/config.ts`, `services/providers/firebase/database.ts`

**Assets:**
- Various event images updated (`event-digital.jpg`, `event-entrepreneur.jpg`, `event-finance.jpg`, `event-health.jpg`, `event-selfdefense.jpg`, `hero-women.jpg`).

---

