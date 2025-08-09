import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAnalysisJobStatus, getAnalysisJobResults } from '@/lib/analysis-service';

// GET /api/v1/analyze/[jobId] - Get analysis job status
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

    // Get job status
    const jobStatus = await getAnalysisJobStatus(jobId, userId);

    if (!jobStatus) {
      return NextResponse.json(
        {
          error: {
            code: 'JOB_NOT_FOUND',
            message: 'Analysis job not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jobId: jobStatus.id,
      status: jobStatus.status,
      progress: jobStatus.progress,
      url: jobStatus.url,
      createdAt: jobStatus.createdAt,
      updatedAt: jobStatus.updatedAt,
      completedAt: jobStatus.completedAt,
      error: jobStatus.error,
      estimatedCompletionTime: jobStatus.estimatedCompletionTime,
    });

  } catch (error) {
    console.error('Get analysis status error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get analysis status',
        },
      },
      { status: 500 }
    );
  }
}