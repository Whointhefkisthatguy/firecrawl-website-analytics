'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OnboardingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      // Minimal onboarding - redirect directly to URL entry (dashboard)
      setIsRedirecting(true);
      try {
        router.push('/dashboard');
      } catch (error) {
        console.error('Navigation error:', error);
        setIsRedirecting(false);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Setting up your account...
          </h2>
          <p className="text-gray-600">
            We're preparing your workspace with 5 free credits!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Welcome to Website Improver!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            You've been granted <span className="font-semibold text-blue-600">5 free credits</span> to get started.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              What you can do with your credits:
            </h3>
            <ul className="text-blue-800 space-y-2">
              <li>• Analyze and improve up to 5 website pages</li>
              <li>• Get AI-powered suggestions for SEO, UX, and performance</li>
              <li>• Use our guided editor to make improvements</li>
            </ul>
          </div>
          <button
            onClick={() => {
              try {
                router.push('/dashboard');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Start Improving Your Website
          </button>
        </div>
      </div>
    </div>
  );
}