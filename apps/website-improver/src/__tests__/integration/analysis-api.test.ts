import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/analyze/route';
import { GET } from '@/app/api/v1/analyze/[jobId]/route';
import { createAnalysisJob, getAnalysisJobStatus } from '@/lib/analysis-service';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/analysis-service', () => ({
  createAnalysisJob: jest.fn(),
  getAnalysisJobStatus: jest.fn(),
}));

const mockAuth = require('@clerk/nextjs/server').auth;
const mockCreateAnalysisJob = createAnalysisJob as jest.MockedFunction<typeof createAnalysisJob>;
const mockGetAnalysisJobStatus = getAnalysisJobStatus as jest.MockedFunction<typeof getAnalysisJobStatus>;

describe('Analysis API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/analyze', () => {
    it('should create analysis job successfully', async () => {
      // Mock authentication
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      // Mock job creation
      const mockJob = {
        id: 'job_123',
        status: 'queued' as const,
        url: 'https://example.com',
        createdAt: '2024-01-01T00:00:00Z',
        estimatedCompletionTime: '2024-01-01T00:01:00Z',
      };
      mockCreateAnalysisJob.mockResolvedValue(mockJob);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/v1/analyze', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://example.com',
          options: {
            includeScreenshots: true,
            seoAnalysis: true,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Execute request
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data).toEqual({
        jobId: 'job_123',
        status: 'queued',
        url: 'https://example.com',
        createdAt: '2024-01-01T00:00:00Z',
        estimatedCompletionTime: '2024-01-01T00:01:00Z',
      });

      expect(mockCreateAnalysisJob).toHaveBeenCalledWith({
        userId: 'user_123',
        url: 'https://example.com',
        options: {
          includeScreenshots: true,
          seoAnalysis: true,
        },
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Mock no authentication
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/v1/analyze', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://example.com',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid URL', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const request = new NextRequest('http://localhost:3000/api/v1/analyze', {
        method: 'POST',
        body: JSON.stringify({
          url: 'invalid-url',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 402 for insufficient credits', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockCreateAnalysisJob.mockRejectedValue(new Error('INSUFFICIENT_CREDITS'));

      const request = new NextRequest('http://localhost:3000/api/v1/analyze', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://example.com',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(402);
      expect(data.error.code).toBe('INSUFFICIENT_CREDITS');
    });
  });

  describe('GET /api/v1/analyze/[jobId]', () => {
    it('should return job status successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const mockJobStatus = {
        id: 'job_123',
        status: 'processing' as const,
        progress: 50,
        url: 'https://example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:30Z',
        completedAt: null,
        error: null,
        estimatedCompletionTime: '2024-01-01T00:01:00Z',
      };
      mockGetAnalysisJobStatus.mockResolvedValue(mockJobStatus);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/v1/analyze/job_123'),
        { params: Promise.resolve({ jobId: 'job_123' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        jobId: 'job_123',
        status: 'processing',
        progress: 50,
        url: 'https://example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:30Z',
        completedAt: null,
        error: null,
        estimatedCompletionTime: '2024-01-01T00:01:00Z',
      });

      expect(mockGetAnalysisJobStatus).toHaveBeenCalledWith('job_123', 'user_123');
    });

    it('should return 404 for non-existent job', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockGetAnalysisJobStatus.mockResolvedValue(null);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/v1/analyze/job_123'),
        { params: Promise.resolve({ jobId: 'job_123' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('JOB_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const response = await GET(
        new NextRequest('http://localhost:3000/api/v1/analyze/job_123'),
        { params: Promise.resolve({ jobId: 'job_123' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid job ID', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const response = await GET(
        new NextRequest('http://localhost:3000/api/v1/analyze/'),
        { params: Promise.resolve({ jobId: '' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_JOB_ID');
    });
  });
});