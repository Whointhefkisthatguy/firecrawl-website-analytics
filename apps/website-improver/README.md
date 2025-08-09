# Website Improver

A Next.js application for analyzing and improving websites using AI-powered suggestions. This app integrates with the Firecrawl API to crawl and analyze websites, then provides actionable improvement recommendations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (v9+)
- Redis server
- Firecrawl API running on port 3002

### Step 1: Start Required Services

1. **Start Redis** (in terminal 1):
```bash
redis-server
```

2. **Start Firecrawl API Workers** (in terminal 2):
```bash
cd apps/api
pnpm install
pnpm run workers
```

3. **Start Firecrawl API Server** (in terminal 3):
```bash
cd apps/api
pnpm run start
```

### Step 2: Start Website Improver

4. **Use the startup script** (from root directory):
```bash
./start-dev.sh
```

Or manually:
```bash
cd apps/website-improver
cp .env.local.minimal .env.local
pnpm install
pnpm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Core Components

- **URL Input Component**: Validates and checks URL accessibility
- **Analysis Service**: Manages website analysis jobs using BullMQ
- **Firecrawl Integration**: Crawls websites and extracts content
- **AI Improvements**: Generates actionable improvement suggestions
- **Credit System**: Tracks usage and manages user limits

### API Endpoints

- `POST /api/v1/analyze` - Start website analysis
- `GET /api/v1/analyze/[jobId]` - Get analysis status
- `GET /api/v1/analyze/[jobId]/results` - Get analysis results
- `POST /api/v1/url/check-accessibility` - Check URL accessibility

### Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Queue**: BullMQ with Redis
- **Website Crawling**: Firecrawl API
- **AI**: OpenAI GPT models

## 🔧 Configuration

### Environment Variables

Create `.env.local` with these variables:

```bash
# Authentication (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (required)
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Firecrawl API (required)
FIRECRAWL_BASE_URL=http://localhost:3002
REDIS_URL=redis://localhost:6379

# Optional services
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
```

### Service Setup

1. **Clerk**: Sign up at [clerk.com](https://clerk.com) for authentication
2. **Supabase**: Create project at [supabase.com](https://supabase.com) for database
3. **Stripe**: Set up at [stripe.com](https://stripe.com) for payments (optional)

## 🧪 Testing

Run the test suite:
```bash
# All tests
pnpm test

# Specific test files
pnpm test -- url-validation.test.ts
pnpm test -- url-input-flow.test.tsx

# Watch mode
pnpm test:watch
```

### Test Coverage

- URL validation and security checks
- Component integration tests
- API endpoint testing
- Analysis service unit tests

## 📁 Project Structure

```
apps/website-improver/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── ui/            # UI components
│   │   └── url-input/     # URL input component
│   ├── lib/               # Utility libraries
│   │   ├── analysis-service.ts
│   │   ├── queue-service.ts
│   │   └── firecrawl-service.ts
│   ├── types/             # TypeScript types
│   └── __tests__/         # Test files
├── .env.example           # Environment template
└── package.json
```

## 🔄 Development Workflow

### Task Implementation

This app follows a spec-driven development approach. Current implementation includes:

- ✅ **Task 3.1**: URL input component with validation
- ✅ **Task 3.2**: Analysis job creation and management

### Key Features Implemented

1. **URL Validation**:
   - Auto-formatting (adds https://)
   - Security checks (blocks localhost/private IPs)
   - Accessibility verification
   - Real-time validation feedback

2. **Analysis Pipeline**:
   - Job queuing with BullMQ
   - Progress tracking
   - Credit system integration
   - Error handling and recovery

3. **User Experience**:
   - Loading states and progress indicators
   - Comprehensive error messages
   - Responsive design
   - Accessibility compliance

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR

## 📝 License

This project is part of the Firecrawl monorepo and follows the same licensing terms.