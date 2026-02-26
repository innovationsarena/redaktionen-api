# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Redaktionen is an AI-powered news aggregation and PESTEL analysis API built by Göteborgsregionens innovationsarena. It processes RSS feeds through a pipeline of AI agents: Tipster (identifies signals) → Correspondent (summarizes) → Editor (synthesizes reports) → Art Director (generates images).

## Commands

```bash
npm run dev          # Start dev server with nodemon (auto-reload)
npm run build        # Compile TypeScript → dist/
npm test             # Run all tests (vitest run)
npm run test:watch   # Run tests in watch mode
```

## Architecture

**Runtime:** Node.js 22+ · **Framework:** Fastify 5 · **Language:** TypeScript (strict, CommonJS, ES2020) · **Database:** Supabase (PostgreSQL) · **Queue:** BullMQ + Redis · **LLM:** OpenAI via `ai` SDK · **Validation:** Zod · **Tests:** Vitest

### Request Flow

```
HTTP → Fastify Routes → preValidation Middleware (auth + body validation) → Controllers → Operations → Agents/DB/Queue
```

### Service Pattern (agent/operations/worker)

Each service in `src/services/` follows a three-file pattern:

| File | Role |
|------|------|
| `*.agent.ts` | LLM calls via `ai` SDK — takes data in, returns structured AI output |
| `*.operations.ts` | Business logic — orchestrates DB queries, data transforms, queue jobs |
| `*.worker.ts` | BullMQ worker — listens for queue jobs, dispatches to agent/operations |

Services: `tipster`, `correspondent`, `editor`, `artdirector`, `agent`

### Processing Pipeline

1. **Tipster** — parses RSS sources, identifies relevant signals per PESTEL factor
2. **Correspondent** — fetches article content, generates LLM summaries for each signal
3. **Editor** — synthesizes summaries into integrated (all factors) or isolated (per factor) reports
4. **Art Director** — generates poster images for summaries/reports

Workers chain to each other: correspondent worker triggers `checkAndTriggerEditor` after each summary.

### Multi-tenancy

Requests carry an `AgencyContext` (`{ id, name }`) attached by `validateAgencyKey` middleware. Agency scoping flows through operations, queue jobs, and DB queries. The `FastifyRequest` type is augmented with an optional `agency` field.

### Key Directories

- `src/core/types/` — all Zod schemas and inferred TypeScript types (single `index.ts`)
- `src/core/middleware/` — auth middleware (`validateKey`, `validateApiKey`, `validateAgencyKey`, `validateWebhook`) and `validateBody` factory for Zod schema validation
- `src/core/services/supabase/` — DB operations per entity (`Agencies`, `Signals`, `Summaries`, `Sources`, `Agents`, `Reports`)
- `src/core/services/bullmq/` — Redis connection config and concurrency setting (10)
- `src/core/utils/` — `AppError` class, `asyncHandler` wrapper, crypto/id/date/feed helpers
- `src/controllers/` — HTTP handlers (all use `asyncHandler`)
- `src/routes/` — Fastify route definitions with middleware hooks
- `src/docs/apispec.yml` — OpenAPI spec served at `/` via Swagger UI

### Domain Types

PESTEL factors: `political | economic | social | technological | environmental | legal`

Foresight perspectives: `utopia | dystopia | reform | system | speculative | historic`

Agent types: `tipster | correspondent | artdirector | analysts | editor | foresighter`

Core entities: `Agency`, `Agent`, `Signal`, `Source`, `Summary`, `Report` — all defined as Zod schemas in `src/core/types/index.ts` with inferred TS types.

### Queue Jobs

| Queue | Jobs |
|-------|------|
| `tipsterQueue` | `tipster.start` |
| `correspondentQueue` | `correspondent.start`, `correspondent.summary` |
| `editorQueue` | `editor.summary.integrated`, `editor.summary.isolated` |
| `artDirectorQueue` | `artdirector.generate` |
| `agentQueue` | `agent.createDefault` |

### Testing

Tests live in `src/test/` (excluded from build). Vitest config injects test env vars including a local Supabase URL (`localhost:54321`). Test structure mirrors source: `test/utils/` for utilities, `test/controllers/` for endpoint tests.

## Conventions

- Files: `kebab-case.purpose.ts` (e.g., `correspondent.worker.ts`)
- Types/Schemas: PascalCase, Zod schema suffixed with `Schema` (e.g., `SignalSchema` → `Signal`)
- Queue names: UPPER_SNAKE_CASE constants (e.g., `CORRESPONDENT_QUEUE_NAME`)
- All controllers wrapped with `asyncHandler`; errors thrown as `AppError(message, statusCode)`
- Auth via `Authorization: Bearer <key>` header; webhooks via `?key=` query param
- DB table names configured via env vars (`AGENCIES_TABLE`, `SIGNALS_TABLE`, etc.)
