import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UrlInput } from '@/components/url-input/url-input';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('UrlInput Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should render URL input field', () => {
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your website url/i)).toBeInTheDocument();
  });

  it('should auto-format URL with https prefix', async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'example.com');
    
    expect(input).toHaveValue('https://example.com');
  });

  it('should show validation errors for invalid URLs', async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'invalid-url');
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it('should show check button for valid URLs', async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');
    
    await waitFor(() => {
      expect(screen.getByText(/check url/i)).toBeInTheDocument();
    });
  });

  it('should perform accessibility check when check button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessible: true,
        statusCode: 200,
        responseTime: 500,
      }),
    } as Response);

    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');
    
    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);
    
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/url/check-accessibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });
  });

  it('should show success message for accessible URLs', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessible: true,
        statusCode: 200,
        responseTime: 500,
      }),
    } as Response);

    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');
    
    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);
    
    await waitFor(() => {
      expect(screen.getByText(/website is accessible and ready for analysis/i)).toBeInTheDocument();
    });
  });

  it('should show error message for inaccessible URLs', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessible: false,
        error: 'Connection refused',
      }),
    } as Response);

    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');
    
    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);
    
    await waitFor(() => {
      expect(screen.getByText(/connection refused/i)).toBeInTheDocument();
    });
  });

  it('should show analyze button after successful accessibility check', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessible: true,
        statusCode: 200,
        responseTime: 500,
      }),
    } as Response);

    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');
    
    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);
    
    await waitFor(() => {
      expect(screen.getByText(/analyze website/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit when analyze button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessible: true,
        statusCode: 200,
        responseTime: 500,
      }),
    } as Response);

    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');
    
    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);
    
    const analyzeButton = await screen.findByText(/analyze website/i);
    await user.click(analyzeButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<UrlInput onSubmit={mockOnSubmit} disabled={true} />);
    
    const input = screen.getByLabelText(/website url/i);
    expect(input).toBeDisabled();
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UrlInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');
    
    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
    });
  });
});