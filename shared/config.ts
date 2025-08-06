/**
 * Centralized API Configuration
 * Handles environment detection and API URL resolution
 */

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    detectFakeNews: string;
    educationalNews: string;
    healthCheck: string;
    modelStatus: string;
  };
  timeout: number;
  retryAttempts: number;
}

export type Environment = 'development' | 'production';

// Simple configuration without complex environment detection
const createConfig = (): ApiConfig => {
  // For development, always use localhost:8000
  // In production, this would be configured differently
  const baseUrl = 'http://localhost:8000';

  return {
    baseUrl,
    endpoints: {
      detectFakeNews: '/news/api/detect-fake-news/',
      educationalNews: '/news/api/educational-news/',
      healthCheck: '/news/api/health/',
      modelStatus: '/news/api/model-status/',
    },
    timeout: 10000, // 10 seconds
    retryAttempts: 2,
  };
};

export class ConfigManager {
  private static instance: ConfigManager;
  private config: ApiConfig;

  private constructor() {
    this.config = createConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public getFullUrl(endpoint: keyof ApiConfig['endpoints']): string {
    const config = this.getConfig();
    return `${config.baseUrl}${config.endpoints[endpoint]}`;
  }

  public updateBaseUrl(newBaseUrl: string): void {
    this.config.baseUrl = newBaseUrl;
  }

  // Utility method for debugging
  public getDebugInfo() {
    return {
      config: this.getConfig(),
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'server-side',
    };
  }
}

// Export singleton instance
export const apiConfig = ConfigManager.getInstance();