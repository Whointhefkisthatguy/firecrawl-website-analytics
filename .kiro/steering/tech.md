# Technology Stack

## Core Backend (apps/api)

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with WebSocket support (express-ws)
- **Package Manager**: pnpm (version 9+)
- **Build System**: TypeScript compiler (tsc) with tsc-watch for development
- **Queue System**: BullMQ with Redis for job processing
- **Database**: Supabase (PostgreSQL) for authentication and logging
- **Cache/Queue**: Redis for rate limiting and job queues

## Key Dependencies

- **AI/LLM**: OpenAI SDK, Anthropic, Google AI, Groq, Cohere, Ollama
- **Web Scraping**: Playwright (via microservice), Cheerio, Puppeteer alternatives
- **Document Processing**: pdf-parse, mammoth (DOCX), turndown (HTML to Markdown)
- **Authentication**: Supabase client, custom API key system
- **Monitoring**: Sentry, PostHog, Winston logging
- **Rate Limiting**: rate-limiter-flexible, express-rate-limit

## Multi-Language SDKs

- **JavaScript/TypeScript**: `@mendable/firecrawl-js` (ESM/CJS, Node 22+)
- **Python**: `firecrawl-py` (Python 3.8+, async/sync support)
- **Rust**: `firecrawl` crate (Tokio async runtime)
- **Go**: Available but not in this monorepo

## Infrastructure

- **Containerization**: Docker with docker-compose for local development
- **Deployment**: Fly.io configuration, Kubernetes examples provided
- **Services**: 
  - API server (main application)
  - Worker processes (job processing)
  - Playwright service (browser automation)
  - Redis (caching and queues)

## Development Commands

```bash
# Install dependencies
pnpm install

# Development (requires 3 terminals)
redis-server                    # Terminal 1: Redis
pnpm run workers               # Terminal 2: Job workers  
pnpm run start                 # Terminal 3: API server

# Production
pnpm run start:production      # Build and start API
pnpm run worker:production     # Start workers

# Testing
pnpm run test                  # Full test suite
pnpm run test:local-no-auth    # Tests without auth
pnpm run test:prod             # Production tests

# Build
pnpm run build                 # TypeScript compilation
pnpm run format                # Prettier formatting

# Docker (alternative setup)
docker compose up              # Start all services
```

## Configuration

- Environment variables in `.env` files per app
- Required: Redis URL, port configuration
- Optional: Supabase, OpenAI, authentication, monitoring services
- Docker compose handles service orchestration