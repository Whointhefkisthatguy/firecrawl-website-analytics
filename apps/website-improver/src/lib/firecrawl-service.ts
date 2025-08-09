import { config } from '@/lib/config';
import { updateAnalysisJobStatus } from '@/lib/analysis-service';
import { 
  aiService, 
  calculateEnhancedSEOScore,
  calculateEnhancedPerformanceScore,
  calculateEnhancedAccessibilityScore,
  calculateEnhancedUXScore
} from '@/lib/ai-service';
import type { SiteData } from '@/types/analysis';
import type { Improvement } from '@/types/improvement';

interface AnalysisJobData {
  jobId: string;
  userId: string;
  url: string;
  options: {
    includeScreenshots?: boolean;
    mobileAnalysis?: boolean;
    performanceAnalysis?: boolean;
    seoAnalysis?: boolean;
    accessibilityAnalysis?: boolean;
  };
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    content: string;
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description: string;
      language: string;
      keywords: string;
      robots: string;
      ogTitle: string;
      ogDescription: string;
      ogImage: string;
      ogUrl: string;
      statusCode: number;
    };
    screenshot?: string;
  };
  error?: string;
}

interface CrawlResponse {
  success: boolean;
  jobId?: string;
  data?: Array<{
    content: string;
    markdown: string;
    html: string;
    metadata: any;
    screenshot?: string;
  }>;
  error?: string;
}

// Initialize Firecrawl client
class FirecrawlClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.firecrawl.apiKey;
    this.baseUrl = config.firecrawl.baseUrl || 'http://localhost:3002';
  }

  async scrape(url: string, options: any = {}): Promise<FirecrawlResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v0/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'a', 'img'],
          excludeTags: ['script', 'style', 'nav', 'footer'],
          screenshot: options.includeScreenshots || false,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Firecrawl scrape error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async crawl(url: string, options: any = {}): Promise<CrawlResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v0/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url,
          crawlerOptions: {
            includes: [],
            excludes: ['*/admin/*', '*/login/*', '*/api/*'],
            maxDepth: 2,
            limit: 10,
          },
          pageOptions: {
            formats: ['markdown', 'html'],
            includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'a', 'img'],
            excludeTags: ['script', 'style', 'nav', 'footer'],
            screenshot: options.includeScreenshots || false,
          },
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Firecrawl crawl error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

const firecrawl = new FirecrawlClient();

// Process analysis job
export async function processAnalysisJob(data: AnalysisJobData): Promise<any> {
  const { jobId, userId, url, options } = data;

  try {
    // Update job status to processing
    await updateAnalysisJobStatus(jobId, 'processing', { progress: 10 });

    // Step 1: Scrape the main page
    console.log(`Scraping main page: ${url}`);
    const scrapeResult = await firecrawl.scrape(url, {
      includeScreenshots: options.includeScreenshots,
    });

    if (!scrapeResult.success || !scrapeResult.data) {
      throw new Error(scrapeResult.error || 'Failed to scrape website');
    }

    await updateAnalysisJobStatus(jobId, 'processing', { progress: 30 });

    // Step 2: Crawl additional pages if needed
    let crawlData: any[] = [scrapeResult.data];
    
    if (options.seoAnalysis || options.performanceAnalysis) {
      console.log(`Crawling additional pages: ${url}`);
      const crawlResult = await firecrawl.crawl(url, {
        includeScreenshots: false, // Only screenshot main page
      });

      if (crawlResult.success && crawlResult.data) {
        crawlData = crawlResult.data;
      }
    }

    await updateAnalysisJobStatus(jobId, 'processing', { progress: 50 });

    // Step 3: Analyze the scraped data
    console.log(`Analyzing website data for job ${jobId}`);
    const analysisResult = await analyzeWebsiteData(crawlData, options);

    await updateAnalysisJobStatus(jobId, 'processing', { progress: 80 });

    // Step 4: Generate improvements using AI
    console.log(`Generating improvements for job ${jobId}`);
    const improvements = await generateImprovements(analysisResult, options);

    // Step 5: Complete the job
    await updateAnalysisJobStatus(jobId, 'completed', {
      progress: 100,
      originalSite: analysisResult.originalSite,
      improvements,
      seoScore: analysisResult.scores.seo,
      performanceScore: analysisResult.scores.performance,
      accessibilityScore: analysisResult.scores.accessibility,
      uxScore: analysisResult.scores.ux,
      analysisTime: Date.now() - parseInt(jobId.split('-')[0], 16), // Rough calculation
      pagesAnalyzed: crawlData.length,
    });

    console.log(`Analysis job ${jobId} completed successfully`);
    return analysisResult;

  } catch (error) {
    console.error(`Analysis job ${jobId} failed:`, error);
    
    await updateAnalysisJobStatus(jobId, 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

// Analyze website data
async function analyzeWebsiteData(crawlData: any[], options: any) {
  const mainPage = crawlData[0];
  
  // Extract site data
  const originalSite: SiteData = {
    url: mainPage.metadata?.ogUrl || '',
    title: mainPage.metadata?.title || '',
    description: mainPage.metadata?.description || '',
    content: mainPage.markdown || '',
    structure: extractPageStructure(mainPage.html || ''),
    assets: extractAssets(mainPage.html || ''),
    metadata: mainPage.metadata || {},
    screenshots: mainPage.screenshot ? [{
      url: mainPage.screenshot,
      type: 'desktop' as const,
      width: 1920,
      height: 1080,
      timestamp: new Date(),
    }] : [],
  };

  // Get AI analysis
  let aiAnalysis;
  try {
    aiAnalysis = await aiService.analyzeWebsite(originalSite);
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    aiAnalysis = {
      improvements: [],
      seoRecommendations: [],
      performanceIssues: [],
      accessibilityIssues: [],
      uxSuggestions: [],
    };
  }

  // Calculate enhanced scores using AI insights
  const scores = {
    seo: options.seoAnalysis ? calculateEnhancedSEOScore(originalSite, aiAnalysis.seoRecommendations) : 0,
    performance: options.performanceAnalysis ? calculateEnhancedPerformanceScore(originalSite, aiAnalysis.performanceIssues) : 0,
    accessibility: options.accessibilityAnalysis ? calculateEnhancedAccessibilityScore(originalSite, aiAnalysis.accessibilityIssues) : 0,
    ux: calculateEnhancedUXScore(originalSite, aiAnalysis.uxSuggestions),
  };

  return {
    originalSite,
    scores,
    aiAnalysis,
    pagesAnalyzed: crawlData.length,
  };
}

// Generate AI-powered improvements
async function generateImprovements(analysisResult: any, options: any): Promise<Improvement[]> {
  try {
    // Use AI service to generate improvements
    const aiImprovements = await aiService.generateImprovements(
      analysisResult.originalSite,
      analysisResult.scores
    );

    // If AI generated improvements, use them
    if (aiImprovements.length > 0) {
      return aiImprovements;
    }
  } catch (error) {
    console.error('AI improvement generation failed, using fallback:', error);
  }

  // Fallback to rule-based improvements
  const improvements: Improvement[] = [];

  // SEO improvements
  if (options.seoAnalysis && analysisResult.scores.seo < 80) {
    if (!analysisResult.originalSite.title || analysisResult.originalSite.title.length < 30) {
      improvements.push({
        id: 'seo-title-optimization',
        type: 'seo',
        title: 'Optimize page title',
        description: 'The page title should be more descriptive, include target keywords, and be between 30-60 characters for optimal SEO performance.',
        impact: 'high',
        effort: 'low',
        before: analysisResult.originalSite.title || 'No title',
        after: `${analysisResult.originalSite.title || 'Your Business'} - Professional Services & Expert Solutions`,
        autoApplicable: true,
      });
    }

    if (!analysisResult.originalSite.description || analysisResult.originalSite.description.length < 120) {
      improvements.push({
        id: 'seo-meta-description',
        type: 'seo',
        title: 'Add compelling meta description',
        description: 'A well-crafted meta description between 120-160 characters improves click-through rates from search results.',
        impact: 'high',
        effort: 'low',
        before: analysisResult.originalSite.description || 'No meta description',
        after: 'Professional services and expert solutions tailored to your needs. Contact us today for outstanding results and personalized consultation.',
        autoApplicable: true,
      });
    }
  }

  // Performance improvements
  if (options.performanceAnalysis && analysisResult.scores.performance < 70) {
    const imageAssets = analysisResult.originalSite.assets.filter((asset: any) => asset.type === 'image');
    if (imageAssets.length > 5) {
      improvements.push({
        id: 'performance-image-optimization',
        type: 'performance',
        title: 'Optimize images for faster loading',
        description: 'Compress images, convert to modern formats like WebP, and implement lazy loading to significantly improve page speed.',
        impact: 'high',
        effort: 'medium',
        before: `${imageAssets.length} unoptimized images affecting load time`,
        after: 'Compressed WebP images with lazy loading and appropriate sizing',
        autoApplicable: false,
      });
    }
  }

  // Accessibility improvements
  if (options.accessibilityAnalysis && analysisResult.scores.accessibility < 80) {
    const imagesWithoutAlt = analysisResult.originalSite.structure.images.filter((img: any) => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length > 0) {
      improvements.push({
        id: 'accessibility-alt-text-enhancement',
        type: 'accessibility',
        title: 'Add descriptive alt text to images',
        description: 'Provide meaningful alt text for all images to ensure screen reader users can understand the visual content.',
        impact: 'high',
        effort: 'low',
        before: `${imagesWithoutAlt.length} images missing alt text`,
        after: 'All images have descriptive, contextual alt text',
        autoApplicable: true,
      });
    }
  }

  // UX improvements
  if (analysisResult.scores.ux < 75) {
    if (analysisResult.originalSite.structure.headings.length < 2) {
      improvements.push({
        id: 'ux-content-structure',
        type: 'content',
        title: 'Improve content organization',
        description: 'Add clear headings and structure to make content more scannable and user-friendly.',
        impact: 'medium',
        effort: 'low',
        before: 'Unstructured content without clear hierarchy',
        after: 'Well-organized content with clear headings and logical flow',
        autoApplicable: true,
      });
    }

    const hasCallToAction = analysisResult.originalSite.content.toLowerCase().includes('contact') || 
                           analysisResult.originalSite.content.toLowerCase().includes('call') ||
                           analysisResult.originalSite.content.toLowerCase().includes('buy');
    if (!hasCallToAction) {
      improvements.push({
        id: 'ux-call-to-action',
        type: 'layout',
        title: 'Add clear call-to-action',
        description: 'Include prominent, action-oriented buttons that guide users toward desired actions.',
        impact: 'high',
        effort: 'low',
        before: 'No clear call-to-action elements',
        after: 'Prominent "Contact Us" and "Get Started" buttons with compelling copy',
        autoApplicable: true,
      });
    }
  }

  return improvements;
}

// Helper functions for analysis
function extractPageStructure(html: string) {
  // Simple structure extraction - in production, use a proper HTML parser
  const headingMatches = html.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi) || [];
  const headings = headingMatches.map(match => {
    const levelMatch = match.match(/<h([1-6])/);
    const textMatch = match.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/);
    return {
      level: levelMatch ? parseInt(levelMatch[1]) as 1 | 2 | 3 | 4 | 5 | 6 : 1,
      text: textMatch ? textMatch[1].replace(/<[^>]*>/g, '') : '',
      id: undefined,
    };
  });

  const linkMatches = html.match(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi) || [];
  const links = linkMatches.map(match => {
    const hrefMatch = match.match(/href="([^"]*)"/);
    const textMatch = match.match(/<a[^>]*>(.*?)<\/a>/);
    const href = hrefMatch ? hrefMatch[1] : '';
    return {
      href,
      text: textMatch ? textMatch[1].replace(/<[^>]*>/g, '') : '',
      type: href.startsWith('http') ? 'external' as const : 'internal' as const,
      rel: undefined,
    };
  });

  const imageMatches = html.match(/<img[^>]*>/gi) || [];
  const images = imageMatches.map(match => {
    const srcMatch = match.match(/src="([^"]*)"/);
    const altMatch = match.match(/alt="([^"]*)"/);
    const widthMatch = match.match(/width="([^"]*)"/);
    const heightMatch = match.match(/height="([^"]*)"/);
    return {
      src: srcMatch ? srcMatch[1] : '',
      alt: altMatch ? altMatch[1] : '',
      width: widthMatch ? parseInt(widthMatch[1]) : undefined,
      height: heightMatch ? parseInt(heightMatch[1]) : undefined,
      loading: undefined,
    };
  });

  return {
    headings,
    links,
    images,
    forms: [], // TODO: Extract forms in future implementation
    navigation: [], // TODO: Extract navigation in future implementation
  };
}

function extractAssets(html: string) {
  const images = (html.match(/<img[^>]*src="([^"]*)"[^>]*>/gi) || [])
    .map(img => {
      const src = img.match(/src="([^"]*)"/)?.[1];
      if (!src) return null;
      return {
        type: 'image' as const,
        url: src,
        size: undefined,
        loadTime: undefined,
        optimized: false,
      };
    })
    .filter((asset): asset is NonNullable<typeof asset> => asset !== null);

  // TODO: Extract CSS, JS, and other assets in future implementation
  const cssAssets = (html.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"[^>]*>/gi) || [])
    .map(link => {
      const href = link.match(/href="([^"]*)"/)?.[1];
      if (!href) return null;
      return {
        type: 'css' as const,
        url: href,
        size: undefined,
        loadTime: undefined,
        optimized: false,
      };
    })
    .filter((asset): asset is NonNullable<typeof asset> => asset !== null);

  return [...images, ...cssAssets];
}

// Scoring functions moved to ai-service.ts for enhanced AI-powered analysis