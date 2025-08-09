'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth, useUserProfile, useAuthActions } from '@/hooks/use-auth';
import { useState } from 'react';

function ProfileContent() {
  const { user } = useAuth();
  const profile = useUserProfile();
  const { signOut } = useAuthActions();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600">
                Manage your account and preferences
              </p>
            </div>
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Account Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Account Information
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {profile?.fullName || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plan
                    </label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user?.plan === 'pro' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user?.plan === 'pro' ? 'Pro' : 'Free'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Credits Remaining
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user?.credits || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan & Billing */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Plan & Billing
                </h2>
                {user?.plan === 'free' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Upgrade to Pro
                    </h3>
                    <p className="text-blue-800 mb-4">
                      Get unlimited website analysis, priority processing, and advanced features.
                    </p>
                    <ul className="text-blue-800 space-y-1 mb-4 text-sm">
                      <li>• Unlimited website analysis</li>
                      <li>• Priority processing</li>
                      <li>• Advanced AI suggestions</li>
                      <li>• One-click deployment</li>
                      <li>• Custom domain setup</li>
                    </ul>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                      Upgrade to Pro
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Pro Plan Active
                    </h3>
                    <p className="text-green-800 mb-4">
                      You have unlimited access to all features.
                    </p>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                      Manage Billing
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Account Actions
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Sign Out
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Sign out of your account on this device.
                    </p>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}