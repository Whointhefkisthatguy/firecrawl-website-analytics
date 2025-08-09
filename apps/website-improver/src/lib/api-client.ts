// API client utilities for making requests to the backend

import { config } from './config';
import type { ApiResponse } from '@/types/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = config.app.apiUrl) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience functions for common API operations
export const api = {
  // Analysis endpoints
  analysis: {
    start: (data: Record<string, unknown>) => apiClient.post('/api/v1/analyze', data),
    getStatus: (jobId: string) => apiClient.get(`/api/v1/analyze/${jobId}`),
    getResults: (jobId: string) => apiClient.get(`/api/v1/analyze/${jobId}/results`),
  },

  // Project endpoints
  projects: {
    create: (data: Record<string, unknown>) => apiClient.post('/api/v1/projects', data),
    list: () => apiClient.get('/api/v1/projects'),
    get: (id: string) => apiClient.get(`/api/v1/projects/${id}`),
    update: (id: string, data: Record<string, unknown>) => apiClient.put(`/api/v1/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/projects/${id}`),
    saveDraft: (id: string, changes: Record<string, unknown>) => apiClient.post(`/api/v1/projects/${id}/drafts`, { changes }),
  },

  // Credit endpoints
  credits: {
    get: () => apiClient.get('/api/v1/credits'),
    deduct: (data: Record<string, unknown>) => apiClient.post('/api/v1/credits/deduct', data),
    purchase: (data: Record<string, unknown>) => apiClient.post('/api/v1/credits/purchase', data),
  },

  // Deployment endpoints
  deployment: {
    deploy: (data: Record<string, unknown>) => apiClient.post('/api/v1/deploy', data),
    getStatus: (deploymentId: string) => apiClient.get(`/api/v1/deploy/${deploymentId}`),
    configureDomain: (data: Record<string, unknown>) => apiClient.post('/api/v1/deploy/domain', data),
  },
};