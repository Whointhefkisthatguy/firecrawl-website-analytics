# Coding Conventions

## Code Style

### TypeScript/JavaScript
- **Formatting**: Prettier with trailing commas enabled
- **Type Safety**: Strict null checks enabled in TypeScript
- **Module System**: NodeNext module resolution with ESM support
- **File Organization**: 
  - Controllers in `src/controllers/` (versioned: `v0/`, `v1/`)
  - Business logic in `src/lib/`
  - Services in `src/services/`
  - Types in `src/types/`

### Testing Patterns
- **Framework**: Jest with ts-jest preset
- **Test Location**: `__tests__/` directories alongside source code
- **Test Types**:
  - E2E tests: `e2e_withAuth/`, `e2e_noAuth/`, `e2e_full_withAuth/`
  - Integration tests: Queue concurrency, service integrations
  - Unit tests: Individual function/class testing
- **Test Commands**:
  - `pnpm test` - Full test suite (excludes no-auth tests)
  - `pnpm test:local-no-auth` - Tests without authentication
  - `pnpm test:prod` - Production-safe tests

## Error Handling

- Custom error classes in `src/lib/custom-error.ts`
- Consistent error responses across API versions
- Sentry integration for error monitoring
- Graceful degradation for external service failures

## API Design

### Versioning
- URL-based versioning: `/v0/`, `/v1/`
- Separate OpenAPI specifications per version
- Backward compatibility maintained across versions

### Response Formats
- Consistent JSON structure across endpoints
- LLM-ready data formats (markdown, structured data)
- Error responses follow standard format
- Rate limiting headers included

## Performance Patterns

### Caching
- Redis for rate limiting and job queues
- GCS for PDF caching
- Supabase for persistent data

### Queue Management
- BullMQ for job processing
- Priority-based job scheduling
- Concurrency limits per job type
- Worker process separation

## Security

### Authentication
- API key-based authentication
- Supabase integration for user management
- Rate limiting per API key
- Request validation with Zod schemas

### Data Handling
- Input sanitization for all user data
- URL validation before processing
- Robots.txt compliance checking
- Content-type validation

## Native Library Integration

### Rust Libraries
- Located in `sharedLibs/` directory
- Separate Cargo.toml for each library
- Called via Node.js FFI (koffi)
- Performance-critical operations (PDF parsing, HTML transformation)

### Go Libraries
- HTML to Markdown conversion
- Separate go.mod files
- Built as shared libraries

## Development Workflow

### Local Development
1. Start Redis server
2. Run workers: `pnpm run workers`
3. Start API server: `pnpm run start`

### Code Quality
- Prettier for formatting: `pnpm run format`
- TypeScript compilation: `pnpm run build`
- Comprehensive test coverage required
- Sentry sourcemap generation for production

### Environment Configuration
- `.env.example` files in each app directory
- Required: Redis URL, port configuration
- Optional: External service credentials
- Docker compose for service orchestration