'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAnalyzing(true);

    try {
      // Start analysis
      const response = await api.analysis.start({
        url: url.trim(),
        options: {
          includeScreenshots: true,
          mobileAnalysis: true,
          performanceAnalysis: true,
          seoAnalysis: true,
          accessibilityAnalysis: true,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to start analysis');
      }

      // Redirect to analysis status page
      router.push(`/analysis/${response.jobId}`);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
    } finally {
      setIsAnalyzing(false);
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
                Website Improver
              </h1>
              <p className="text-gray-600">
                AI-powered website analysis and improvement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.credits || 0} credits remaining
              </div>
              <div className="text-sm text-gray-600">
                Plan: <span className="font-medium capitalize">{user?.plan}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Enter your website URL
                </h2>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div>
                    <label htmlFor="url" className="sr-only">
                      Website URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      required
                      disabled={isAnalyzing}
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={!url || (user?.credits || 0) <= 0 || isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Starting Analysis...
                      </>
                    ) : (user?.credits || 0) <= 0 ? (
                      'No credits remaining'
                    ) : (
                      'Analyze Website (1 credit)'
                    )}
                  </button>
                </form>
                
                {(user?.credits || 0) <= 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      You've used all your free credits. 
                      <a href="#" className="font-medium underline ml-1">
                        Upgrade to Pro
                      </a> for unlimited analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome message for new users */}
            {user?.credits === 5 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Welcome to Website Improver! 🎉
                </h3>
                <p className="text-blue-800 mb-4">
                  You have 5 free credits to get started. Each credit allows you to:
                </p>
                <ul className="text-blue-800 space-y-1 mb-4">
                  <li>• Analyze a website page for SEO, UX, and performance issues</li>
                  <li>• Get AI-powered improvement suggestions</li>
                  <li>• Use our guided editor to make changes</li>
                </ul>
                <p className="text-blue-800 text-sm">
                  Ready to improve your website? Enter your URL above to begin!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}