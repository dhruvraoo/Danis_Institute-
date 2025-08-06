/**
 * Unified API Client
 * Handles all backend communications with error handling and retry logic
 */

import { apiConfig } from './config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface FakeNewsResult {
  prediction: string;
  confidence: number;
  message: string;
  demo_mode?: boolean;
  analysis_details?: any;
}

export interface NewsArticle {
  title: string;
  url: string;
  image: string;
  description?: string;
}

export interface EducationalNewsResponse {
  articles: NewsArticle[];
  source: 'live' | 'cached' | 'fallback';
  message: string;
  success: boolean;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    django: ServiceHealth;
    fakeNewsModel: ServiceHealth;
  };
  timestamp: string;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
}

export enum ErrorType {
  NETWORK_ERROR = 'network',
  SERVICE_UNAVAILABLE = 'service',
  MODEL_NOT_READY = 'model',
  VALIDATION_ERROR = 'validation',
  TIMEOUT_ERROR = 'timeout',
}

export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private config = apiConfig.getConfig();

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || 'Request failed',
        statusCode: response.status,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new ApiError(ErrorType.TIMEOUT_ERROR, 'Request timed out');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          ErrorType.NETWORK_ERROR,
          'Network error - please check your connection and ensure the backend is running'
        );
      }

      throw new ApiError(
        ErrorType.SERVICE_UNAVAILABLE,
        error.message || 'Unknown error occurred'
      );
    }
  }

  private async makeRequestWithRetry<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await this.makeRequest<T>(url, options);
      } catch (error) {
        lastError = error instanceof ApiError ? error : new ApiError(
          ErrorType.SERVICE_UNAVAILABLE,
          error instanceof Error ? error.message : 'Unknown error'
        );

        // Don't retry validation errors
        if (lastError.type === ErrorType.VALIDATION_ERROR) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  public async detectFakeNews(text: string): Promise<FakeNewsResult> {
    if (!text || text.trim().length < 50) {
      throw new ApiError(
        ErrorType.VALIDATION_ERROR,
        'Text must be at least 50 characters long'
      );
    }

    try {
      const url = apiConfig.getFullUrl('detectFakeNews');
      const response = await this.makeRequestWithRetry<FakeNewsResult>(url, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.success) {
        throw new ApiError(
          ErrorType.SERVICE_UNAVAILABLE,
          response.error || 'Failed to analyze news'
        );
      }

      return response.data!;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ErrorType.SERVICE_UNAVAILABLE,
        'Failed to connect to fake news detection service'
      );
    }
  }

  public async getEducationalNews(): Promise<NewsArticle[]> {
    try {
      const newsResponse = await this.getEducationalNewsWithMeta();
      return newsResponse.articles;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ErrorType.SERVICE_UNAVAILABLE,
        'Failed to connect to news service'
      );
    }
  }

  public async getEducationalNewsWithMeta(): Promise<EducationalNewsResponse> {
    try {
      const baseUrl = apiConfig.getFullUrl('educationalNews');
      // Add timestamp to prevent caching
      const url = `${baseUrl}?t=${Date.now()}`;
      
      // Make direct fetch request since Django returns the data directly
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new ApiError(
          ErrorType.SERVICE_UNAVAILABLE,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Django returns the data directly, not wrapped in a "data" property
      return {
        articles: data.articles || [],
        source: data.source || 'fallback',
        message: data.message || 'No message',
        success: data.success || false
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ErrorType.SERVICE_UNAVAILABLE,
        'Failed to connect to news service'
      );
    }
  }

  public async checkHealth(): Promise<HealthStatus> {
    try {
      const url = apiConfig.getFullUrl('healthCheck');
      const response = await this.makeRequest<HealthStatus>(url);

      if (!response.success) {
        throw new ApiError(
          ErrorType.SERVICE_UNAVAILABLE,
          'Health check failed'
        );
      }

      return response.data!;
    } catch (error) {
      // Return degraded status if health check fails
      return {
        overall: 'unhealthy',
        services: {
          django: { status: 'down', error: error instanceof Error ? error.message : 'Unknown error' },
          fakeNewsModel: { status: 'down' },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  public getErrorMessage(error: ApiError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return 'Network error. Please check your internet connection and try again.';
      case ErrorType.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable. Please try again in a moment.';
      case ErrorType.MODEL_NOT_READY:
        return 'AI model is loading. Please wait a moment and try again.';
      case ErrorType.VALIDATION_ERROR:
        return error.message;
      case ErrorType.TIMEOUT_ERROR:
        return 'Request timed out. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  public getActionableMessage(error: ApiError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return 'Check that the Django backend is running on port 8000';
      case ErrorType.SERVICE_UNAVAILABLE:
        return 'Verify the backend service is running and accessible';
      case ErrorType.MODEL_NOT_READY:
        return 'Wait for the AI model to finish loading';
      case ErrorType.VALIDATION_ERROR:
        return 'Please correct the input and try again';
      case ErrorType.TIMEOUT_ERROR:
        return 'Try again with a shorter text or check your connection';
      default:
        return 'Refresh the page or contact support if the problem persists';
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();