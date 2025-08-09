// Clerk authentication utilities and configuration

import { auth, currentUser } from '@clerk/nextjs/server';
import { User } from '@/types/user';

/**
 * Get the current authenticated user from Clerk
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      plan: 'free', // Default plan for new users
      credits: 5, // Default free credits
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current user's ID from the authentication context
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { userId } = await auth();
    return !!userId;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Require authentication - throws error if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}

/**
 * Get user metadata from Clerk
 */
export async function getUserMetadata(userId: string) {
  try {
    const user = await currentUser();
    if (!user || user.id !== userId) return null;

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
    };
  } catch (error) {
    console.error('Error getting user metadata:', error);
    return null;
  }
}