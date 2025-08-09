'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Authentication guard component
 * Protects routes by redirecting unauthenticated users
 */
export function AuthGuard({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/sign-in'
}: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(redirectTo);
    }
  }, [isLoaded, isSignedIn, router, redirectTo]);

  if (!isLoaded) {
    return <>{fallback}</>;
  }

  if (!isSignedIn) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    redirectTo?: string;
  }
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard 
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}