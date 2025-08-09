import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAnalysisJobResults } from '@/lib/analysis-service';

// GET /api/v1/analyze/[jobId]/results - Get analysis results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const { jobId } = await params;

    // Validate jobId format
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_JOB_ID',
            message: 'Invalid job ID format',
          },
        },
        { status: 400 }
      );
    }

    // Get analysis results
    const results = await getAnalysisJobResults(jobId, userId);

    if (!results) {
      return NextResponse.json(
        {
          error: {
            code: 'RESULTS_NOT_FOUND',
            message: 'Analysis results not found or not yet available',
          },
        },
        { status: 404 }
      );
    }

    if (results.status !== 'completed') {
      return NextResponse.json(
        {
          error: {
            code: 'ANALYSIS_NOT_COMPLETE',
            message: `Analysis is ${results.status}. Results not yet available.`,
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      jobId: results.id,
      status: results.status,
      url: results.url,
      originalSite: results.originalSite,
      improvements: results.improvements,
      scores: {
        seo: results.seoScore,
        performance: results.performanceScore,
        accessibility: results.accessibilityScore,
        ux: results.uxScore,
      },
      metadata: {
        analysisTime: results.analysisTime,
        pagesAnalyzed: results.pagesAnalyzed,
        creditsUsed: results.creditsUsed,
      },
      createdAt: results.createdAt,
      completedAt: results.completedAt,
    });

  } catch (error) {
    console.error('Get analysis results error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get analysis results',
        },
      },
      { status: 500 }
    );
  }
}