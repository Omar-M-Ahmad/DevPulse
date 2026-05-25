# DevPulse

> Engineering-focused GitHub repository health monitoring dashboard built with modern Next.js architecture.

DevPulse helps developers monitor repositories and instantly identify which projects are:

- 🟢 Active
- 🟡 Cooling
- 🔴 Stale

The goal is simple:

> Detect dead projects before they silently die.

---

## Overview

DevPulse is a developer-first dashboard designed for tracking repository activity, commit health, and project momentum across personal or team repositories.

Instead of showing GitHub data as generic analytics, DevPulse focuses on:

- repository vitality
- engineering activity
- cold project detection
- developer workflow visibility

The UI follows a terminal-inspired minimal design system focused on clarity, density, and engineering utility.

---

## Tech Stack

### Core

- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}
- :contentReference[oaicite:3]{index=3}
- :contentReference[oaicite:4]{index=4}
- :contentReference[oaicite:5]{index=5}

### Architecture

- App Router only
- Server Components by default
- Turbopack-first setup
- `src/` directory structure
- Modern proxy-based routing (`proxy.ts`)
- Monorepo-ready with pnpm workspace support

---

## Design Philosophy

DevPulse intentionally avoids:

- gradients
- glassmorphism
- excessive animations
- decorative UI noise

Instead, it focuses on:

- engineering readability
- dense information layout
- monochrome terminal aesthetics
- status-driven visual hierarchy

Green is treated as a semantic signal — not decoration.

---

## Features

### Repository Health Monitoring

Track repository lifecycle states:

| Status | Meaning |
|---|---|
| Active | Recently maintained |
| Cooling | Activity slowing down |
| Stale | Likely abandoned |

---

### Cold Project Alerts

Identify neglected repositories before they become maintenance debt.

Useful for:

- indie hackers
- SaaS founders
- freelancers
- engineering teams

---

### Engineering Dashboard UX

Purpose-built dashboard experience with:

- terminal-inspired layout
- compact data presentation
- activity-focused visualization
- mono typography system

---

## Project Structure

```txt
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── landing/
│   └── layout/
│
├── lib/
│   ├── db/
│   ├── github/
│   ├── auth.ts
│   └── utils.ts
│
├── hooks/
├── types/
└── proxy.ts
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/devpulse.git
cd devpulse
```

---

### 2. Install dependencies

```bash
pnpm install
```

---

### 3. Start development server

```bash
pnpm dev
```

Application runs on:

```txt
http://localhost:3000
```

---

## Available Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Production build
pnpm start     # Run production server
pnpm lint      # Run Biome checks
pnpm format    # Format project files
```

---

## Core Engineering Rules

### Next.js 16 Rules

- Use `proxy.ts` instead of `middleware.ts`
- App Router only
- Prefer Server Components
- Use `next/font`
- Use `next/image`
- Use `next/link` for internal navigation

---

## UI System Rules

- No shadows
- No gradients
- No glassmorphism
- Minimal animation usage
- CSS variables only
- RTL-safe layout architecture

---

## Status Colors

| Status | Color |
|---|---|
| Active | `#4ade80` |
| Cooling | `#fbbf24` |
| Stale | `#ef4444` |

---

## Learning Goals

This project is also structured as an advanced learning system for:

- scalable App Router architecture
- production-grade frontend systems
- design systems
- TypeScript strict patterns
- dashboard engineering
- GitHub API integration

---

## Future Roadmap

- GitHub OAuth
- Repository syncing
- Activity charts
- Commit analytics
- AI-generated repo insights
- Team dashboards
- Notification system
- Deployment monitoring

---

## Author

Built by :contentReference[oaicite:6]{index=6}

- Portfolio: :contentReference[oaicite:7]{index=7}
- LinkedIn: :contentReference[oaicite:8]{index=8}
- X/Twitter: :contentReference[oaicite:9]{index=9}

---

## License

MIT