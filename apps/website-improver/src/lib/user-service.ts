import { supabase } from './supabase';
import { User } from '@/types/user';

export interface CreateUserData {
  id: string;
  email: string;
  createdAt: Date;
  plan: 'free' | 'pro';
  credits: number;
  stripeCustomerId?: string;
}

/**
 * Create a new user record in the database
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userData.id,
      email: userData.email,
      created_at: userData.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
      plan: userData.plan,
      credits: userData.credits,
      stripe_customer_id: userData.stripeCustomerId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return {
    id: data.id,
    email: data.email,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    plan: data.plan,
    credits: data.credits,
    stripeCustomerId: data.stripe_customer_id,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // User not found
      return null;
    }
    console.error('Error getting user:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return {
    id: data.id,
    email: data.email,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    plan: data.plan,
    credits: data.credits,
    stripeCustomerId: data.stripe_customer_id,
  };
}

/**
 * Update user credits
 */
export async function updateUserCredits(
  userId: string, 
  credits: number
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      credits,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user credits:', error);
    throw new Error(`Failed to update user credits: ${error.message}`);
  }

  return {
    id: data.id,
    email: data.email,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    plan: data.plan,
    credits: data.credits,
    stripeCustomerId: data.stripe_customer_id,
  };
}

/**
 * Deduct credits from user account
 */
export async function deductUserCredits(
  userId: string, 
  amount: number,
  action?: string,
  referenceId?: string
): Promise<User> {
  // First get current credits
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.credits < amount) {
    throw new Error('Insufficient credits');
  }

  const newCredits = user.credits - amount;
  
  // TODO: Log credit transaction if action and referenceId are provided
  if (action && referenceId) {
    console.log(`Credit deduction: ${amount} credits for ${action} (${referenceId})`);
  }
  
  return updateUserCredits(userId, newCredits);
}

/**
 * Add credits to user account
 */
export async function addUserCredits(
  userId: string, 
  amount: number
): Promise<User> {
  // First get current credits
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const newCredits = user.credits + amount;
  return updateUserCredits(userId, newCredits);
}

/**
 * Update user plan
 */
export async function updateUserPlan(
  userId: string, 
  plan: 'free' | 'pro',
  stripeCustomerId?: string
): Promise<User> {
  const updateData: any = {
    plan,
    updated_at: new Date().toISOString(),
  };

  if (stripeCustomerId) {
    updateData.stripe_customer_id = stripeCustomerId;
  }

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user plan:', error);
    throw new Error(`Failed to update user plan: ${error.message}`);
  }

  return {
    id: data.id,
    email: data.email,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    plan: data.plan,
    credits: data.credits,
    stripeCustomerId: data.stripe_customer_id,
  };
}

/**
 * Get user credits
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  return user.credits;
}

/**
 * Check if user has sufficient credits
 */
export async function hasUserCredits(
  userId: string, 
  requiredAmount: number
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) {
    return false;
  }

  return user.credits >= requiredAmount;
}