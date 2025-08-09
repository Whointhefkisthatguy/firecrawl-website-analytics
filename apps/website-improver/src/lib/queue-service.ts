import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { config } from '@/lib/config';
import { processAnalysisJob } from '@/lib/firecrawl-service';

// Redis connection
const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Analysis queue
const analysisQueue = new Queue('website-analysis', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Job data interface
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

// Add job to queue
export async function addAnalysisJob(data: AnalysisJobData): Promise<void> {
  try {
    await analysisQueue.add('analyze-website', data, {
      jobId: data.jobId,
      priority: 1, // Default priority
      delay: 0,
    });
    
    console.log(`Analysis job ${data.jobId} added to queue`);
  } catch (error) {
    console.error('Failed to add analysis job to queue:', error);
    throw error;
  }
}

// Add priority job (for Pro users)
export async function addPriorityAnalysisJob(data: AnalysisJobData): Promise<void> {
  try {
    await analysisQueue.add('analyze-website', data, {
      jobId: data.jobId,
      priority: 10, // Higher priority for Pro users
      delay: 0,
    });
    
    console.log(`Priority analysis job ${data.jobId} added to queue`);
  } catch (error) {
    console.error('Failed to add priority analysis job to queue:', error);
    throw error;
  }
}

// Get queue status
export async function getQueueStatus() {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      analysisQueue.getWaiting(),
      analysisQueue.getActive(),
      analysisQueue.getCompleted(),
      analysisQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  } catch (error) {
    console.error('Failed to get queue status:', error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    };
  }
}

// Get job status from queue
export async function getJobFromQueue(jobId: string): Promise<Job | null> {
  try {
    return await analysisQueue.getJob(jobId);
  } catch (error) {
    console.error('Failed to get job from queue:', error);
    return null;
  }
}

// Cancel job
export async function cancelAnalysisJob(jobId: string): Promise<boolean> {
  try {
    const job = await analysisQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to cancel analysis job:', error);
    return false;
  }
}

// Create worker (this would typically be in a separate process)
export function createAnalysisWorker() {
  const worker = new Worker(
    'website-analysis',
    async (job: Job<AnalysisJobData>) => {
      console.log(`Processing analysis job ${job.data.jobId}`);
      
      try {
        // Update job progress
        await job.updateProgress(10);
        
        // Process the analysis
        const result = await processAnalysisJob(job.data);
        
        // Update final progress
        await job.updateProgress(100);
        
        return result;
      } catch (error) {
        console.error(`Analysis job ${job.data.jobId} failed:`, error);
        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 5, // Process up to 5 jobs concurrently
      limiter: {
        max: 10, // Max 10 jobs per duration
        duration: 60000, // 1 minute
      },
    }
  );

  // Worker event handlers
  worker.on('completed', (job) => {
    console.log(`Analysis job ${job.data.jobId} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Analysis job ${job?.data?.jobId} failed:`, err);
  });

  worker.on('progress', (job, progress) => {
    console.log(`Analysis job ${job.data.jobId} progress: ${progress}%`);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  return worker;
}

// Create analysis queue (alias for compatibility)
export function createAnalysisQueue() {
  return analysisQueue;
}

// Export queue for external use
export { analysisQueue };

// Graceful shutdown
export async function closeQueue(): Promise<void> {
  await analysisQueue.close();
  await redis.quit();
}