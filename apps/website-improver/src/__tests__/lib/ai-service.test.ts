import { 
  calculateEnhancedSEOScore,
  calculateEnhancedPerformanceScore,
  calculateEnhancedAccessibilityScore,
  calculateEnhancedUXScore
} from '@/lib/ai-service';
import type { SiteData } from '@/types/analysis';

// Mock site data for testing
const mockSiteData: SiteData = {
  url: 'https://example.com',
  title: 'Example Website - Professional Services',
  description: 'This is a comprehensive description of our professional services that meets the minimum length requirements for SEO.',
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  structure: {
    headings: [
      { level: 1, text: 'Main Heading', id: undefined },
      { level: 2, text: 'Subheading 1', id: undefined },
      { level: 2, text: 'Subheading 2', id: undefined },
    ],
    links: [
      { href: '/about', text: 'About Us', type: 'internal', rel: undefined },
      { href: 'https://external.com', text: 'External Link', type: 'external', rel: undefined },
    ],
    images: [
      { src: '/image1.jpg', alt: 'Descriptive alt text', width: 800, height: 600, loading: undefined },
      { src: '/image2.jpg', alt: '', width: 1200, height: 800, loading: undefined },
    ],
    forms: [],
    navigation: [],
  },
  assets: [
    { type: 'image', url: '/image1.jpg', size: undefined, loadTime: undefined, optimized: false },
    { type: 'image', url: '/image2.jpg', size: undefined, loadTime: undefined, optimized: false },
    { type: 'css', url: '/styles.css', size: undefined, loadTime: undefined, optimized: false },
  ],
  metadata: {
    title: 'Example Website - Professional Services',
    description: 'This is a comprehensive description of our professional services.',
    keywords: ['professional', 'services', 'business'],
    ogTags: { 'og:title': 'Example Website' },
    twitterTags: { 'twitter:title': 'Example Website' },
    structuredData: [],
  },
  screenshots: [
    {
      type: 'desktop',
      url: '/screenshot.png',
      width: 1920,
      height: 1080,
      timestamp: new Date(),
    },
  ],
};

describe('AI Service Scoring Functions', () => {
  describe('calculateEnhancedSEOScore', () => {
    it('should return high score for well-optimized site', () => {
      const aiRecommendations: string[] = [];
      const score = calculateEnhancedSEOScore(mockSiteData, aiRecommendations);
      
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize missing title', () => {
      const siteWithoutTitle = { ...mockSiteData, title: '' };
      const aiRecommendations: string[] = [];
      const score = calculateEnhancedSEOScore(siteWithoutTitle, aiRecommendations);
      
      expect(score).toBeLessThan(80);
    });

    it('should penalize short title', () => {
      const siteWithShortTitle = { ...mockSiteData, title: 'Short' };
      const aiRecommendations: string[] = [];
      const score = calculateEnhancedSEOScore(siteWithShortTitle, aiRecommendations);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize missing meta description', () => {
      const siteWithoutDescription = { ...mockSiteData, description: '' };
      const aiRecommendations: string[] = [];
      const score = calculateEnhancedSEOScore(siteWithoutDescription, aiRecommendations);
      
      expect(score).toBeLessThan(80);
    });

    it('should penalize short meta description', () => {
      const siteWithShortDescription = { ...mockSiteData, description: 'Short description' };
      const aiRecommendations: string[] = [];
      const score = calculateEnhancedSEOScore(siteWithShortDescription, aiRecommendations);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize missing H1 tag', () => {
      const siteWithoutH1 = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          headings: [
            { level: 2, text: 'Subheading 1', id: undefined },
            { level: 2, text: 'Subheading 2', id: undefined },
          ],
        },
      };
      const aiRecommendations: string[] = [];
      const score = calculateEnhancedSEOScore(siteWithoutH1, aiRecommendations);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize images without alt text', () => {
      const siteWithImagesNoAlt = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          images: [
            { src: '/image1.jpg', alt: '', width: 800, height: 600, loading: undefined },
            { src: '/image2.jpg', alt: '', width: 1200, height: 800, loading: undefined },
          ],
        },
      };
      const aiRecommendations: string[] = [];
      const score = calculateEnhancedSEOScore(siteWithImagesNoAlt, aiRecommendations);
      
      expect(score).toBeLessThan(90);
    });

    it('should apply AI-based penalties', () => {
      const aiRecommendations = ['Improve title', 'Add keywords', 'Optimize headings'];
      const score = calculateEnhancedSEOScore(mockSiteData, aiRecommendations);
      const scoreWithoutAI = calculateEnhancedSEOScore(mockSiteData, []);
      
      expect(score).toBeLessThan(scoreWithoutAI);
    });
  });

  describe('calculateEnhancedPerformanceScore', () => {
    it('should return high score for optimized site', () => {
      const performanceIssues: string[] = [];
      const score = calculateEnhancedPerformanceScore(mockSiteData, performanceIssues);
      
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize sites with many images', () => {
      const siteWithManyImages = {
        ...mockSiteData,
        assets: Array(15).fill(null).map((_, i) => ({
          type: 'image' as const,
          url: `/image${i}.jpg`,
          size: undefined,
          loadTime: undefined,
          optimized: false,
        })),
      };
      const performanceIssues: string[] = [];
      const score = calculateEnhancedPerformanceScore(siteWithManyImages, performanceIssues);
      
      expect(score).toBeLessThanOrEqual(80);
    });

    it('should penalize large content', () => {
      const siteWithLargeContent = {
        ...mockSiteData,
        content: 'x'.repeat(60000), // Very large content
      };
      const performanceIssues: string[] = [];
      const score = calculateEnhancedPerformanceScore(siteWithLargeContent, performanceIssues);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize large images', () => {
      const siteWithLargeImages = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          images: [
            { src: '/image1.jpg', alt: 'Alt text', width: 2000, height: 1500, loading: undefined },
            { src: '/image2.jpg', alt: 'Alt text', width: 1500, height: 1000, loading: undefined },
          ],
        },
      };
      const performanceIssues: string[] = [];
      const score = calculateEnhancedPerformanceScore(siteWithLargeImages, performanceIssues);
      
      expect(score).toBeLessThan(90);
    });

    it('should apply AI-based penalties', () => {
      const performanceIssues = ['Optimize images', 'Minify CSS', 'Enable compression'];
      const score = calculateEnhancedPerformanceScore(mockSiteData, performanceIssues);
      const scoreWithoutAI = calculateEnhancedPerformanceScore(mockSiteData, []);
      
      expect(score).toBeLessThan(scoreWithoutAI);
    });
  });

  describe('calculateEnhancedAccessibilityScore', () => {
    it('should return high score for accessible site', () => {
      const accessibilityIssues: string[] = [];
      const score = calculateEnhancedAccessibilityScore(mockSiteData, accessibilityIssues);
      
      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize images without alt text', () => {
      const siteWithoutAltText = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          images: [
            { src: '/image1.jpg', alt: '', width: 800, height: 600, loading: undefined },
            { src: '/image2.jpg', alt: '', width: 1200, height: 800, loading: undefined },
          ],
        },
      };
      const accessibilityIssues: string[] = [];
      const score = calculateEnhancedAccessibilityScore(siteWithoutAltText, accessibilityIssues);
      
      expect(score).toBeLessThan(80);
    });

    it('should penalize missing H1 tag', () => {
      const siteWithoutH1 = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          headings: [
            { level: 2, text: 'Subheading 1', id: undefined },
            { level: 3, text: 'Subheading 2', id: undefined },
          ],
        },
      };
      const accessibilityIssues: string[] = [];
      const score = calculateEnhancedAccessibilityScore(siteWithoutH1, accessibilityIssues);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize poor heading structure', () => {
      const siteWithPoorHeadings = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          headings: [
            { level: 1, text: 'Main Heading', id: undefined },
          ],
        },
      };
      const accessibilityIssues: string[] = [];
      const score = calculateEnhancedAccessibilityScore(siteWithPoorHeadings, accessibilityIssues);
      
      expect(score).toBeLessThan(95);
    });

    it('should apply AI-based penalties', () => {
      const accessibilityIssues = ['Add ARIA labels', 'Improve contrast', 'Fix keyboard navigation'];
      const score = calculateEnhancedAccessibilityScore(mockSiteData, accessibilityIssues);
      const scoreWithoutAI = calculateEnhancedAccessibilityScore(mockSiteData, []);
      
      expect(score).toBeLessThan(scoreWithoutAI);
    });
  });

  describe('calculateEnhancedUXScore', () => {
    it('should return high score for good UX site', () => {
      const uxSuggestions: string[] = [];
      const score = calculateEnhancedUXScore(mockSiteData, uxSuggestions);
      
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize short content', () => {
      const siteWithShortContent = {
        ...mockSiteData,
        content: 'Short content',
      };
      const uxSuggestions: string[] = [];
      const score = calculateEnhancedUXScore(siteWithShortContent, uxSuggestions);
      
      expect(score).toBeLessThan(80);
    });

    it('should penalize missing title', () => {
      const siteWithoutTitle = { ...mockSiteData, title: '' };
      const uxSuggestions: string[] = [];
      const score = calculateEnhancedUXScore(siteWithoutTitle, uxSuggestions);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize missing description', () => {
      const siteWithoutDescription = { ...mockSiteData, description: '' };
      const uxSuggestions: string[] = [];
      const score = calculateEnhancedUXScore(siteWithoutDescription, uxSuggestions);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize poor navigation', () => {
      const siteWithPoorNavigation = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          links: [],
        },
      };
      const uxSuggestions: string[] = [];
      const score = calculateEnhancedUXScore(siteWithPoorNavigation, uxSuggestions);
      
      expect(score).toBeLessThan(90);
    });

    it('should penalize missing headings', () => {
      const siteWithoutHeadings = {
        ...mockSiteData,
        structure: {
          ...mockSiteData.structure,
          headings: [],
        },
      };
      const uxSuggestions: string[] = [];
      const score = calculateEnhancedUXScore(siteWithoutHeadings, uxSuggestions);
      
      expect(score).toBeLessThan(85);
    });

    it('should reward call-to-action presence', () => {
      const siteWithCTA = {
        ...mockSiteData,
        content: mockSiteData.content + ' Contact us today for more information!',
      };
      const uxSuggestions: string[] = [];
      const score = calculateEnhancedUXScore(siteWithCTA, uxSuggestions);
      
      const siteWithoutCTA = {
        ...mockSiteData,
        content: 'Generic content without any call to action elements.',
      };
      const scoreWithoutCTA = calculateEnhancedUXScore(siteWithoutCTA, uxSuggestions);
      
      expect(score).toBeGreaterThanOrEqual(scoreWithoutCTA);
    });

    it('should apply AI-based penalties', () => {
      const uxSuggestions = ['Improve navigation', 'Add CTA buttons', 'Enhance layout'];
      const score = calculateEnhancedUXScore(mockSiteData, uxSuggestions);
      const scoreWithoutAI = calculateEnhancedUXScore(mockSiteData, []);
      
      expect(score).toBeLessThan(scoreWithoutAI);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty site data gracefully', () => {
      const emptySiteData: SiteData = {
        url: '',
        title: '',
        description: '',
        content: '',
        structure: {
          headings: [],
          links: [],
          images: [],
          forms: [],
          navigation: [],
        },
        assets: [],
        metadata: {
          title: '',
          description: '',
          keywords: [],
          ogTags: {},
          twitterTags: {},
          structuredData: [],
        },
        screenshots: [],
      };

      expect(() => calculateEnhancedSEOScore(emptySiteData, [])).not.toThrow();
      expect(() => calculateEnhancedPerformanceScore(emptySiteData, [])).not.toThrow();
      expect(() => calculateEnhancedAccessibilityScore(emptySiteData, [])).not.toThrow();
      expect(() => calculateEnhancedUXScore(emptySiteData, [])).not.toThrow();
    });

    it('should return scores within valid range', () => {
      const scores = [
        calculateEnhancedSEOScore(mockSiteData, []),
        calculateEnhancedPerformanceScore(mockSiteData, []),
        calculateEnhancedAccessibilityScore(mockSiteData, []),
        calculateEnhancedUXScore(mockSiteData, []),
      ];

      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(Number.isInteger(score)).toBe(true);
      });
    });
  });
});