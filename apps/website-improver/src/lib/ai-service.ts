import { config } from '@/lib/config';
import type { SiteData } from '@/types/analysis';
import type { Improvement } from '@/types/improvement';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AIAnalysisResult {
  improvements: Improvement[];
  seoRecommendations: string[];
  performanceIssues: string[];
  accessibilityIssues: string[];
  uxSuggestions: string[];
}

class AIService {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.apiKey = config.openai.apiKey;
    this.model = config.openai.model;
    this.maxTokens = config.openai.maxTokens;
    this.temperature = config.openai.temperature;
  }

  async analyzeWebsite(siteData: SiteData): Promise<AIAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(siteData);
    
    try {
      const response = await this.callOpenAI(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to basic analysis
      return this.generateFallbackAnalysis(siteData);
    }
  }

  async generateImprovements(siteData: SiteData, analysisScores: {
    seo: number;
    performance: number;
    accessibility: number;
    ux: number;
  }): Promise<Improvement[]> {
    const prompt = this.buildImprovementPrompt(siteData, analysisScores);
    
    try {
      const response = await this.callOpenAI(prompt);
      const parsed = this.parseImprovementResponse(response);
      return parsed.improvements;
    } catch (error) {
      console.error('AI improvement generation failed:', error);
      // Fallback to basic improvements
      return this.generateFallbackImprovements(siteData, analysisScores);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer and UX designer specializing in website optimization. Provide specific, actionable recommendations for improving websites.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private buildAnalysisPrompt(siteData: SiteData): string {
    return `
Analyze this website and provide specific improvement recommendations:

Website URL: ${siteData.url}
Title: ${siteData.title}
Description: ${siteData.description}
Content Length: ${siteData.content.length} characters

Structure:
- Headings: ${siteData.structure.headings.length} (${siteData.structure.headings.map(h => `H${h.level}: ${h.text.substring(0, 50)}`).join(', ')})
- Links: ${siteData.structure.links.length}
- Images: ${siteData.structure.images.length}

Assets: ${siteData.assets.length} total assets

Please analyze and provide:
1. SEO improvements (title, meta description, headings, content structure)
2. Performance optimizations (images, loading speed, asset optimization)
3. Accessibility enhancements (alt text, contrast, keyboard navigation)
4. UX improvements (layout, navigation, call-to-actions)

Format your response as JSON with this structure:
{
  "seoRecommendations": ["recommendation1", "recommendation2"],
  "performanceIssues": ["issue1", "issue2"],
  "accessibilityIssues": ["issue1", "issue2"],
  "uxSuggestions": ["suggestion1", "suggestion2"]
}
`;
  }

  private buildImprovementPrompt(siteData: SiteData, scores: {
    seo: number;
    performance: number;
    accessibility: number;
    ux: number;
  }): string {
    return `
Generate specific, actionable improvements for this website:

Website: ${siteData.url}
Title: ${siteData.title}
Current Scores:
- SEO: ${scores.seo}/100
- Performance: ${scores.performance}/100
- Accessibility: ${scores.accessibility}/100
- UX: ${scores.ux}/100

Content: ${siteData.content.substring(0, 1000)}...

Generate 3-5 high-impact improvements. For each improvement, provide:
- A unique ID
- Type (seo, performance, accessibility, layout, content)
- Title (concise description)
- Description (detailed explanation)
- Impact level (low, medium, high)
- Effort level (low, medium, high)
- Before/after examples
- Whether it can be auto-applied

Format as JSON:
{
  "improvements": [
    {
      "id": "unique-id",
      "type": "seo|performance|accessibility|layout|content",
      "title": "Short title",
      "description": "Detailed description",
      "impact": "low|medium|high",
      "effort": "low|medium|high",
      "before": "Current state",
      "after": "Improved state",
      "autoApplicable": true|false
    }
  ]
}
`;
  }

  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      const parsed = JSON.parse(response);
      return {
        improvements: [],
        seoRecommendations: parsed.seoRecommendations || [],
        performanceIssues: parsed.performanceIssues || [],
        accessibilityIssues: parsed.accessibilityIssues || [],
        uxSuggestions: parsed.uxSuggestions || [],
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        improvements: [],
        seoRecommendations: [],
        performanceIssues: [],
        accessibilityIssues: [],
        uxSuggestions: [],
      };
    }
  }

  private parseImprovementResponse(response: string): { improvements: Improvement[] } {
    try {
      const parsed = JSON.parse(response);
      return {
        improvements: parsed.improvements || [],
      };
    } catch (error) {
      console.error('Failed to parse improvement response:', error);
      return { improvements: [] };
    }
  }

  private generateFallbackAnalysis(siteData: SiteData): AIAnalysisResult {
    const improvements: Improvement[] = [];
    const seoRecommendations: string[] = [];
    const performanceIssues: string[] = [];
    const accessibilityIssues: string[] = [];
    const uxSuggestions: string[] = [];

    // Basic SEO analysis
    if (!siteData.title || siteData.title.length < 30) {
      seoRecommendations.push('Improve page title length and descriptiveness');
    }
    if (!siteData.description || siteData.description.length < 120) {
      seoRecommendations.push('Add or improve meta description');
    }

    // Basic performance analysis
    const imageAssets = siteData.assets.filter(asset => asset.type === 'image');
    if (imageAssets.length > 10) {
      performanceIssues.push('Consider optimizing or reducing the number of images');
    }

    // Basic accessibility analysis
    const imagesWithoutAlt = siteData.structure.images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      accessibilityIssues.push('Add alt text to images for screen readers');
    }

    // Basic UX analysis
    if (siteData.structure.headings.length === 0) {
      uxSuggestions.push('Add proper heading structure for better content organization');
    }

    return {
      improvements,
      seoRecommendations,
      performanceIssues,
      accessibilityIssues,
      uxSuggestions,
    };
  }

  private generateFallbackImprovements(siteData: SiteData, scores: {
    seo: number;
    performance: number;
    accessibility: number;
    ux: number;
  }): Improvement[] {
    const improvements: Improvement[] = [];

    // SEO improvements
    if (scores.seo < 80) {
      if (!siteData.title || siteData.title.length < 30) {
        improvements.push({
          id: 'seo-title-improvement',
          type: 'seo',
          title: 'Improve page title',
          description: 'The page title should be more descriptive and include relevant keywords to improve search engine visibility.',
          impact: 'high',
          effort: 'low',
          before: siteData.title || 'No title',
          after: `${siteData.title || 'Your Business'} - Professional Services & Solutions`,
          autoApplicable: true,
        });
      }

      if (!siteData.description || siteData.description.length < 120) {
        improvements.push({
          id: 'seo-meta-description',
          type: 'seo',
          title: 'Add meta description',
          description: 'A compelling meta description helps improve click-through rates from search results.',
          impact: 'high',
          effort: 'low',
          before: siteData.description || 'No meta description',
          after: 'Professional services and solutions tailored to your needs. Contact us today for expert consultation and outstanding results.',
          autoApplicable: true,
        });
      }
    }

    // Performance improvements
    if (scores.performance < 70) {
      const imageAssets = siteData.assets.filter(asset => asset.type === 'image');
      if (imageAssets.length > 5) {
        improvements.push({
          id: 'performance-image-optimization',
          type: 'performance',
          title: 'Optimize images',
          description: 'Compress and resize images to improve page loading speed and user experience.',
          impact: 'high',
          effort: 'medium',
          before: `${imageAssets.length} unoptimized images`,
          after: 'Compressed WebP images with appropriate sizing',
          autoApplicable: false,
        });
      }
    }

    // Accessibility improvements
    if (scores.accessibility < 80) {
      const imagesWithoutAlt = siteData.structure.images.filter(img => !img.alt || img.alt.trim() === '');
      if (imagesWithoutAlt.length > 0) {
        improvements.push({
          id: 'accessibility-alt-text',
          type: 'accessibility',
          title: 'Add alt text to images',
          description: 'Provide descriptive alt text for all images to improve accessibility for screen reader users.',
          impact: 'high',
          effort: 'low',
          before: `${imagesWithoutAlt.length} images without alt text`,
          after: 'All images have descriptive alt text',
          autoApplicable: true,
        });
      }
    }

    // UX improvements
    if (scores.ux < 75) {
      if (siteData.structure.headings.length < 2) {
        improvements.push({
          id: 'ux-heading-structure',
          type: 'content',
          title: 'Improve content structure',
          description: 'Add proper headings to organize content and improve readability.',
          impact: 'medium',
          effort: 'low',
          before: 'Poor content structure',
          after: 'Well-organized content with clear headings',
          autoApplicable: true,
        });
      }
    }

    return improvements;
  }
}

export const aiService = new AIService();

// Enhanced scoring algorithms with AI insights
export function calculateEnhancedSEOScore(siteData: SiteData, aiRecommendations: string[]): number {
  let score = 100;

  // Title optimization
  if (!siteData.title || siteData.title.length < 30) score -= 20;
  if (siteData.title && siteData.title.length > 60) score -= 10;

  // Meta description
  if (!siteData.description || siteData.description.length < 120) score -= 20;
  if (siteData.description && siteData.description.length > 160) score -= 10;

  // Heading structure
  const hasH1 = siteData.structure.headings.some(h => h.level === 1);
  if (!hasH1) score -= 15;
  if (siteData.structure.headings.length < 3) score -= 10;

  // Content quality
  if (siteData.content.length < 300) score -= 15;

  // Image optimization
  const imagesWithoutAlt = siteData.structure.images.filter(img => !img.alt || img.alt.trim() === '');
  if (siteData.structure.images.length > 0) {
    const altTextPenalty = (imagesWithoutAlt.length / siteData.structure.images.length) * 15;
    score -= altTextPenalty;
  }

  // AI-based deductions
  const aiPenalty = Math.min(10, aiRecommendations.length * 2);
  score -= aiPenalty;

  return Math.max(0, Math.round(score));
}

export function calculateEnhancedPerformanceScore(siteData: SiteData, performanceIssues: string[]): number {
  let score = 100;

  // Asset optimization
  const imageAssets = siteData.assets.filter(asset => asset.type === 'image');
  if (imageAssets.length > 10) score -= 20;
  if (imageAssets.length > 20) score -= 30;

  // Content size
  if (siteData.content.length > 50000) score -= 15;

  // Large images
  const largeImages = siteData.structure.images.filter(img => 
    (img.width && img.width > 1200) || (img.height && img.height > 800)
  );
  if (largeImages.length > 0) score -= 15;

  // AI-based deductions
  const aiPenalty = Math.min(15, performanceIssues.length * 3);
  score -= aiPenalty;

  return Math.max(0, Math.round(score));
}

export function calculateEnhancedAccessibilityScore(siteData: SiteData, accessibilityIssues: string[]): number {
  let score = 100;

  // Alt text compliance
  const imagesWithoutAlt = siteData.structure.images.filter(img => !img.alt || img.alt.trim() === '');
  if (siteData.structure.images.length > 0) {
    const altTextPenalty = (imagesWithoutAlt.length / siteData.structure.images.length) * 25;
    score -= altTextPenalty;
  }

  // Heading hierarchy
  const hasH1 = siteData.structure.headings.some(h => h.level === 1);
  if (!hasH1) score -= 15;
  if (siteData.structure.headings.length < 2) score -= 10;

  // AI-based deductions
  const aiPenalty = Math.min(20, accessibilityIssues.length * 4);
  score -= aiPenalty;

  return Math.max(0, Math.round(score));
}

export function calculateEnhancedUXScore(siteData: SiteData, uxSuggestions: string[]): number {
  let score = 100;

  // Content quality
  if (siteData.content.length < 500) score -= 20;
  if (!siteData.title || siteData.title.length < 10) score -= 15;
  if (!siteData.description) score -= 15;

  // Navigation and structure
  if (siteData.structure.links.length < 2) score -= 10;
  if (siteData.structure.headings.length === 0) score -= 15;

  // User engagement elements
  const hasCallToAction = siteData.content.toLowerCase().includes('contact') || 
                         siteData.content.toLowerCase().includes('call') ||
                         siteData.content.toLowerCase().includes('buy');
  if (!hasCallToAction) score -= 10;

  // AI-based deductions
  const aiPenalty = Math.min(15, uxSuggestions.length * 2);
  score -= aiPenalty;

  return Math.max(0, Math.round(score));
}