import { auth, currentUser } from '@clerk/nextjs/server';
import { 
  getCurrentUser, 
  getCurrentUserId, 
  isAuthenticated, 
  requireAuth,
  getUserMetadata 
} from '@/lib/clerk';

// Mock Clerk server functions
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCurrentUser = currentUser as jest.MockedFunction<typeof currentUser>;

describe('Clerk utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCurrentUser', () => {
    it('returns null when no user is authenticated', async () => {
      mockCurrentUser.mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('returns formatted user data when user exists', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        createdAt: 1640995200000,
        updatedAt: 1640995200000,
      };

      mockCurrentUser.mockResolvedValue(mockUser as any);

      const result = await getCurrentUser();

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        createdAt: new Date(1640995200000),
        updatedAt: new Date(1640995200000),
        plan: 'free',
        credits: 5,
      });
    });

    it('handles missing email gracefully', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [],
        createdAt: 1640995200000,
        updatedAt: 1640995200000,
      };

      mockCurrentUser.mockResolvedValue(mockUser as any);

      const result = await getCurrentUser();

      expect(result?.email).toBe('');
    });

    it('returns null and logs error when currentUser throws', async () => {
      const error = new Error('Auth error');
      mockCurrentUser.mockRejectedValue(error);

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting current user:', error);
    });
  });

  describe('getCurrentUserId', () => {
    it('returns user ID when authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      const result = await getCurrentUserId();

      expect(result).toBe('user_123');
    });

    it('returns null when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any);

      const result = await getCurrentUserId();

      expect(result).toBeNull();
    });

    it('returns null and logs error when auth throws', async () => {
      const error = new Error('Auth error');
      mockAuth.mockRejectedValue(error);

      const result = await getCurrentUserId();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting current user ID:', error);
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when user is authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('returns false when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });

    it('returns false and logs error when auth throws', async () => {
      const error = new Error('Auth error');
      mockAuth.mockRejectedValue(error);

      const result = await isAuthenticated();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error checking authentication:', error);
    });
  });

  describe('requireAuth', () => {
    it('returns user ID when authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      const result = await requireAuth();

      expect(result).toBe('user_123');
    });

    it('throws error when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any);

      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });
  });

  describe('getUserMetadata', () => {
    it('returns user metadata when user exists and IDs match', async () => {
      const mockUser = {
        id: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        publicMetadata: { plan: 'pro' },
        privateMetadata: { preferences: {} },
      };

      mockCurrentUser.mockResolvedValue(mockUser as any);

      const result = await getUserMetadata('user_123');

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        publicMetadata: { plan: 'pro' },
        privateMetadata: { preferences: {} },
      });
    });

    it('returns null when no user exists', async () => {
      mockCurrentUser.mockResolvedValue(null);

      const result = await getUserMetadata('user_123');

      expect(result).toBeNull();
    });

    it('returns null when user ID does not match', async () => {
      const mockUser = {
        id: 'user_456',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        publicMetadata: {},
        privateMetadata: {},
      };

      mockCurrentUser.mockResolvedValue(mockUser as any);

      const result = await getUserMetadata('user_123');

      expect(result).toBeNull();
    });

    it('returns null and logs error when currentUser throws', async () => {
      const error = new Error('Auth error');
      mockCurrentUser.mockRejectedValue(error);

      const result = await getUserMetadata('user_123');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting user metadata:', error);
    });
  });
});