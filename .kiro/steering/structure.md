# Project Structure

## Monorepo Organization

Firecrawl uses a monorepo structure with apps and examples organized under top-level directories.

## Core Applications (`/apps`)

### API Service (`/apps/api`)
- **Main backend service** - Core Firecrawl API and scraping engine
- **Structure**:
  - `src/` - TypeScript source code
    - `controllers/` - API route handlers (v0, v1 versions)
    - `lib/` - Core business logic and utilities
    - `scraper/` - Web scraping implementations
    - `services/` - External service integrations (Redis, Supabase, etc.)
    - `search/` - Search engine integrations
    - `__tests__/` - Test suites (e2e, integration, unit)
  - `sharedLibs/` - Rust/Go native libraries
    - `crawler/` - Rust-based crawler
    - `html-transformer/` - Rust HTML processing
    - `pdf-parser/` - Rust PDF parsing
    - `go-html-to-md/` - Go HTML to Markdown converter

### SDKs
- **`/apps/js-sdk`** - JavaScript/TypeScript SDK (`@mendable/firecrawl-js`)
- **`/apps/python-sdk`** - Python SDK (`firecrawl-py`)
- **`/apps/rust-sdk`** - Rust SDK (`firecrawl` crate)

### Supporting Services
- **`/apps/playwright-service-ts`** - Browser automation microservice
- **`/apps/redis`** - Redis configuration and deployment
- **`/apps/ui/ingestion-ui`** - React-based UI components
- **`/apps/test-suite`** - End-to-end testing suite

## Examples (`/examples`)

Extensive collection of integration examples organized by:
- **AI Models**: GPT-4, Claude, Gemini, DeepSeek, Llama, etc.
- **Use Cases**: Company research, web crawling, data extraction
- **Frameworks**: LangChain, Crew.ai, OpenAI Swarm
- **Blog Articles**: Tutorial notebooks and guides
- **Infrastructure**: Kubernetes deployment examples

## Configuration Files

- **Root level**: `docker-compose.yaml`, licensing, documentation
- **Per-app**: Individual `package.json`, `Cargo.toml`, `pyproject.toml`
- **Environment**: `.env.example` files in each app directory

## Key Patterns

### API Versioning
- Controllers organized by version (`v0/`, `v1/`)
- Separate OpenAPI specs (`openapi.json`, `v1-openapi.json`)

### Testing Structure
- E2E tests with/without authentication
- Integration tests for queue concurrency
- Unit tests alongside source code

### Multi-Language Support
- Each SDK maintains its own build system and dependencies
- Consistent API interface across all SDKs
- Language-specific best practices (async/await, error handling)

### Shared Libraries
- Native code (Rust/Go) for performance-critical operations
- Called from Node.js main application
- Separate build processes for each native library