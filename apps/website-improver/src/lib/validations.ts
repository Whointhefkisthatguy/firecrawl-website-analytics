// Zod validation schemas for API requests and data models

import { z } from 'zod';

// URL validation schema with enhanced validation
export const urlSchema = z.string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'URL must use HTTP or HTTPS protocol')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Block localhost and private IP ranges for security
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, 'Cannot analyze local or private network URLs');

// URL accessibility check schema
export const urlAccessibilitySchema = z.object({
  url: urlSchema,
  timeout: z.number().min(1000).max(30000).default(10000),
});

// Analysis request schema
export const analysisRequestSchema = z.object({
    url: urlSchema,
    options: z.object({
        includeScreenshots: z.boolean().default(true),
        mobileAnalysis: z.boolean().default(true),
        performanceAnalysis: z.boolean().default(true),
        seoAnalysis: z.boolean().default(true),
        accessibilityAnalysis: z.boolean().default(true),
    }).optional(),
});

// Project creation schema
export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
    url: urlSchema,
    analysisId: z.string().uuid('Invalid analysis ID'),
});

// Project update schema
export const updateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    status: z.enum(['analyzing', 'ready', 'editing', 'deployed']).optional(),
    draftChanges: z.array(z.any()).optional(),
});

// Credit deduction schema
export const deductCreditsSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    action: z.string().min(1, 'Action is required'),
    projectId: z.string().uuid().optional(),
});

// Deployment request schema
export const deployRequestSchema = z.object({
    projectId: z.string().uuid('Invalid project ID'),
    platform: z.enum(['vercel', 'netlify', 'render']),
    customDomain: z.string().optional(),
    environmentVariables: z.record(z.string(), z.string()).optional(),
});

// Domain configuration schema
export const domainConfigSchema = z.object({
    deploymentId: z.string().uuid('Invalid deployment ID'),
    domain: z.string().min(1, 'Domain is required'),
    provider: z.enum(['namecheap', 'cloudflare', 'porkbun']),
});

// User preferences schema
export const userPreferencesSchema = z.object({
    emailNotifications: z.boolean().default(true),
    autoSaveDrafts: z.boolean().default(true),
    defaultDeploymentPlatform: z.enum(['vercel', 'netlify', 'render']).default('vercel'),
});

// Export types from schemas
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;
export type DeductCreditsRequest = z.infer<typeof deductCreditsSchema>;
export type DeployRequest = z.infer<typeof deployRequestSchema>;
export type DomainConfigRequest = z.infer<typeof domainConfigSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;