// Deployment-related type definitions

export interface Deployment {
  id: string;
  projectId: string;
  platform: DeploymentPlatform;
  status: DeploymentStatus;
  url?: string;
  customDomain?: string;
  environmentVariables: Record<string, string>;
  buildLogs: string[];
  createdAt: Date;
  deployedAt?: Date;
  error?: string;
}

export type DeploymentPlatform = 'vercel' | 'netlify' | 'render';

export type DeploymentStatus = 
  | 'pending'
  | 'building'
  | 'deploying'
  | 'success'
  | 'failed'
  | 'cancelled';

export interface DeploymentConfig {
  platform: DeploymentPlatform;
  buildCommand?: string;
  outputDirectory?: string;
  nodeVersion?: string;
  environmentVariables?: Record<string, string>;
  customDomain?: string;
}

export interface PlatformCredentials {
  vercel?: {
    token: string;
    teamId?: string;
  };
  netlify?: {
    token: string;
    siteId?: string;
  };
  render?: {
    apiKey: string;
    serviceId?: string;
  };
}

export interface DomainConfiguration {
  domain: string;
  provider: DomainProvider;
  configured: boolean;
  nameservers: string[];
  dnsRecords: DNSRecord[];
  sslEnabled: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
}

export type DomainProvider = 'namecheap' | 'cloudflare' | 'porkbun' | 'custom';

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export interface DeploymentJob {
  id: string;
  deploymentId: string;
  type: 'build' | 'deploy' | 'domain_config';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  logs: string[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface BuildOutput {
  success: boolean;
  outputPath: string;
  assets: BuildAsset[];
  size: number;
  buildTime: number;
  warnings: string[];
  errors: string[];
}

export interface BuildAsset {
  path: string;
  size: number;
  type: 'html' | 'css' | 'js' | 'image' | 'font' | 'other';
  compressed: boolean;
}