# Design Document

## Overview

The attendance management system is designed as a Django REST API backend with a React frontend integration. The system leverages the existing Student and Class models from the accounts app and introduces a new attendance app to handle attendance-specific functionality. The design follows Django best practices with proper model relationships, serializers for API responses, and RESTful endpoints for frontend integration.

## Architecture

### Backend Architecture
- **Django App Structure**: New `attendance` app within the existing `institute_backend` project
- **Database Layer**: SQLite database with Django ORM for data persistence
- **API Layer**: Django REST Framework for RESTful API endpoints
- **Authentication**: Integration with existing session-based authentication system
- **CORS**: Configured for React frontend communication

### Frontend Integration
- **API Communication**: RESTful API calls from React frontend
- **State Management**: React state for attendance form management
- **UI Components**: Card-based interface for class selection and attendance marking
- **Date Handling**: Date picker component for historical attendance management

## Components and Interfaces

### 1. Django Models

#### Attendance Model
```python
class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    present = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'date']
        ordering = ['-date', 'student__name']
```

**Design Rationale**: 
- ForeignKey to Student ensures referential integrity
- DateField for specific date tracking
- BooleanField for simple Present/Absent status
- unique_together prevents duplicate entries per student per day
- Timestamps for audit trail

### 2. Serializers

#### AttendanceSerializer
```python
class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_roll_id = serializers.CharField(source='student.roll_id', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'student_roll_id', 'date', 'present']
```

#### UserSerializer
```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'roll_id', 'student_class']
```

**Design Rationale**: 
- Includes student details for frontend display
- Minimal data exposure for security
- Read-only fields for derived data

### 3. API Endpoints

#### GET /api/attendance/admin/
**Purpose**: Fetch students and existing attendance for a specific class and date

**Query Parameters**:
- `class_grade` (required): Integer (9, 10, 11, 12)
- `date` (optional): Date string (YYYY-MM-DD), defaults to current date

**Response Structure**:
```json
{
    "students": [
        {
            "id": 1,
            "name": "John Doe",
            "roll_id": "2024001",
            "student_class": {
                "id": 1,
                "name": "Grade 9",
                "grade_level": 9
            }
        }
    ],
    "attendance_records": [
        {
            "id": 1,
            "student": 1,
            "student_name": "John Doe",
            "student_roll_id": "2024001",
            "date": "2025-08-03",
            "present": true
        }
    ]
}
```

#### POST /api/attendance/admin/
**Purpose**: Create or update attendance records for multiple students

**Request Body**:
```json
{
    "date": "2025-08-03",
    "attendance_data": [
        {
            "student_id": 1,
            "present": true
        },
        {
            "student_id": 2,
            "present": false
        }
    ]
}
```

**Response**: Success/error status with created/updated record count

#### GET /api/attendance/student/{student_id}/
**Purpose**: Fetch complete attendance history for a specific student

**Response Structure**:
```json
{
    "student": {
        "id": 1,
        "name": "John Doe",
        "roll_id": "2024001"
    },
    "attendance_history": [
        {
            "date": "2025-08-03",
            "present": true
        },
        {
            "date": "2025-08-02",
            "present": false
        }
    ],
    "summary": {
        "total_days": 50,
        "present_days": 45,
        "absent_days": 5,
        "attendance_percentage": 90.0
    }
}
```

### 4. View Classes

#### AttendanceAdminView
- Handles both GET and POST requests
- GET: Retrieves students by class grade and existing attendance
- POST: Bulk create/update attendance records using `update_or_create`
- Date validation and error handling
- Permission checks for admin access

#### StudentAttendanceView
- GET endpoint for individual student attendance history
- Calculates attendance statistics
- Filters by date range if provided
- Student-specific access control

## Data Models

### Attendance Model Relationships
```
Student (1) ←→ (Many) Attendance
Class (1) ←→ (Many) Student ←→ (Many) Attendance
```

### Database Schema
```sql
CREATE TABLE attendance_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES accounts_student(id),
    date DATE NOT NULL,
    present BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_date ON attendance_attendance(date);
CREATE INDEX idx_attendance_student_date ON attendance_attendance(student_id, date);
```

## Error Handling

### API Error Responses
- **400 Bad Request**: Invalid parameters, missing required fields
- **404 Not Found**: Student or class not found
- **500 Internal Server Error**: Database errors, unexpected exceptions

### Error Response Format
```json
{
    "error": true,
    "message": "Descriptive error message",
    "details": {
        "field_errors": {},
        "non_field_errors": []
    }
}
```

### Frontend Error Handling
- Form validation before submission
- Network error handling with retry mechanisms
- User-friendly error messages
- Loading states during API calls

## Testing Strategy

### Unit Tests
- Model validation and constraints
- Serializer data transformation
- View logic and permissions
- Database query optimization

### Integration Tests
- API endpoint functionality
- Authentication and authorization
- Cross-app model relationships
- Database transaction integrity

### Frontend Tests
- Component rendering with different data states
- Form submission and validation
- API integration and error handling
- Date picker functionality

### Test Data Setup
- Factory classes for Student, Class, and Attendance models
- Fixtures for different grade levels and attendance scenarios
- Mock API responses for frontend testing

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (student_id, date)
- Efficient queries using select_related and prefetch_related
- Bulk operations for attendance submission

### API Optimization
- Pagination for large attendance history
- Caching for frequently accessed data
- Minimal data transfer with optimized serializers

### Frontend Optimization
- Debounced API calls for date picker changes
- Local state management to reduce API calls
- Optimistic UI updates with rollback on errors

## Security Considerations

### Authentication and Authorization
- Admin-only access for attendance management endpoints
- Student-specific access for attendance history
- Session-based authentication integration

### Data Validation
- Server-side validation for all inputs
- Date range validation
- Student existence validation
- Class enrollment verification

### CORS and CSRF Protection
- Configured CORS for React frontend
- CSRF token validation for state-changing operations
- Secure cookie settings for production deployment