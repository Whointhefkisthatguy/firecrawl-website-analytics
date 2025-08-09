import { renderHook } from '@testing-library/react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useAuth, useUserProfile, useAuthActions } from '@/hooks/use-auth';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}));

const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null user when no Clerk user exists', () => {
    mockUseClerkAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    } as any);

    mockUseUser.mockReturnValue({
      user: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns formatted user data when Clerk user exists', () => {
    const mockClerkUser = {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      createdAt: 1640995200000, // 2022-01-01
      updatedAt: 1640995200000,
      publicMetadata: {
        plan: 'pro',
        credits: 10,
        stripeCustomerId: 'cus_123',
      },
    };

    mockUseClerkAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    } as any);

    mockUseUser.mockReturnValue({
      user: mockClerkUser,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: 'user_123',
      email: 'test@example.com',
      createdAt: new Date(1640995200000),
      updatedAt: new Date(1640995200000),
      plan: 'pro',
      credits: 10,
      stripeCustomerId: 'cus_123',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('uses default values when metadata is missing', () => {
    const mockClerkUser = {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      createdAt: 1640995200000,
      updatedAt: 1640995200000,
      publicMetadata: {},
    };

    mockUseClerkAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    } as any);

    mockUseUser.mockReturnValue({
      user: mockClerkUser,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.plan).toBe('free');
    expect(result.current.user?.credits).toBe(5);
    expect(result.current.user?.stripeCustomerId).toBeUndefined();
  });
});

describe('useUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no user exists', () => {
    mockUseUser.mockReturnValue({
      user: null,
    } as any);

    const { result } = renderHook(() => useUserProfile());

    expect(result.current).toBeNull();
  });

  it('returns formatted profile data', () => {
    const mockClerkUser = {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      publicMetadata: { plan: 'pro' },
      privateMetadata: { preferences: {} },
    };

    mockUseUser.mockReturnValue({
      user: mockClerkUser,
    } as any);

    const { result } = renderHook(() => useUserProfile());

    expect(result.current).toEqual({
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      email: 'john@example.com',
      publicMetadata: { plan: 'pro' },
      privateMetadata: { preferences: {} },
    });
  });

  it('handles missing name fields gracefully', () => {
    const mockClerkUser = {
      id: 'user_123',
      firstName: null,
      lastName: null,
      imageUrl: 'https://example.com/avatar.jpg',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      publicMetadata: {},
      privateMetadata: {},
    };

    mockUseUser.mockReturnValue({
      user: mockClerkUser,
    } as any);

    const { result } = renderHook(() => useUserProfile());

    expect(result.current?.fullName).toBe('');
  });
});

describe('useAuthActions', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    mockUseClerkAuth.mockReturnValue({
      signOut: mockSignOut,
    } as any);
    jest.clearAllMocks();
  });

  it('provides signOut function', () => {
    const { result } = renderHook(() => useAuthActions());

    expect(typeof result.current.signOut).toBe('function');
  });

  it('calls Clerk signOut when signOut is called', async () => {
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthActions());

    await result.current.signOut();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('handles signOut errors', async () => {
    const error = new Error('Sign out failed');
    mockSignOut.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAuthActions());

    await expect(result.current.signOut()).rejects.toThrow('Sign out failed');
    expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', error);

    consoleSpy.mockRestore();
  });
});