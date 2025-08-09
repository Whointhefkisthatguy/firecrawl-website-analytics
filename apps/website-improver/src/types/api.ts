// API interface definitions

import { Change } from './improvement';
import { Project } from './project';
import { AnalysisResult as AnalysisResultType } from './analysis';

// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// Analysis API interfaces
export interface AnalysisAPI {
  startAnalysis: (request: StartAnalysisRequest) => Promise<ApiResponse<StartAnalysisResponse>>;
  getAnalysisStatus: (jobId: string) => Promise<ApiResponse<AnalysisStatusResponse>>;
  getAnalysisResults: (jobId: string) => Promise<ApiResponse<AnalysisResultType>>;
}

export interface StartAnalysisRequest {
  url: string;
  userId: string;
  options?: AnalysisOptions;
}

export interface StartAnalysisResponse {
  jobId: string;
  status: 'queued';
  estimatedTime: number; // in seconds
}

export interface AnalysisStatusResponse {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: AnalysisResultType;
  error?: string;
}

export interface AnalysisOptions {
  includeScreenshots: boolean;
  mobileAnalysis: boolean;
  performanceAnalysis: boolean;
  seoAnalysis: boolean;
  accessibilityAnalysis: boolean;
}

// AnalysisResult is imported from analysis.ts to avoid duplication

// Project API interfaces
export interface ProjectAPI {
  createProject: (request: CreateProjectRequest) => Promise<ApiResponse<Project>>;
  getProjects: () => Promise<ApiResponse<Project[]>>;
  getProject: (id: string) => Promise<ApiResponse<Project>>;
  updateProject: (id: string, updates: UpdateProjectRequest) => Promise<ApiResponse<Project>>;
  deleteProject: (id: string) => Promise<ApiResponse<void>>;
  saveDraft: (id: string, changes: Change[]) => Promise<ApiResponse<{ success: boolean }>>;
}

export interface CreateProjectRequest {
  name: string;
  url: string;
  analysisId: string;
}

export interface UpdateProjectRequest {
  name?: string;
  status?: Project['status'];
  draftChanges?: Change[];
}

// Credit API interfaces
export interface CreditAPI {
  getCredits: () => Promise<ApiResponse<CreditResponse>>;
  deductCredits: (request: DeductCreditsRequest) => Promise<ApiResponse<CreditResponse>>;
  purchaseCredits: (request: PurchaseCreditsRequest) => Promise<ApiResponse<CreditResponse>>;
}

export interface CreditResponse {
  credits: number;
  plan: string;
  usage: CreditUsage;
}

export interface CreditUsage {
  totalUsed: number;
  thisMonth: number;
  breakdown: Record<string, number>;
}

export interface DeductCreditsRequest {
  amount: number;
  action: string;
  projectId?: string;
}

export interface PurchaseCreditsRequest {
  plan: string;
  paymentMethodId: string;
}

// Deployment API interfaces
export interface DeploymentAPI {
  deploy: (request: DeployRequest) => Promise<ApiResponse<DeployResponse>>;
  getDeploymentStatus: (deploymentId: string) => Promise<ApiResponse<DeploymentStatusResponse>>;
  configureDomain: (request: DomainConfigRequest) => Promise<ApiResponse<DomainConfigResponse>>;
}

export interface DeployRequest {
  projectId: string;
  platform: 'vercel' | 'netlify' | 'render';
  customDomain?: string;
  environmentVariables?: Record<string, string>;
}

export interface DeployResponse {
  deploymentId: string;
  url: string;
  platform: string;
}

export interface DeploymentStatusResponse {
  status: 'deploying' | 'success' | 'failed';
  url?: string;
  error?: string;
  logs?: string[];
}

export interface DomainConfigRequest {
  deploymentId: string;
  domain: string;
  provider: 'namecheap' | 'cloudflare' | 'porkbun';
}

export interface DomainConfigResponse {
  configured: boolean;
  nameservers?: string[];
  dnsRecords?: APIDNSRecord[];
}

export interface APIDNSRecord {
  type: 'A' | 'CNAME' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl: number;
}