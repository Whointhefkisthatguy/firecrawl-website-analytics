'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider wrapper component
 * Configures Clerk with custom appearance and behavior
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 
            'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          card: 'shadow-lg border border-gray-200',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 
            'border border-gray-300 hover:bg-gray-50',
          socialButtonsBlockButtonText: 'text-gray-700',
          formFieldInput: 
            'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
        layout: {
          socialButtonsPlacement: 'bottom',
          socialButtonsVariant: 'blockButton',
        },
      }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
    >
      {children}
    </ClerkProvider>
  );
}