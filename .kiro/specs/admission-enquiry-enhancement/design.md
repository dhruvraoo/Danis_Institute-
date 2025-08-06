# Design Document

## Overview

This design enhances the existing admission enquiry system by implementing proper data persistence, improving the form flow, and adding admin management capabilities. The solution builds upon the current 3-step form structure while adding database storage using SQLite and admin dashboard integration.

## Architecture

### Current System
- React-based multi-step form with 3 steps (Personal Info, Course Details, Additional Info)
- Express.js backend with basic API endpoint
- Form submission currently only logs to console
- Admin dashboard exists but has no enquiry management

### Enhanced System
- Maintain existing React form structure but improve step 3 to show success confirmation
- Add SQLite database integration for enquiry storage
- Enhance backend API to persist enquiry data
- Integrate enquiry management into existing admin dashboard
- Add status tracking and management capabilities

## Components and Interfaces

### Frontend Components

#### AdmissionEnquiry Component (Enhanced)
- **Current**: 3-step form with basic validation
- **Enhancement**: 
  - Modify step 3 to show success confirmation instead of additional message form
  - Move optional message field to step 2
  - Improve form submission handling with better error states
  - Add loading states during submission

#### AdminDashboard Component (Enhanced)
- **Current**: Attendance management and academic news
- **Enhancement**:
  - Add new "Admission Inquiries" section
  - Display inquiries in a card-based layout
  - Include status management controls
  - Add filtering and sorting capabilities

#### New: InquiryManagement Component
- Display list of admission inquiries
- Status update controls (pending, contacted, resolved)
- Inquiry details view
- Search and filter functionality

### Backend Components

#### Database Schema
```sql
CREATE TABLE admission_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  previous_education TEXT,
  subjects TEXT NOT NULL, -- JSON array as string
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, contacted, resolved
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

##### Enhanced: POST /api/enquiry
- **Current**: Logs enquiry to console
- **Enhancement**: 
  - Validate input data using Zod schema
  - Store enquiry in SQLite database
  - Return success/error response
  - Generate unique ID for tracking

##### New: GET /api/admin/inquiries
- Retrieve all admission inquiries
- Support filtering by status
- Return inquiries with pagination support
- Include summary statistics

##### New: PUT /api/admin/inquiries/:id/status
- Update inquiry status
- Validate status values
- Update timestamp
- Return updated inquiry

### Database Integration

#### Database Service
```typescript
interface DatabaseService {
  createInquiry(inquiry: AdmissionEnquiryRequest): Promise<number>;
  getInquiries(filters?: InquiryFilters): Promise<AdmissionInquiry[]>;
  updateInquiryStatus(id: number, status: InquiryStatus): Promise<boolean>;
  getInquiryStats(): Promise<InquiryStats>;
}
```

#### SQLite Setup
- Use better-sqlite3 for database operations
- Create database initialization script
- Implement connection pooling and error handling
- Add database migration support

## Data Models

### Enhanced AdmissionEnquiryRequest
```typescript
interface AdmissionEnquiryRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  previousEducation: string;
  subjects: string[];
  message?: string;
}
```

### New: AdmissionInquiry (Database Model)
```typescript
interface AdmissionInquiry {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  previousEducation: string;
  subjects: string[];
  message?: string;
  status: 'pending' | 'contacted' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}
```

### New: InquiryStats
```typescript
interface InquiryStats {
  total: number;
  pending: number;
  contacted: number;
  resolved: number;
}
```

## Error Handling

### Frontend Error Handling
- Form validation errors displayed inline
- Network error handling with retry options
- Loading states during form submission
- Success/error toast notifications

### Backend Error Handling
- Input validation using Zod schemas
- Database error handling with appropriate HTTP status codes
- Logging for debugging and monitoring
- Graceful degradation for database connection issues

### Database Error Handling
- Connection retry logic
- Transaction rollback on failures
- Constraint violation handling
- Data integrity validation

## Testing Strategy

### Unit Tests
- Form validation logic
- Database service methods
- API endpoint handlers
- Status update functionality

### Integration Tests
- End-to-end form submission flow
- Database operations
- API endpoint integration
- Admin dashboard inquiry management

### User Acceptance Tests
- Complete inquiry submission workflow
- Admin inquiry management workflow
- Status update functionality
- Error handling scenarios

## Security Considerations

### Input Validation
- Server-side validation for all form inputs
- SQL injection prevention using parameterized queries
- XSS prevention through proper data sanitization
- Rate limiting for form submissions

### Data Protection
- Email and phone number validation
- Secure storage of personal information
- Admin authentication for inquiry access
- Audit trail for status changes

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns (status, created_at)
- Pagination for large inquiry lists
- Connection pooling for database operations
- Query optimization for admin dashboard

### Frontend Optimization
- Lazy loading for admin inquiry components
- Debounced search functionality
- Optimistic updates for status changes
- Efficient re-rendering with React keys

## Migration Strategy

### Database Migration
- Create database initialization script
- Add migration for admission_inquiries table
- Ensure backward compatibility
- Data validation after migration

### Code Migration
- Enhance existing components incrementally
- Maintain existing API compatibility
- Add new endpoints without breaking changes
- Progressive enhancement approach