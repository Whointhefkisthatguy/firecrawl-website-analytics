import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { deductUserCredits, getUserCredits } from '@/lib/user-service';
import { createAnalysisQueue, addAnalysisJob } from '@/lib/queue-service';
import type { AnalysisJob, AnalysisJobStatus, AnalysisResult } from '@/types/analysis';

interface CreateAnalysisJobParams {
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

interface AnalysisJobData {
  id: string;
  userId: string;
  url: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  options: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  estimatedCompletionTime?: string;
  originalSite?: any;
  improvements?: any[];
  seoScore?: number;
  performanceScore?: number;
  accessibilityScore?: number;
  uxScore?: number;
  analysisTime?: number;
  pagesAnalyzed?: number;
  creditsUsed?: number;
}

const ANALYSIS_CREDIT_COST = 1;
const ESTIMATED_ANALYSIS_TIME = 60000; // 60 seconds

export async function createAnalysisJob(params: CreateAnalysisJobParams): Promise<AnalysisJob> {
  const { userId, url, options } = params;

  // Check user credits
  const userCredits = await getUserCredits(userId);
  if (userCredits < ANALYSIS_CREDIT_COST) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  // Generate job ID
  const jobId = uuidv4();
  const now = new Date().toISOString();
  const estimatedCompletionTime = new Date(Date.now() + ESTIMATED_ANALYSIS_TIME).toISOString();

  // Create job record in database
  const { data, error } = await supabase
    .from('analysis_jobs')
    .insert({
      id: jobId,
      user_id: userId,
      url,
      status: 'queued',
      progress: 0,
      options,
      created_at: now,
      updated_at: now,
      estimated_completion_time: estimatedCompletionTime,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create analysis job:', error);
    throw new Error('Failed to create analysis job');
  }

  // Deduct credits
  try {
    await deductUserCredits(userId, ANALYSIS_CREDIT_COST, 'website_analysis', jobId);
  } catch (error) {
    // Rollback job creation if credit deduction fails
    await supabase.from('analysis_jobs').delete().eq('id', jobId);
    throw error;
  }

  // Add job to queue
  try {
    await addAnalysisJob({
      jobId,
      userId,
      url,
      options,
    });
  } catch (error) {
    console.error('Failed to queue analysis job:', error);
    // Note: We don't rollback here as the job can be retried manually
  }

  return {
    id: jobId,
    status: 'queued',
    url,
    createdAt: now,
    estimatedCompletionTime,
  };
}

export async function getAnalysisJobStatus(jobId: string, userId: string): Promise<AnalysisJobStatus | null> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select(`
      id,
      status,
      progress,
      url,
      created_at,
      updated_at,
      completed_at,
      error,
      estimated_completion_time
    `)
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    status: data.status,
    progress: data.progress,
    url: data.url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    completedAt: data.completed_at,
    error: data.error,
    estimatedCompletionTime: data.estimated_completion_time,
  };
}

export async function getAnalysisJobResults(jobId: string, userId: string): Promise<AnalysisResult | null> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    status: data.status,
    url: data.url,
    originalSite: data.original_site,
    improvements: data.improvements || [],
    seoScore: data.seo_score,
    performanceScore: data.performance_score,
    accessibilityScore: data.accessibility_score,
    uxScore: data.ux_score,
    analysisTime: data.analysis_time,
    pagesAnalyzed: data.pages_analyzed,
    creditsUsed: data.credits_used,
    createdAt: data.created_at,
    completedAt: data.completed_at,
  };
}

export async function updateAnalysisJobStatus(
  jobId: string,
  status: 'processing' | 'completed' | 'failed',
  updates: Partial<{
    progress: number;
    error: string;
    originalSite: any;
    improvements: any[];
    seoScore: number;
    performanceScore: number;
    accessibilityScore: number;
    uxScore: number;
    analysisTime: number;
    pagesAnalyzed: number;
  }>
): Promise<void> {
  const now = new Date().toISOString();
  const updateData: any = {
    status,
    updated_at: now,
    ...updates,
  };

  if (status === 'completed') {
    updateData.completed_at = now;
    updateData.progress = 100;
  }

  // Convert camelCase to snake_case for database
  const dbUpdateData: Record<string, any> = {
    status: updateData.status,
    progress: updateData.progress,
    updated_at: updateData.updated_at,
    completed_at: updateData.completed_at,
    error: updateData.error,
    original_site: updateData.originalSite,
    improvements: updateData.improvements,
    seo_score: updateData.seoScore,
    performance_score: updateData.performanceScore,
    accessibility_score: updateData.accessibilityScore,
    ux_score: updateData.uxScore,
    analysis_time: updateData.analysisTime,
    pages_analyzed: updateData.pagesAnalyzed,
  };

  // Remove undefined values
  Object.keys(dbUpdateData).forEach(key => {
    if (dbUpdateData[key] === undefined) {
      delete dbUpdateData[key];
    }
  });

  const { error } = await supabase
    .from('analysis_jobs')
    .update(dbUpdateData)
    .eq('id', jobId);

  if (error) {
    console.error('Failed to update analysis job status:', error);
    throw new Error('Failed to update analysis job status');
  }
}

export async function getUserAnalysisJobs(userId: string, limit: number = 10): Promise<AnalysisJobData[]> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get user analysis jobs:', error);
    return [];
  }

  return data.map(job => ({
    id: job.id,
    userId: job.user_id,
    url: job.url,
    status: job.status,
    progress: job.progress,
    options: job.options,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    completedAt: job.completed_at,
    error: job.error,
    estimatedCompletionTime: job.estimated_completion_time,
    originalSite: job.original_site,
    improvements: job.improvements,
    seoScore: job.seo_score,
    performanceScore: job.performance_score,
    accessibilityScore: job.accessibility_score,
    uxScore: job.ux_score,
    analysisTime: job.analysis_time,
    pagesAnalyzed: job.pages_analyzed,
    creditsUsed: job.credits_used,
  }));
}