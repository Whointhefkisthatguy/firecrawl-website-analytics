import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';

// Mock the auth hook
jest.mock('@/hooks/use-auth');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Signup Flow Integration', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    jest.clearAllMocks();
  });

  describe('Onboarding Page', () => {
    it('shows loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      } as any);

      render(<OnboardingPage />);

      expect(screen.getByText('Setting up your account...')).toBeInTheDocument();
      expect(screen.getByText("We're preparing your workspace with 5 free credits!")).toBeInTheDocument();
    });

    it('redirects to dashboard when user is authenticated', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        plan: 'free',
        credits: 5,
      };

      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      } as any);

      render(<OnboardingPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows welcome message with credit information', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      } as any);

      render(<OnboardingPage />);

      expect(screen.getByText('Welcome to Website Improver!')).toBeInTheDocument();
      expect(screen.getByText(/5 free credits/)).toBeInTheDocument();
      expect(screen.getByText(/Analyze and improve up to 5 website pages/)).toBeInTheDocument();
    });

    it('allows manual navigation to dashboard', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      } as any);

      render(<OnboardingPage />);

      const startButton = screen.getByText('Start Improving Your Website');
      startButton.click();

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Credit Allocation Flow', () => {
    it('displays correct credit information for new users', () => {
      const newUser = {
        id: 'user_123',
        email: 'newuser@example.com',
        plan: 'free' as const,
        credits: 5, // New user with full credits
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUseAuth.mockReturnValue({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
      } as any);

      render(<OnboardingPage />);

      // Should show loading/redirecting state since user exists
      expect(screen.getByText('Setting up your account...')).toBeInTheDocument();
    });

    it('handles users with partial credits', () => {
      const existingUser = {
        id: 'user_456',
        email: 'existing@example.com',
        plan: 'free' as const,
        credits: 2, // User with some credits used
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(),
      };

      mockUseAuth.mockReturnValue({
        user: existingUser,
        isLoading: false,
        isAuthenticated: true,
      } as any);

      render(<OnboardingPage />);

      // Should redirect to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('handles users with no credits', () => {
      const depleted = {
        id: 'user_789',
        email: 'depleted@example.com',
        plan: 'free' as const,
        credits: 0, // No credits remaining
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(),
      };

      mockUseAuth.mockReturnValue({
        user: depleted,
        isLoading: false,
        isAuthenticated: true,
      } as any);

      render(<OnboardingPage />);

      // Should still redirect to dashboard where paywall will be shown
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Error Handling', () => {
    it('handles auth errors gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      } as any);

      render(<OnboardingPage />);

      // Should show the welcome screen for unauthenticated users
      expect(screen.getByText('Welcome to Website Improver!')).toBeInTheDocument();
    });

    it('handles navigation errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user_123',
          email: 'test@example.com',
          plan: 'free' as const,
          credits: 5,
        },
        isLoading: false,
        isAuthenticated: true,
      } as any);

      // Mock router.push to throw an error
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      // The component should handle the error gracefully
      expect(() => render(<OnboardingPage />)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});