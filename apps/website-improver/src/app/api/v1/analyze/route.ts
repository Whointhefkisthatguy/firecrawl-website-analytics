import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { analysisRequestSchema } from '@/lib/validations';
import { createAnalysisJob, getAnalysisJobStatus } from '@/lib/analysis-service';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 analysis requests per minute

function getRateLimitKey(userId: string): string {
  return `analysis:${userId}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  limit.count++;
  return true;
}

// POST /api/v1/analyze - Start website analysis
export async function POST(request: NextRequest) {
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

    // Rate limiting
    const rateLimitKey = getRateLimitKey(userId);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many analysis requests. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = analysisRequestSchema.parse(body);

    // Create analysis job
    const job = await createAnalysisJob({
      userId,
      url: validatedData.url,
      options: validatedData.options || {},
    });

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      url: job.url,
      createdAt: job.createdAt,
      estimatedCompletionTime: job.estimatedCompletionTime,
    });

  } catch (error) {
    console.error('Analysis creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('INSUFFICIENT_CREDITS')) {
      return NextResponse.json(
        {
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: 'Insufficient credits to perform analysis',
          },
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create analysis job',
        },
      },
      { status: 500 }
    );
  }
}