import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UrlInput } from '@/components/url-input/url-input';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('URL Input Flow Integration', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should complete full URL validation and submission flow', async () => {
    const user = userEvent.setup();

    // Mock successful accessibility check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessible: true,
        statusCode: 200,
        responseTime: 500,
      }),
    } as Response);

    render(<UrlInput onSubmit={mockOnSubmit} />);

    // Step 1: Enter URL
    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'example.com');

    // Verify auto-formatting
    expect(input).toHaveValue('https://example.com');

    // Step 2: Check URL accessibility
    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/url/check-accessibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    // Step 3: Verify success message and analyze button
    await waitFor(() => {
      expect(screen.getByText(/website is accessible and ready for analysis/i)).toBeInTheDocument();
    });

    const analyzeButton = await screen.findByText(/analyze website/i);
    expect(analyzeButton).toBeInTheDocument();

    // Step 4: Submit for analysis
    await user.click(analyzeButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com');
  });

  it('should handle inaccessible URL gracefully', async () => {
    const user = userEvent.setup();

    // Mock failed accessibility check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessible: false,
        error: 'Connection refused - website may be down',
      }),
    } as Response);

    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://unreachable-site.com');

    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/connection refused - website may be down/i)).toBeInTheDocument();
    });

    // Analyze button should not be present
    expect(screen.queryByText(/analyze website/i)).not.toBeInTheDocument();
  });

  it('should prevent submission of invalid URLs', async () => {
    const user = userEvent.setup();
    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'localhost');

    // The URL gets auto-formatted to https://localhost, which should be blocked
    expect(input).toHaveValue('https://localhost');

    await waitFor(() => {
      expect(screen.getByText(/cannot analyze local or private network urls/i)).toBeInTheDocument();
    });

    // No check button should be available for invalid URLs
    expect(screen.queryByText(/check url/i)).not.toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle network errors during accessibility check', async () => {
    const user = userEvent.setup();

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UrlInput onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/website url/i);
    await user.type(input, 'https://example.com');

    const checkButton = await screen.findByText(/check url/i);
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});