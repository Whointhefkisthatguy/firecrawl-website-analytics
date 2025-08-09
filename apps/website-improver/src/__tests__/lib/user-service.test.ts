import { 
  createUser, 
  getUserById, 
  updateUserCredits, 
  deductUserCredits, 
  addUserCredits,
  updateUserPlan,
  hasUserCredits 
} from '@/lib/user-service';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { describe } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock Supabase
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockEq = jest.fn(() => ({ single: mockSingle, select: mockSelect }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockEq }));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockInsert,
      select: jest.fn(() => ({ eq: mockEq })),
      update: mockUpdate,
    })),
  },
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    it('creates a new user successfully', async () => {
      const userData = {
        id: 'user_123',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
        plan: 'free' as const,
        credits: 5,
      };

      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        plan: 'free',
        credits: 5,
        stripe_customer_id: null,
      };

      mockSingle.mockResolvedValue({
        data: mockDbUser,
        error: null,
      });

      const result = await createUser(userData);

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        plan: 'free',
        credits: 5,
        stripeCustomerId: null,
      });

      // Verify the mock was called correctly
      expect(mockInsert).toHaveBeenCalled();
    });

    it('throws error when creation fails', async () => {
      const userData = {
        id: 'user_123',
        email: 'test@example.com',
        createdAt: new Date(),
        plan: 'free' as const,
        credits: 5,
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(createUser(userData)).rejects.toThrow('Failed to create user: Database error');
    });
  });

  describe('getUserById', () => {
    it('returns user when found', async () => {
      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        plan: 'free',
        credits: 5,
        stripe_customer_id: 'cus_123',
      };

      mockSingle.mockResolvedValue({
        data: mockDbUser,
        error: null,
      });

      const result = await getUserById('user_123');

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        plan: 'free',
        credits: 5,
        stripeCustomerId: 'cus_123',
      });
    });

    it('returns null when user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      });

      const result = await getUserById('nonexistent');

      expect(result).toBeNull();
    });

    it('throws error for other database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection error', code: 'OTHER' },
      });

      await expect(getUserById('user_123')).rejects.toThrow('Failed to get user: Database connection error');
    });
  });

  describe('updateUserCredits', () => {
    it('updates user credits successfully', async () => {
      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T01:00:00.000Z',
        plan: 'free',
        credits: 3,
        stripe_customer_id: null,
      };

      mockSingle.mockResolvedValue({
        data: mockDbUser,
        error: null,
      });

      const result = await updateUserCredits('user_123', 3);

      expect(result.credits).toBe(3);
      expect(mockUpdate).toHaveBeenCalledWith({
        credits: 3,
        updated_at: expect.any(String),
      });
    });
  });

  describe('deductUserCredits', () => {
    it('deducts credits successfully', async () => {
      // Mock getUserById call
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          plan: 'free',
          credits: 5,
          stripe_customer_id: null,
        },
        error: null,
      });

      // Mock updateUserCredits call
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T01:00:00.000Z',
          plan: 'free',
          credits: 3,
          stripe_customer_id: null,
        },
        error: null,
      });

      const result = await deductUserCredits('user_123', 2);

      expect(result.credits).toBe(3);
    });

    it('throws error when insufficient credits', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'free',
          credits: 1,
          stripe_customer_id: null,
        },
        error: null,
      });

      await expect(deductUserCredits('user_123', 5)).rejects.toThrow('Insufficient credits');
    });

    it('throws error when user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(deductUserCredits('nonexistent', 1)).rejects.toThrow('User not found');
    });
  });

  describe('addUserCredits', () => {
    it('adds credits successfully', async () => {
      // Mock getUserById call
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          plan: 'free',
          credits: 5,
          stripe_customer_id: null,
        },
        error: null,
      });

      // Mock updateUserCredits call
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T01:00:00.000Z',
          plan: 'free',
          credits: 15,
          stripe_customer_id: null,
        },
        error: null,
      });

      const result = await addUserCredits('user_123', 10);

      expect(result.credits).toBe(15);
    });
  });

  describe('updateUserPlan', () => {
    it('updates user plan successfully', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'pro',
          credits: 5,
          stripe_customer_id: 'cus_123',
        },
        error: null,
      });

      const result = await updateUserPlan('user_123', 'pro', 'cus_123');

      expect(result.plan).toBe('pro');
      expect(result.stripeCustomerId).toBe('cus_123');
    });
  });

  describe('hasUserCredits', () => {
    it('returns true when user has sufficient credits', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'free',
          credits: 5,
          stripe_customer_id: null,
        },
        error: null,
      });

      const result = await hasUserCredits('user_123', 3);

      expect(result).toBe(true);
    });

    it('returns false when user has insufficient credits', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: 'free',
          credits: 2,
          stripe_customer_id: null,
        },
        error: null,
      });

      const result = await hasUserCredits('user_123', 5);

      expect(result).toBe(false);
    });

    it('returns false when user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await hasUserCredits('nonexistent', 1);

      expect(result).toBe(false);
    });
  });
});