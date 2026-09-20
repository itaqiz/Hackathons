# EcoPulse

Environmental intelligence for community action. Built for the Earth Forward hackathon.

EcoPulse turns environmental indicators into a workflow: **Sense, Understand, Prioritize, Act, Measure**. It runs on a simulated dataset for a fictional district (Marlow Basin) and labels that everywhere.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

No database, API key, environment variable or login is needed. The optional live lookup calls Open-Meteo from the browser; everything else works offline.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel choose Add New, Project, and import the repository.
3. Keep the detected Next.js settings and select Deploy.

Or from the CLI: `npx vercel --prod`.

To show the GitHub link in the footer, set `REPO_URL` in `lib/config.ts`. It is empty by default so no link points nowhere.

## Structure

```
app/                  layout, page, global CSS, icon
components/
  layout/             Header, Hero, Challenge, Footer, JudgePanel, TransparencyDialog
  dashboard/          Dashboard, IndexCard, IndicatorCard, TransparencyPanel
  map/                MapExplorer, RegionSvg (SVG map), HotspotPanel
  action-planner/     ProblemExplorer, ActionPlanner, PlanModal
  impact-simulator/   ImpactSimulator
  community/          CommunityBoard and monitoring plans
  evidence/           Evidence and method
  charts/             Recharts wrappers and Sparkline
  ui/                 primitives, Dialog (native <dialog>)
  Providers.tsx       single client store (React context)
data/                 districts, indicators, hotspots, interventions, scenarios, actions
lib/                  types, scoring, series, scenario, plan, judge, scroll, config
```

## Architecture

- Next.js 14 App Router, TypeScript strict, Tailwind 3, Recharts, Lucide. Fonts are bundled through Fontsource, so the build needs no network access.
- Data lives in `data/` as typed TypeScript. Components never contain metric values. Replace the modules with API-backed loaders to use real data.
- One context store (`components/Providers.tsx`) holds period, map layer, selected hotspot and intervention, simulator levels, plans and community progress. Plans and progress persist in `localStorage` only.
- The map is a hand-built SVG with district polygons, a river, roads and hotspot markers. No tiles, no keys. Markers are keyboard-focusable buttons.
- Dialogs use the native `<dialog>` element for focus trapping and Escape handling.
- `lib/optimizer.ts` solves a multiple-choice knapsack exactly with dynamic programming: at most one intervention per hotspot, maximizing priority x benefit within an effort budget. It is compared against a priority-first baseline.
- Live regional mode: `fetchRegional` in `lib/live.ts` lays the demo map over a 50 km area around a real city, derives one latitude and longitude per district, and requests all six points in one Open-Meteo call per API. The Air quality and Heat layers then use real scores (`lib/liveScores.ts`), simulated hotspots are hidden on those layers, and the demo index is untouched. Open-Meteo grid cells are several kilometres wide, so nearby points can share similar values.
- `lib/live.ts` is the only network code: an optional Open-Meteo lookup (geocoding, air quality, temperature). It needs no key, fails gracefully offline, and never alters the demo district. The response shapes follow the Open-Meteo documentation and were tested with mocked responses only, so check it once against the live service.

## Demo dataset

Six fictional districts with populations and a 0-100 score per indicator (higher is healthier). Sixteen hotspots across six layers, each with a local score, affected population, trend, contributors and suggested interventions. Nineteen interventions with effort, benefit and timing ratings, and six community actions. City-level scores are population-weighted means of the district scores. Weekly series are generated deterministically from those end values. None of it is measured.

## Environmental Health Index

`index = 0.20 air + 0.20 water + 0.15 waste + 0.20 heat + 0.15 green + 0.10 biodiversity`

Bands: Good 75 and above, Moderate 60 to 74, Poor 45 to 59, Critical below 45. The weights are demonstration choices. It is a prioritization aid, not an official standard. The dashboard shows the contribution of every indicator.

Hotspot priority: `0.5 x severity + 0.3 x population exposed + 0.2 x trend`.

Scenario model: additive linear coefficients per lever (see `data/scenarios.ts`), capped at 100. It shows direction and relative size, and is labeled as a scenario, not a forecast.

## Three-minute demo script

Press Judge mode in the header. Each step scrolls to and sets up the right screen.

1. 0:00 Problem: communities have data but no path from data to action. EcoPulse closes the loop.
2. 0:20 Pulse: one transparent index from six indicators; the change chart shows what is getting worse.
3. 0:45 Map: heat layer; the Market Ward transit plaza ranks first.
4. 1:05 Hotspot detail: who is affected, contributors, monitoring status.
5. 1:30 Action Planner: compare interventions; tree canopy expansion has the highest benefit rating.
6. 1:55 Simulator: the intervention loads as a lever; move canopy to 18 percent and read the before and after.
7. 2:25 Create the plan: baseline, target, cadence.
8. 2:40 Board: the plan appears with its monitoring indicators. Close on the limitations in Data transparency.

## Future extensions with real data

Air: OpenAQ. Heat: Landsat thermal bands. Green cover: Sentinel-2 vegetation indices and ESA WorldCover. Water: WRI Aqueduct plus utility records. Biodiversity: GBIF and iNaturalist. Base map: OpenStreetMap with Leaflet. Also: extending the live lookup to a real district boundary, a normalization layer for real units, adjustable index weights, plans persisted in a database, and validated intervention effects from the literature. None of these are connected today.


## Verifying the live mode after deploy

1. Open the Pulse section, search a city, select `Map this region live`.
2. In the browser network tab, confirm the air-quality and forecast requests each carry six comma-separated coordinates and return an array of six objects.
3. Confirm the six markers on the Air quality and Heat layers show different values, and that the Waste layer shows the simulated-only notice.
4. Turn the network off and check that the error message appears and the rest of the app still works.
