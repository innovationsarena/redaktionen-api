# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Redaktionen API** is an AI-powered news aggregation and analysis system developed by Innovationsarenan @ Göteborgsregionen. It performs PESTEL (Political, Economic, Social, Technological, Environmental, Legal) analysis on RSS feeds using AI agents to summarize and visualize news content.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Build TypeScript
npm run build
```

## Architecture

### Agent-Based Pipeline

The system uses a three-stage agent pipeline:

1. **Tipsters** (`src/agents/tipsters/`) - Fetch and parse RSS feeds for each PESTEL factor
2. **Correspondents** (`src/agents/correspondents/`) - Fetch full HTML content and generate Swedish summaries using OpenAI
3. **Art Director** (`src/agents/art/`) - Generate image prompts, create poster images, and upload to Supabase storage

### Workflow System

Two main workflows orchestrate the agents:

- **PESTEL Workflow** (`src/workflows/pestel.workflow.ts`) - Runs all tipsters sequentially for each PESTEL factor, empties signals/summaries, then triggers correspondent workflow
- **Correspondent Workflow** (`src/workflows/correspondent.workflow.ts`) - Queues all signals for processing by correspondent agents

### Queue System (BullMQ + Redis)

All agent work is processed through BullMQ queues (`src/services/workers.ts`):

- `tipsterQueue` - Triggers PESTEL workflow
- `correspondentQueue` - Processes signals into summaries (concurrency: 10)
- `artDirectorQueue` - Generates and uploads poster images (concurrency: 10)

Each worker requires Redis connection configured via environment variables.

### Data Flow

RSS Items → **Tipsters** → Signals (Supabase) → **Correspondents** → Summaries (Supabase) → **Art Director** → Summaries with posterUrl

### Core Types

Key types in `src/core/types/types.ts`:

- **Signal** - Raw news item with title, summary, source, date, and PESTEL factor
- **Summary** - AI-generated Swedish article with title, body, posterUrl, and metadata
- **Factor** - PESTEL categories: "political" | "economic" | "social" | "technological" | "environmental" | "legal"

### Supabase Integration

The system uses Supabase for both database and storage (`src/services/supabase.ts`):

- **Tables**: signals, summaries (table names from env vars)
- **Storage**: `images` bucket for poster images
- **Service**: Uses service_role key for admin access (bypasses RLS)

### API (Fastify)

REST API serves at port 3000 (or `PORT` env var) with:

- `/` - Health check
- Workflow routes - Trigger PESTEL/correspondent workflows
- Signal routes - CRUD operations on signals

Security: CORS, Helmet, and form body parsing enabled.

## Environment Variables

Required variables in `.env`:

```bash
# Supabase
SUPABASE_URL=
SUPABASE_KEY=          # Use service_role key for RLS bypass
SIGNALS_TABLE=
SUMMARIES_TABLE=

# Redis (BullMQ)
REDIS_HOST=
REDIS_USERNAME=
REDIS_PASSWORD=

# OpenAI
CORRESPONDENT_DEFAULT_MODEL=  # e.g., "gpt-4o"
ARTDIRECTOR_DEFAULT_MODEL=    # e.g., "gpt-4o-mini"
DEFAULT_IMAGE_MODEL=          # e.g., "gpt-image-1-mini"

# Server
PORT=3000
```

## Working with Images

The Art Director agent (`src/agents/art/index.ts`) handles image generation:

1. Generates photorealistic poster prompts based on summary content
2. Creates images using OpenAI's image generation API
3. Converts base64 images to JPG with Sharp (resized to 1024px width, 60% quality)
4. Uploads to Supabase `images` bucket
5. Updates summary with public URL

**Important**: The `images` storage bucket must have RLS policies configured or disabled for uploads to succeed.

## PESTEL Factor Configuration

RSS feed sources for each PESTEL factor are configured in `src/agents/tipsters/index.ts`. Most sources are commented out; adjust the `limit` parameter in workflow calls to control how many items per source are processed.
