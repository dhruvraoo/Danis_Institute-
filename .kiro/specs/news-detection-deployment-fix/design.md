# Design Document

## Overview

This design addresses the port configuration and deployment issues in the fake news detection system by implementing a centralized API configuration system, environment-aware URL resolution, and robust error handling. The solution will ensure consistent functionality across different ports and deployment scenarios while providing clear feedback to users and developers.

## Architecture

### Configuration Management Layer
- **Environment Detection**: Automatically detect the current environment (development, production, etc.)
- **API Base URL Resolution**: Dynamically determine the correct backend URL based on environment
- **Centralized Configuration**: Single source of truth for all API endpoints
- **Environment Variable Support**: Allow override of default configurations via environment variables

### Frontend API Client Layer
- **Unified API Client**: Single client class handling all backend communications
- **Automatic Retry Logic**: Handle temporary network issues gracefully
- **Error Classification**: Distinguish between different types of errors (network, service, model)
- **Health Check Integration**: Monitor backend availability before making requests

### Backend Service Layer
- **Health Check Endpoints**: Provide status information for monitoring
- **CORS Configuration**: Ensure proper cross-origin request handling for all ports
- **Error Response Standardization**: Consistent error response format across all endpoints
- **Service Discovery**: Allow frontend to discover available services

## Components and Interfaces

### 1. API Configuration Module (`shared/config.ts`)
```typescript
interface ApiConfig {
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

class ConfigManager {
  static getApiConfig(): ApiConfig
  static detectEnvironment(): 'development' | 'production'
  static resolveBaseUrl(): string
}
```

### 2. API Client Module (`shared/api-client.ts`)
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

class ApiClient {
  async detectFakeNews(text: string): Promise<ApiResponse<FakeNewsResult>>
  async getEducationalNews(): Promise<ApiResponse<NewsArticle[]>>
  async checkHealth(): Promise<ApiResponse<HealthStatus>>
  async getModelStatus(): Promise<ApiResponse<ModelStatus>>
}
```

### 3. Error Handler Module (`shared/error-handler.ts`)
```typescript
enum ErrorType {
  NETWORK_ERROR = 'network',
  SERVICE_UNAVAILABLE = 'service',
  MODEL_NOT_READY = 'model',
  VALIDATION_ERROR = 'validation'
}

class ErrorHandler {
  static classifyError(error: any): ErrorType
  static getErrorMessage(error: ErrorType): string
  static getActionableMessage(error: ErrorType): string
}
```

### 4. Health Check Component (`client/components/ServiceStatus.tsx`)
```typescript
interface ServiceStatusProps {
  onStatusChange: (status: HealthStatus) => void;
}

const ServiceStatus: React.FC<ServiceStatusProps>
```

### 5. Django Health Check Views (`institute_backend/news/health.py`)
```python
def api_health_check(request):
    """Overall system health check"""
    
def api_model_status(request):
    """Fake news model status check"""
    
def api_service_info(request):
    """Service information and capabilities"""
```

## Data Models

### Configuration Data Model
```typescript
interface EnvironmentConfig {
  apiBaseUrl: string;
  frontendPort: number;
  backendPort: number;
  environment: 'development' | 'production';
  features: {
    fakeNewsDetection: boolean;
    educationalNews: boolean;
    healthChecks: boolean;
  };
}
```

### Health Status Data Model
```typescript
interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    django: ServiceHealth;
    fakeNewsModel: ServiceHealth;
    database: ServiceHealth;
  };
  timestamp: string;
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}
```

### Enhanced Error Response Model
```typescript
interface ErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    details?: any;
    actionable: string;
    timestamp: string;
  };
}
```

## Error Handling

### Network Error Handling
- **Connection Timeout**: 10-second timeout with retry logic
- **Port Detection**: Automatically try common ports if primary fails
- **Fallback Behavior**: Graceful degradation when backend is unavailable
- **User Feedback**: Clear messages explaining network issues

### Service Error Handling
- **Backend Unavailable**: Display service status and retry options
- **Model Not Loaded**: Indicate demo mode with explanation
- **API Rate Limiting**: Handle rate limits with appropriate delays
- **Validation Errors**: Show specific field-level error messages

### Frontend Error Boundaries
- **Component-Level**: Isolate errors to specific features
- **Global Handler**: Catch unhandled errors and provide fallback UI
- **Error Reporting**: Log errors for debugging (development only)
- **Recovery Actions**: Provide users with ways to recover from errors

## Testing Strategy

### Unit Testing
- **Configuration Manager**: Test environment detection and URL resolution
- **API Client**: Test all API methods with mocked responses
- **Error Handler**: Test error classification and message generation
- **Health Check**: Test status detection and reporting

### Integration Testing
- **Cross-Port Testing**: Verify functionality across ports 8080 and 8081
- **Backend Integration**: Test all API endpoints with real Django backend
- **Error Scenarios**: Test behavior when backend is unavailable
- **Configuration Changes**: Test dynamic configuration updates

### End-to-End Testing
- **User Workflows**: Test complete fake news detection workflow
- **Error Recovery**: Test user experience during service outages
- **Multi-Environment**: Test deployment across different environments
- **Performance**: Test response times and timeout handling

### Manual Testing Scenarios
1. **Port Switching**: Access application on different ports and verify functionality
2. **Backend Restart**: Test behavior when Django backend is restarted
3. **Network Interruption**: Test handling of temporary network issues
4. **Model Loading**: Test behavior during model initialization
5. **Configuration Changes**: Test dynamic configuration updates

## Deployment Considerations

### Environment Variables
```bash
# Development
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Production
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

### Build Configuration
- **Development Build**: Include debugging and verbose error messages
- **Production Build**: Optimize for performance and security
- **Environment Detection**: Automatic configuration based on build target
- **Asset Optimization**: Minimize bundle size for faster loading

### CORS Configuration
```python
# Django settings for multiple frontend ports
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
]
```

### Health Check Endpoints
- `/news/api/health/` - Overall system health
- `/news/api/model-status/` - ML model status
- `/news/api/service-info/` - Service capabilities and version info