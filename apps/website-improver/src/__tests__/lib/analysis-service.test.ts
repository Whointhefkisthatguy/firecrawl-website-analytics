import { createAnalysisJob, getAnalysisJobStatus, updateAnalysisJobStatus } from '@/lib/analysis-service';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

jest.mock('@/lib/user-service', () => ({
  getUserCredits: jest.fn(),
  deductUserCredits: jest.fn(),
}));

jest.mock('@/lib/queue-service', () => ({
  addAnalysisJob: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

const mockSupabase = require('@/lib/supabase').supabase;
const mockGetUserCredits = require('@/lib/user-service').getUserCredits;
const mockDeductUserCredits = require('@/lib/user-service').deductUserCredits;
const mockAddAnalysisJob = require('@/lib/queue-service').addAnalysisJob;

describe('Analysis Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock chain
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn(),
        }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn(),
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn(),
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn(),
      }),
    });
  });

  describe('createAnalysisJob', () => {
    it('should create analysis job successfully', async () => {
      // Mock user has sufficient credits
      mockGetUserCredits.mockResolvedValue(5);

      // Mock successful database insertion
      const mockJobData = {
        id: 'mock-uuid-123',
        user_id: 'user_123',
        url: 'https://example.com',
        status: 'queued',
        progress: 0,
        options: { seoAnalysis: true },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        estimated_completion_time: '2024-01-01T00:01:00Z',
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockJobData,
        error: null,
      });

      // Mock successful credit deduction
      mockDeductUserCredits.mockResolvedValue(undefined);

      // Mock successful queue addition
      mockAddAnalysisJob.mockResolvedValue(undefined);

      // Execute
      const result = await createAnalysisJob({
        userId: 'user_123',
        url: 'https://example.com',
        options: { seoAnalysis: true },
      });

      // Assertions
      expect(result).toEqual({
        id: 'mock-uuid-123',
        status: 'queued',
        url: 'https://example.com',
        createdAt: expect.any(String),
        estimatedCompletionTime: expect.any(String),
      });

      expect(mockGetUserCredits).toHaveBeenCalledWith('user_123');
      expect(mockDeductUserCredits).toHaveBeenCalledWith('user_123', 1, 'website_analysis', 'mock-uuid-123');
      expect(mockAddAnalysisJob).toHaveBeenCalledWith({
        jobId: 'mock-uuid-123',
        userId: 'user_123',
        url: 'https://example.com',
        options: { seoAnalysis: true },
      });
    });

    it('should throw error when user has insufficient credits', async () => {
      mockGetUserCredits.mockResolvedValue(0);

      await expect(
        createAnalysisJob({
          userId: 'user_123',
          url: 'https://example.com',
          options: {},
        })
      ).rejects.toThrow('INSUFFICIENT_CREDITS');

      expect(mockDeductUserCredits).not.toHaveBeenCalled();
      expect(mockAddAnalysisJob).not.toHaveBeenCalled();
    });

    it('should rollback job creation if credit deduction fails', async () => {
      mockGetUserCredits.mockResolvedValue(5);

      const mockJobData = {
        id: 'mock-uuid-123',
        user_id: 'user_123',
        url: 'https://example.com',
        status: 'queued',
        progress: 0,
        options: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        estimated_completion_time: '2024-01-01T00:01:00Z',
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockJobData,
        error: null,
      });

      // Mock credit deduction failure
      mockDeductUserCredits.mockRejectedValue(new Error('Credit deduction failed'));

      // Mock delete for rollback
      const mockDelete = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: mockDelete,
        }),
      });

      await expect(
        createAnalysisJob({
          userId: 'user_123',
          url: 'https://example.com',
          options: {},
        })
      ).rejects.toThrow('Credit deduction failed');

      expect(mockDelete).toHaveBeenCalledWith('mock-uuid-123');
    });
  });

  describe('getAnalysisJobStatus', () => {
    it('should return job status successfully', async () => {
      const mockJobData = {
        id: 'job_123',
        status: 'processing',
        progress: 50,
        url: 'https://example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:30Z',
        completed_at: null,
        error: null,
        estimated_completion_time: '2024-01-01T00:01:00Z',
      };

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockJobData,
        error: null,
      });

      const result = await getAnalysisJobStatus('job_123', 'user_123');

      expect(result).toEqual({
        id: 'job_123',
        status: 'processing',
        progress: 50,
        url: 'https://example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:30Z',
        completedAt: null,
        error: null,
        estimatedCompletionTime: '2024-01-01T00:01:00Z',
      });
    });

    it('should return null for non-existent job', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await getAnalysisJobStatus('job_123', 'user_123');

      expect(result).toBeNull();
    });
  });

  describe('updateAnalysisJobStatus', () => {
    it('should update job status successfully', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from().update.mockReturnValue({
        eq: mockUpdate,
      });

      await updateAnalysisJobStatus('job_123', 'completed', {
        progress: 100,
        seoScore: 85,
        performanceScore: 75,
      });

      expect(mockUpdate).toHaveBeenCalledWith('id', 'job_123');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'completed',
        progress: 100,
        updated_at: expect.any(String),
        completed_at: expect.any(String),
        seo_score: 85,
        performance_score: 75,
      });
    });

    it('should throw error if update fails', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({
        error: { message: 'Update failed' },
      });
      mockSupabase.from().update.mockReturnValue({
        eq: mockUpdate,
      });

      await expect(
        updateAnalysisJobStatus('job_123', 'failed', { error: 'Test error' })
      ).rejects.toThrow('Failed to update analysis job status');
    });
  });
});