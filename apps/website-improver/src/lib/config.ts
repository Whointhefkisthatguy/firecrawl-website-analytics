// Configuration constants and environment variables

export const config = {
  // Clerk configuration
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET!,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/onboarding',
  },

  // Stripe configuration
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    proPlanPriceId: process.env.STRIPE_PRO_PLAN_PRICE_ID!,
    seoGuidePriceId: process.env.STRIPE_SEO_GUIDE_PRICE_ID!,
  },

  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Application configuration
  app: {
    name: 'Website Improver',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },

  // Credit system configuration
  credits: {
    freeUserAllocation: 5, // 5 edits or 2 page regenerations
    editCost: 1,
    regenerationCost: 2.5,
    analysisCost: 0.5,
    deploymentCost: 1,
  },

  // Firecrawl configuration
  firecrawl: {
    apiKey: process.env.FIRECRAWL_API_KEY || 'fc-placeholder',
    baseUrl: process.env.FIRECRAWL_BASE_URL || 'http://localhost:3002',
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  // Feature flags
  features: {
    enablePayments: process.env.ENABLE_PAYMENTS === 'true',
    enableDeployment: process.env.ENABLE_DEPLOYMENT === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableBetaFeatures: process.env.ENABLE_BETA_FEATURES === 'true',
  },
} as const;

// Validation function to ensure all required environment variables are set
export function validateConfig() {
  // Skip validation during build time
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || process.env[varName]?.includes('placeholder')
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing or placeholder environment variables: ${missingVars.join(', ')}`
    );
  }
}

export type Config = typeof config;