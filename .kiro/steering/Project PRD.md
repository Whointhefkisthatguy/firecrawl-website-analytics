1. Product Flow (UX)
Step 1: Signup

Clerk handles auth (email/password, passkeys, or social logins other than Google).

No long onboarding form — just get the user in.

Step 2: URL Entry

One simple field: “Enter your website URL.”

Trigger backend analysis pipeline with Firecrawl (or your modified fork) to:

Crawl site

Analyze SEO, UX, performance, accessibility

Generate suggested improvements

Step 3: Guided Preview

Show them a side-by-side view:

Left: Their current site (live iframe snapshot)

Right: The “improved” AI-generated version.

Highlight changes with clickable markers (“We improved headline clarity,” “Fixed layout issues for mobile,” etc.).

Step 4: Agentic Walkthrough

Step-by-step guidance:

Change text, images, CTAs

Drag-and-drop layout adjustments using a WYSIWYG editor (Puck.js, GrapesJS, or a custom React + Tailwind builder)

Option to auto-apply best-practice SEO fixes

Step 5: Free Tier Limitation

They get X free credits (e.g., 5 edits or 2 page regenerations).

A visible credit counter encourages conversion.

On exhausting credits → paywall appears with:

Upgrade for unlimited edits

Add-on for SEO Deep Guide

Step 6: Deployment

One-click deploy to Vercel (or Netlify, Render, etc.)

Auto-configure custom domain for them (Namecheap, Cloudflare, Porkbun APIs)

Option to export code (Next.js / static HTML)

2. Pricing Model
Free Tier:

1 website

5 edits or 2 page regenerations

Preview only

Pro Plan (Subscription or One-time Unlock)

Unlimited edits & page regenerations

One-click deploy

Priority site analysis speed

SEO Guide discounted or included depending on tier

Add-ons

SEO Deep Guide ($29 one-time PDF/interactive plan)

Done-for-you deployment service

Monthly monitoring + AI re-optimization

3. Tech Stack
Frontend:

Next.js (App Router)

TailwindCSS + shadcn/ui for clean, modern UI

Puck.js (drag-and-drop editor) or GrapesJS integrated into a custom panel

Clerk for authentication

Stripe for credit tracking & billing

Backend:

Node.js/Express or tRPC API layer

Firecrawl service for site analysis

OpenAI/GPT-4o-mini for UX copy rewrite suggestions

Supabase/Postgres for storing user data, credit usage, and project states

Redis (optional) for caching site analysis results

Deployment:

Vercel for frontend + backend functions

Worker-based microservice for heavy crawling (Cloudflare Workers, Fly.io, Railway)

4. Build Order (MVP Path)
Phase 1 – Core Analysis

User auth with Clerk

URL input + Firecrawl integration

Store results in DB

Simple display of “Before” and “After” HTML

Phase 2 – Guided Editing

Integrate Puck.js for drag-and-drop

Mark-up based guided tour (react-joyride)

Save changes in draft mode

Phase 3 – Credits & Monetization

Stripe integration for paywalls

Credit counter middleware

Unlock flow after free limit

Phase 4 – Deployment

Vercel/Netlify API integration for 1-click publishing

Custom domain linking

5. Strategic Angle
If we build it this way, you’re essentially:

Competing with Wix/GoDaddy site builders but adding real AI-driven improvement + SEO scoring

Giving SMB owners the ability to keep their domain + autonomy instead of being stuck on a closed platform

Making it a guided and low-friction experience where they see the value before paying---
inclusion: always
---

# Firecrawl Development Guidelines

## Core Principles

- **Reliability First**: All scraping operations must handle failures gracefully with proper error handling and retries
- **LLM-Ready Output**: Default to markdown format optimized for AI consumption unless specifically requested otherwise
- **Performance Critical**: Use native libraries (Rust/Go) for CPU-intensive operations like PDF parsing and HTML transformation
- **API Consistency**: Maintain backward compatibility across versions and consistent response formats

## Development Workflow

### Required Setup
1. Redis server running locally or via Docker
2. Three terminal setup for development:
   - Terminal 1: `redis-server`
   - Terminal 2: `pnpm run workers` 
   - Terminal 3: `pnpm run start`

### Code Quality Standards
- All TypeScript code must pass strict null checks
- Use Prettier formatting with trailing commas
- Comprehensive test coverage required for new features
- Error handling must use custom error classes from `src/lib/custom-error.ts`

## Architecture Patterns

### API Design
- Version endpoints using `/v0/` and `/v1/` prefixes
- Separate OpenAPI specs per version (`openapi.json`, `v1-openapi.json`)
- Controllers in `src/controllers/v0/` and `src/controllers/v1/`
- Business logic in `src/lib/`, services in `src/services/`

### Queue Management
- Use BullMQ with Redis for all background processing
- Implement priority-based job scheduling
- Separate worker processes from API server
- Apply concurrency limits per job type

### Native Library Integration
- Rust libraries in `sharedLibs/` for performance-critical operations
- Use koffi for Node.js FFI bindings
- Separate build processes for each native library
- Go libraries for specific use cases like HTML-to-markdown conversion

## Testing Requirements

### Test Organization
- E2E tests in `__tests__/e2e_*` directories
- Integration tests for queue concurrency and service interactions
- Unit tests alongside source code
- Use descriptive test names indicating auth requirements

### Test Commands
- `pnpm test` - Full suite (excludes no-auth tests)
- `pnpm test:local-no-auth` - Tests without authentication
- `pnpm test:prod` - Production-safe tests only

## Security & Performance

### Authentication
- API key-based authentication with Supabase integration
- Rate limiting per API key using Redis
- Input validation with Zod schemas
- Robots.txt compliance checking

### Caching Strategy
- Redis for rate limiting and job queues
- GCS for PDF caching to avoid reprocessing
- Supabase for persistent logging and user data

## SDK Development

### Multi-Language Support
- Maintain consistent API interfaces across JavaScript, Python, and Rust SDKs
- Language-specific best practices (async/await patterns, error handling)
- Separate build systems per SDK with appropriate package managers

### Integration Patterns
- Support for LLM frameworks (LangChain, LlamaIndex, Crew.ai)
- Low-code platform integrations (Zapier, Dify, Langflow)
- Batch processing capabilities for high-volume use cases

## Common Pitfalls to Avoid

- Don't bypass queue system for long-running operations
- Don't ignore rate limiting in development - it affects production behavior
- Don't modify shared native libraries without considering all dependent services
- Don't skip error handling for external service calls (OpenAI, Supabase, etc.)
- Don't hardcode timeouts - use configurable values from environment variables