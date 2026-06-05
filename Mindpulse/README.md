# MindPulse v2 — Daily Mental Wellness Tracker

**iTaqiZ · Pakistan | UN SDG 3: Good Health and Well-being**

A fast, privacy-first mental health check-in app. No database, no sign-up — data stays in the user's browser (localStorage).

---

## Stack

- **Next.js 14** (App Router) — production-grade React framework, Vercel-native
- **TypeScript** — fully typed throughout
- **CSS** (global, no Tailwind required) — custom design system

---

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel (3 steps)

### Option A — Vercel CLI (fastest)
```bash
npm i -g vercel
vercel          # follow prompts — it auto-detects Next.js
```

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the repo → Vercel auto-detects Next.js → click **Deploy**.

No environment variables needed. Zero config.

---

## Features

| Feature | Details |
|---|---|
| Mood check-in | Free-text + 1–10 slider |
| Quick emoji shortcuts | 6 one-tap mood starters |
| Keyword NLP | 60+ positive/negative keywords |
| Mood levels | Excellent / Good / Neutral / Low / Critical |
| Wellness tips | 4 contextual tips per mood level |
| Score meter | Visual positivity bar on result page |
| History log | Last 50 entries in localStorage |
| Stats dashboard | Count, avg rating, top mood, good days |
| Rating trend chart | Bar chart of last 10 check-ins |
| Mobile responsive | Works on all screen sizes |
| Crisis resources | Pakistan Umang helpline for Critical mood |

---

## Project structure

```
app/
  layout.tsx          Root layout (header + footer)
  page.tsx            Home — check-in form
  result/page.tsx     Result page
  history/page.tsx    History + stats + chart
  globals.css         Design system
  components/
    Header.tsx
    Footer.tsx
lib/
  analyzer.ts         Mood scoring engine
  recommender.ts      Wellness tip recommender
  storage.ts          localStorage helpers
```

---

*SDG 3 — Ensure healthy lives and promote well-being for all at all ages.*
