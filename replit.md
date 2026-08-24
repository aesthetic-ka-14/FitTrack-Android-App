# FitTrack

An Android-first fitness companion that turns activity, workout, sleep, and recovery data into clear daily insights.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/fittrack/` — Expo mobile app and file-based routes
- `artifacts/fittrack/app/(tabs)/index.tsx` — dashboard
- `artifacts/fittrack/constants/colors.ts` — FitTrack color tokens
- `artifacts/fittrack/components/FitTrackUI.tsx` — shared mobile UI primitives
- `attached_assets/Pasted-You-are-a-senior-Android-architect-Kotlin-developer-UI-_1787584607689.txt` — product specification and phased roadmap

## Architecture decisions

- Phase 1 is frontend-only and uses explicitly labeled DEMO DATA; Health Connect is deferred until the basic app is confirmed working.
- The first build uses Expo Router with five primary sections: Home, Workout, Recovery, Progress, and Profile.
- FitTrack's palette uses midnight green, lime, and soft sage to make readiness and action states easy to scan.

## Product

Phase 1 provides a mobile dashboard with readiness, daily metrics, suggested training, recovery context, weekly progress, and account/settings entry points. Future phases will connect Health Connect and wearables.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Keep app-generated fitness estimates clearly distinguished from medical advice.
- Do not replace DEMO DATA with fabricated wearable readings; real health metrics must come from Health Connect or wearable APIs.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
