import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { urlAccessibilitySchema } from '@/lib/validations';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `url-check:${ip}`;
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

async function checkUrlAccessibility(url: string, timeout: number = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'HEAD', // Use HEAD to avoid downloading content
      signal: controller.signal,
      headers: {
        'User-Agent': 'Website-Improver-Bot/1.0 (+https://website-improver.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    const responseTime = Date.now() - startTime;
    clearTimeout(timeoutId);

    // Check if response is successful or redirected
    if (response.ok || (response.status >= 300 && response.status < 400)) {
      return {
        accessible: true,
        statusCode: response.status,
        responseTime,
        contentType: response.headers.get('content-type'),
        server: response.headers.get('server'),
      };
    }

    // Handle specific error cases
    let errorMessage = `HTTP ${response.status}`;
    switch (response.status) {
      case 403:
        errorMessage = 'Access forbidden - website blocks automated requests';
        break;
      case 404:
        errorMessage = 'Page not found';
        break;
      case 500:
        errorMessage = 'Server error - website may be temporarily unavailable';
        break;
      case 503:
        errorMessage = 'Service unavailable - website may be under maintenance';
        break;
      default:
        errorMessage = `HTTP ${response.status} - ${response.statusText}`;
    }

    return {
      accessible: false,
      statusCode: response.status,
      responseTime,
      error: errorMessage,
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          accessible: false,
          error: `Request timeout after ${timeout / 1000} seconds`,
        };
      }
      
      if (error.message.includes('ENOTFOUND')) {
        return {
          accessible: false,
          error: 'Domain not found - please check the URL',
        };
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        return {
          accessible: false,
          error: 'Connection refused - website may be down',
        };
      }
      
      if (error.message.includes('certificate')) {
        return {
          accessible: false,
          error: 'SSL certificate error - website may have security issues',
        };
      }
    }

    return {
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown network error',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = urlAccessibilitySchema.parse(body);

    // Check URL accessibility
    const result = await checkUrlAccessibility(validatedData.url, validatedData.timeout);

    return NextResponse.json(result);

  } catch (error) {
    console.error('URL accessibility check error:', error);

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

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check URL accessibility',
        },
      },
      { status: 500 }
    );
  }
}