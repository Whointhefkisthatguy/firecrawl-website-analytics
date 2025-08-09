// Supabase client configuration and utilities

import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Create Supabase client for client-side operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Create Supabase client for server-side operations (with service role key)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

/**
 * Database table names
 */
export const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects',
  ANALYSES: 'analyses',
  CREDIT_TRANSACTIONS: 'credit_transactions',
  DEPLOYMENTS: 'deployments',
} as const;

/**
 * Get user data from Supabase
 */
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

/**
 * Create or update user in Supabase
 */
export async function upsertUser(userData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .upsert(userData)
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    throw error;
  }

  return data;
}