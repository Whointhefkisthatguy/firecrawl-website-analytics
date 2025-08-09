'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

interface AnalysisStatusPageProps {
  params: {
    jobId: string;
  };
}

function AnalysisStatusContent({ params }: AnalysisStatusPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<string>('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await api.analysis.getStatus(params.jobId);
        
        if (response.error) {
          setError(response.error.message || 'Failed to get analysis status');
          return;
        }

        const jobStatus = response.status;
        setStatus(jobStatus);

        // Update progress based on status
        switch (jobStatus) {
          case 'waiting':
            setProgress(10);
            break;
          case 'active':
            setProgress(50);
            break;
          case 'completed':
            setProgress(100);
            // Get the results
            const resultsResponse = await api.analysis.getResults(params.jobId);
            if (resultsResponse) {
              setAnalysisData(resultsResponse);
            }
            clearInterval(interval);
            break;
          case 'failed':
            setError('Analysis failed. Please try again.');
            clearInterval(interval);
            break;
        }
      } catch (err) {
        console.error('Status check error:', err);
        setError('Failed to check analysis status');
        clearInterval(interval);
      }
    };

    // Check status immediately
    checkStatus();

    // Set up polling for status updates
    if (status !== 'completed' && status !== 'failed') {
      interval = setInterval(checkStatus, 3000); // Check every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params.jobId, status]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'completed' && analysisData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analysis Complete</h1>
                <p className="text-gray-600">Your website analysis is ready</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Analysis Results for: {analysisData.url}
                </h2>
                
                {/* Results will be displayed here */}
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      ✅ Analysis Completed Successfully
                    </h3>
                    <p className="text-green-800">
                      Your website has been analyzed. The detailed results and improvement suggestions 
                      will be available in the next version of the application.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      📊 Analysis Data
                    </h3>
                    <pre className="text-sm text-blue-800 bg-blue-100 p-3 rounded overflow-auto">
                      {JSON.stringify(analysisData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading/progress state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Analyzing Your Website
        </h2>
        
        <p className="text-gray-600 mb-4">
          {status === 'waiting' && 'Your analysis is queued and will start shortly...'}
          {status === 'active' && 'AI is analyzing your website for improvements...'}
          {status === 'loading' && 'Checking analysis status...'}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-500">
          This usually takes 30-60 seconds
        </p>
      </div>
    </div>
  );
}

export default function AnalysisStatusPage({ params }: AnalysisStatusPageProps) {
  return (
    <AuthGuard>
      <AnalysisStatusContent params={params} />
    </AuthGuard>
  );
}