// Improvement-related type definitions

export interface Improvement {
  id: string;
  type: 'content' | 'layout' | 'seo' | 'performance' | 'accessibility';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  before: string;
  after: string;
  autoApplicable: boolean;
}

export interface ImprovementCategory {
  name: string;
  color: string;
  icon: string;
}

export interface Change {
  id: string;
  improvementId: string;
  type: 'text' | 'image' | 'layout' | 'style' | 'seo';
  selector: string;
  oldValue: string;
  newValue: string;
  applied: boolean;
  timestamp: Date;
}

export interface ImprovementSuggestion {
  id: string;
  type: Improvement['type'];
  title: string;
  description: string;
  reasoning: string;
  implementation: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SEORecommendation {
  type: 'title' | 'description' | 'keywords' | 'headings' | 'images' | 'links';
  current: string;
  recommended: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  improvement: string;
}

export interface AccessibilityIssue {
  type: 'contrast' | 'alt-text' | 'keyboard' | 'aria' | 'focus';
  element: string;
  description: string;
  fix: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}