import { render, screen } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AuthGuard, withAuthGuard } from '@/components/auth/auth-guard';

// Mock Clerk's useAuth hook
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('AuthGuard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    jest.clearAllMocks();
  });

  it('shows loading fallback when auth is not loaded', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    } as any);

    render(
      <AuthGuard fallback={<div>Custom Loading...</div>}>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows default loading when auth is not loaded and no fallback provided', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to sign-in when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('redirects to custom route when specified', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    } as any);

    render(
      <AuthGuard redirectTo="/custom-login">
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/custom-login');
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('withAuthGuard HOC', () => {
  const TestComponent = ({ message }: { message: string }) => (
    <div>{message}</div>
  );

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    } as any);
    jest.clearAllMocks();
  });

  it('wraps component with AuthGuard', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    } as any);

    const GuardedComponent = withAuthGuard(TestComponent);

    render(<GuardedComponent message="Test Message" />);

    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('passes through custom options to AuthGuard', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    } as any);

    const GuardedComponent = withAuthGuard(TestComponent, {
      fallback: <div>Custom HOC Loading</div>,
    });

    render(<GuardedComponent message="Test Message" />);

    expect(screen.getByText('Custom HOC Loading')).toBeInTheDocument();
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
  });
});