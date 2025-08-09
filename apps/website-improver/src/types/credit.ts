// Credit system type definitions

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'deduction' | 'purchase' | 'refund' | 'bonus';
  amount: number;
  action: CreditAction;
  projectId?: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export type CreditAction = 
  | 'website_analysis'
  | 'page_edit'
  | 'page_regeneration'
  | 'deployment'
  | 'seo_analysis'
  | 'performance_analysis'
  | 'accessibility_analysis'
  | 'ai_suggestion'
  | 'template_application'
  | 'custom_domain'
  | 'priority_processing';

export interface CreditPlan {
  id: string;
  name: string;
  type: 'free' | 'pro' | 'enterprise';
  credits: number;
  price: number; // in cents
  currency: 'usd';
  features: string[];
  limitations: CreditLimitations;
  stripePriceId?: string;
}

export interface CreditLimitations {
  maxProjectsPerMonth: number;
  maxAnalysesPerDay: number;
  maxEditsPerProject: number;
  priorityProcessing: boolean;
  customDomains: boolean;
  advancedAnalytics: boolean;
}

export interface CreditBalance {
  userId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  plan: CreditPlan['type'];
  resetDate?: Date; // For subscription plans
  lastUpdated: Date;
}

export interface CreditUsageStats {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  totalUsed: number;
  breakdown: Record<CreditAction, number>;
  averagePerDay: number;
  projectedMonthlyUsage: number;
}

export interface CreditAlert {
  id: string;
  userId: string;
  type: 'low_balance' | 'usage_spike' | 'plan_upgrade_suggested';
  threshold: number;
  currentValue: number;
  message: string;
  actionRequired: boolean;
  dismissed: boolean;
  createdAt: Date;
}

export interface CreditCost {
  action: CreditAction;
  baseCost: number;
  planMultiplier: Record<CreditPlan['type'], number>;
  description: string;
  category: 'analysis' | 'editing' | 'deployment' | 'premium';
}