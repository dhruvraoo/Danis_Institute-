# Design Document

## Overview

This design addresses the student authentication issues by implementing a comprehensive authentication flow that ensures proper session management between the Django backend and React frontend. The solution focuses on fixing the disconnect between signup/login processes and subsequent API calls that require authentication.

## Architecture

### Current Issues Identified
1. **Signup Flow Gap**: After successful signup, users are redirected to login instead of being automatically authenticated
2. **Session Management**: Django sessions are not being properly maintained for API calls
3. **Frontend State**: localStorage user data is not synchronized with backend session state
4. **Error Handling**: 401 errors are not handled gracefully in the frontend

### Proposed Solution Architecture
```
Frontend (React) ←→ Backend (Django)
     ↓                    ↓
localStorage User    Django Session
     ↓                    ↓
API Client          Session Middleware
     ↓                    ↓
Authentication      Authentication
State Management    Validation
```

## Components and Interfaces

### Backend Components

#### 1. Enhanced Authentication Views
- **Modified `api_student_signup`**: Auto-login after successful signup
- **Enhanced `api_student_login`**: Improved session creation and response
- **New `api_check_auth`**: Endpoint to verify current authentication status
- **Enhanced error responses**: Consistent error messaging across all endpoints

#### 2. Session Management Middleware
- Ensure proper session handling for API requests
- Add session debugging capabilities
- Implement session refresh mechanisms

#### 3. Authentication Decorators
- Create reusable authentication checking decorators
- Standardize authentication validation across endpoints
- Provide consistent error responses

### Frontend Components

#### 1. Authentication Context
- Create React context for managing authentication state
- Synchronize localStorage with backend session
- Provide authentication status across components

#### 2. API Client Enhancement
- Add automatic authentication checking
- Implement token/session refresh logic
- Handle 401 errors consistently

#### 3. Route Protection
- Add authentication guards for protected routes
- Redirect unauthenticated users appropriately
- Show loading states during authentication checks

## Data Models

### Authentication State (Frontend)
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: Student | null;
  loading: boolean;
  error: string | null;
}

interface Student {
  id: number;
  name: string;
  email: string;
  roll_id: string;
  student_class: {
    id: number;
    name: string;
    grade_level: number;
    section: string;
  };
  subjects_selected: Subject[];
  user_type: 'student';
}
```

### Session Data (Backend)
```python
# Django session keys
session_keys = {
    'student_id': int,
    'student_name': str,
    'user_type': 'student',
    'authenticated_at': datetime,
    'last_activity': datetime
}
```

## Error Handling

### Backend Error Responses
```python
# Standardized error response format
{
    'success': False,
    'error_code': 'AUTHENTICATION_REQUIRED',
    'message': 'Not authenticated as student',
    'redirect_to': '/login',
    'details': {
        'session_exists': bool,
        'user_type': str | None,
        'suggested_action': str
    }
}
```

### Frontend Error Handling
1. **401 Unauthorized**: Clear localStorage, redirect to login
2. **Session Expired**: Show message, redirect to login
3. **Network Errors**: Show retry option, maintain current state
4. **Invalid Credentials**: Show specific error message

## Testing Strategy

### Backend Testing
1. **Unit Tests**
   - Test authentication decorators
   - Test session creation and validation
   - Test error response formats

2. **Integration Tests**
   - Test complete signup → auto-login flow
   - Test login → dashboard access flow
   - Test session persistence across requests

### Frontend Testing
1. **Component Tests**
   - Test authentication context behavior
   - Test protected route redirects
   - Test error handling components

2. **End-to-End Tests**
   - Test complete user journey from signup to dashboard
   - Test session persistence across page refreshes
   - Test logout and re-login flows

### Manual Testing Scenarios
1. **Happy Path**: Signup → Auto-login → Dashboard access
2. **Login Path**: Manual login → Dashboard access → API calls
3. **Session Expiry**: Long session → Expired session handling
4. **Error Recovery**: 401 error → Login → Resume activity

## Implementation Approach

### Phase 1: Backend Authentication Fixes
1. Modify signup endpoint to auto-login users
2. Enhance session management in login endpoint
3. Add authentication status checking endpoint
4. Standardize error responses across all endpoints

### Phase 2: Frontend Authentication Context
1. Create authentication context and provider
2. Implement authentication state management
3. Add authentication checking utilities
4. Create protected route components

### Phase 3: Integration and Error Handling
1. Integrate frontend context with backend APIs
2. Implement comprehensive error handling
3. Add loading states and user feedback
4. Test complete authentication flows

### Phase 4: Testing and Validation
1. Implement automated tests
2. Perform manual testing scenarios
3. Validate error handling edge cases
4. Performance testing for session management