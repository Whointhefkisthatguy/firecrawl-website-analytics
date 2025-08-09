// User-related type definitions

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  plan: 'free' | 'pro';
  credits: number;
  stripeCustomerId?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  website?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  autoSaveDrafts: boolean;
  defaultDeploymentPlatform: 'vercel' | 'netlify' | 'render';
}