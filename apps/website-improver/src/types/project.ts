// Project-related type definitions

import { Change } from './improvement';

export interface Project {
  id: string;
  userId: string;
  name: string;
  originalUrl: string;
  status: 'analyzing' | 'ready' | 'editing' | 'deployed';
  analysisId: string;
  draftChanges?: Change[];
  deploymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  autoSave: boolean;
  saveInterval: number; // in seconds
  backupEnabled: boolean;
  collaborationEnabled: boolean;
}

export interface ProjectMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  estimatedCompletionTime: number; // in minutes
}