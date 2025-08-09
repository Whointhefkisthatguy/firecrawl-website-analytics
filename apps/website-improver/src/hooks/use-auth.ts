'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { User } from '@/types/user';
import { useMemo } from 'react';

/**
 * Custom authentication hook that extends Clerk's useAuth
 * Provides additional user data and authentication utilities
 */
export function useAuth() {
  const clerkAuth = useClerkAuth();
  const { user: clerkUser } = useUser();

  const user: User | null = useMemo(() => {
    if (!clerkUser) return null;

    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      createdAt: new Date(clerkUser.createdAt),
      updatedAt: new Date(clerkUser.updatedAt),
      plan: (clerkUser.publicMetadata?.plan as 'free' | 'pro') || 'free',
      credits: (clerkUser.publicMetadata?.credits as number) || 5,
      stripeCustomerId: clerkUser.publicMetadata?.stripeCustomerId as string,
    };
  }, [clerkUser]);

  return {
    ...clerkAuth,
    user,
    isAuthenticated: clerkAuth.isSignedIn,
    isLoading: !clerkAuth.isLoaded,
  };
}

/**
 * Hook for getting user profile information
 */
export function useUserProfile() {
  const { user: clerkUser } = useUser();

  const profile = useMemo(() => {
    if (!clerkUser) return null;

    return {
      id: clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      imageUrl: clerkUser.imageUrl,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      publicMetadata: clerkUser.publicMetadata,
      privateMetadata: clerkUser.privateMetadata,
    };
  }, [clerkUser]);

  return profile;
}

/**
 * Hook for authentication actions
 */
export function useAuthActions() {
  const { signOut } = useClerkAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    signOut: handleSignOut,
  };
}