// Analysis-related type definitions

import { Improvement } from './improvement';

// Job-related types for analysis pipeline
export interface AnalysisJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  url: string;
  createdAt: string;
  estimatedCompletionTime?: string;
}

export interface AnalysisJobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  estimatedCompletionTime?: string;
}

export interface AnalysisResult {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  url: string;
  originalSite?: SiteData;
  improvements: Improvement[];
  seoScore?: number;
  performanceScore?: number;
  accessibilityScore?: number;
  uxScore?: number;
  analysisTime?: number;
  pagesAnalyzed?: number;
  creditsUsed?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Analysis {
  id: string;
  projectId: string;
  originalSite: SiteData;
  improvements: Improvement[];
  scores: AnalysisScores;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface SiteData {
  url: string;
  title: string;
  description: string;
  content: string;
  structure: PageStructure;
  assets: Asset[];
  metadata: Metadata;
  screenshots: Screenshot[];
}

export interface PageStructure {
  headings: Heading[];
  links: Link[];
  images: ImageElement[];
  forms: FormElement[];
  navigation: NavigationElement[];
}

export interface Asset {
  type: 'image' | 'css' | 'js' | 'font' | 'video';
  url: string;
  size?: number;
  loadTime?: number;
  optimized: boolean;
}

export interface Metadata {
  title: string;
  description: string;
  keywords: string[];
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  structuredData: Record<string, unknown>[];
}

export interface Screenshot {
  type: 'desktop' | 'mobile' | 'tablet';
  url: string;
  width: number;
  height: number;
  timestamp: Date;
}

export interface AnalysisScores {
  seo: number;
  performance: number;
  accessibility: number;
  ux: number;
  overall: number;
}

export interface Heading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
}

export interface Link {
  href: string;
  text: string;
  type: 'internal' | 'external';
  rel?: string;
}

export interface ImageElement {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export interface FormElement {
  id?: string;
  action: string;
  method: 'GET' | 'POST';
  fields: FormField[];
}

export interface FormField {
  type: string;
  name: string;
  label?: string;
  required: boolean;
}

export interface NavigationElement {
  type: 'header' | 'footer' | 'sidebar' | 'breadcrumb';
  items: NavigationItem[];
}

export interface NavigationItem {
  text: string;
  href: string;
  active: boolean;
  children?: NavigationItem[];
}