import { urlSchema, urlAccessibilitySchema } from '@/lib/validations';

describe('URL Validation', () => {
  describe('urlSchema', () => {
    it('should accept valid HTTP URLs', () => {
      const validUrls = [
        'http://example.com',
        'https://example.com',
        'https://www.example.com',
        'https://subdomain.example.com',
        'https://example.com/path',
        'https://example.com/path?query=value',
        'https://example.com:8080',
      ];

      validUrls.forEach(url => {
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'ftp://example.com',
        'file:///path/to/file',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
      ];

      invalidUrls.forEach(url => {
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(false);
      });
    });

    it('should reject localhost and private IP addresses', () => {
      const privateUrls = [
        'http://localhost',
        'https://localhost:3000',
        'http://127.0.0.1',
        'https://127.0.0.1:8080',
        'http://192.168.1.1',
        'https://192.168.0.100',
        'http://10.0.0.1',
        'https://172.16.0.1',
      ];

      privateUrls.forEach(url => {
        const result = urlSchema.safeParse(url);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((issue: any) => issue.message.includes('Cannot analyze local or private network URLs'))).toBe(true);
        }
      });
    });

    it('should require HTTPS or HTTP protocol', () => {
      const result = urlSchema.safeParse('ftp://example.com');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) => issue.message.includes('URL must use HTTP or HTTPS protocol'))).toBe(true);
      }
    });

    it('should provide helpful error messages', () => {
      const testCases = [
        {
          input: '',
          expectedMessage: 'URL is required',
        },
        {
          input: 'not-a-url',
          expectedMessage: 'Please enter a valid URL',
        },
        {
          input: 'ftp://example.com',
          expectedMessage: 'URL must use HTTP or HTTPS protocol',
        },
        {
          input: 'http://localhost',
          expectedMessage: 'Cannot analyze local or private network URLs',
        },
      ];

      testCases.forEach(({ input, expectedMessage }) => {
        const result = urlSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((issue: any) => issue.message.includes(expectedMessage))).toBe(true);
        }
      });
    });
  });

  describe('urlAccessibilitySchema', () => {
    it('should accept valid accessibility check requests', () => {
      const validRequests = [
        { url: 'https://example.com' },
        { url: 'https://example.com', timeout: 5000 },
        { url: 'https://example.com', timeout: 30000 },
      ];

      validRequests.forEach(request => {
        const result = urlAccessibilitySchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid timeout values', () => {
      const invalidRequests = [
        { url: 'https://example.com', timeout: 500 }, // Too short
        { url: 'https://example.com', timeout: 60000 }, // Too long
        { url: 'https://example.com', timeout: -1000 }, // Negative
      ];

      invalidRequests.forEach(request => {
        const result = urlAccessibilitySchema.safeParse(request);
        expect(result.success).toBe(false);
      });
    });

    it('should use default timeout when not provided', () => {
      const result = urlAccessibilitySchema.safeParse({ url: 'https://example.com' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeout).toBe(10000);
      }
    });

    it('should validate URL within accessibility schema', () => {
      const result = urlAccessibilitySchema.safeParse({ url: 'invalid-url' });
      expect(result.success).toBe(false);
    });
  });
});