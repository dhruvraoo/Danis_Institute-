# Design Document

## Overview

The Marks Management system provides a comprehensive solution for managing student academic performance through structured exam creation and marks tracking. The system builds upon the existing Django models (Student, Subject, Class) and introduces new models (Exam, Marks) to create a more organized approach to academic assessment management.

The design follows Django REST Framework best practices with proper serialization, authentication, and permission controls. The system supports both administrative functions (exam creation, marks entry) and student functions (marks viewing).

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Django API    │    │   Database      │
│   (React)       │◄──►│   (DRF Views)   │◄──►│   (SQLite)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Serializers   │
                       │   & Models      │
                       └─────────────────┘
```

### Data Flow

1. **Admin Workflow**: Admin creates exams → Admin enters marks for students → System validates and stores marks
2. **Student Workflow**: Student authenticates → Student requests marks → System returns filtered marks data

## Components and Interfaces

### Models

#### Exam Model (New)
```python
class Exam(models.Model):
    name = models.CharField(max_length=100)
    exam_date = models.DateField()
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Marks Model (New)
```python
class Marks(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Serializers

#### SubjectSerializer
- Serializes Subject model for API responses
- Fields: id, name, code, grade_levels

#### ExamSerializer
- Handles exam creation and listing
- Fields: id, name, exam_date, student_class, created_at
- Validation: exam_date cannot be in the past, student_class must exist

#### MarksSerializer
- Handles marks data serialization
- Fields: id, student, exam, subject, marks_obtained, total_marks, percentage
- Validation: marks_obtained <= total_marks, both must be positive

#### StudentMarksSerializer
- Specialized serializer for student marks view
- Includes nested exam and subject data
- Groups marks by exam with calculated statistics

### API Views

#### ExamManagementView
- **Endpoint**: `/api/exams/`
- **Methods**: GET, POST
- **Permissions**: IsAdminUser
- **GET**: Returns exams filtered by class_grade parameter
- **POST**: Creates new exam with validation

#### MarksManagementView
- **Endpoint**: `/api/exams/<int:exam_id>/marks/`
- **Methods**: GET, POST
- **Permissions**: IsAdminUser
- **GET**: Returns subjects for class + existing marks for student
- **POST**: Bulk create/update marks using update_or_create

#### StudentMarksView
- **Endpoint**: `/api/my-marks/`
- **Methods**: GET
- **Permissions**: IsAuthenticated (students only)
- **GET**: Returns all marks for authenticated student, grouped by exam

## Data Models

### Database Schema

```mermaid
erDiagram
    Class ||--o{ Student : "belongs to"
    Class ||--o{ Exam : "has"
    Student ||--o{ Marks : "receives"
    Subject ||--o{ Marks : "assessed in"
    Exam ||--o{ Marks : "contains"
    Student }o--o{ Subject : "studies"
    
    Class {
        int id PK
        string name
        int grade_level
        string section
    }
    
    Student {
        int id PK
        string name
        string email
        string password
        string roll_id
        int student_class_id FK
    }
    
    Subject {
        int id PK
        string name
        string code
        string grade_levels
    }
    
    Exam {
        int id PK
        string name
        date exam_date
        int student_class_id FK
        datetime created_at
        datetime updated_at
    }
    
    Marks {
        int id PK
        int student_id FK
        int exam_id FK
        int subject_id FK
        decimal marks_obtained
        decimal total_marks
        datetime created_at
        datetime updated_at
    }
```

### Data Relationships

- **Class** → **Exam**: One-to-Many (A class can have multiple exams)
- **Class** → **Student**: One-to-Many (A class has multiple students)
- **Exam** → **Marks**: One-to-Many (An exam has marks for multiple students/subjects)
- **Student** → **Marks**: One-to-Many (A student has multiple marks records)
- **Subject** → **Marks**: One-to-Many (A subject has marks across multiple exams/students)

## Error Handling

### Validation Errors
- **Exam Creation**: Invalid dates, non-existent classes
- **Marks Entry**: Negative marks, marks exceeding total, invalid student/exam/subject IDs
- **Data Integrity**: Duplicate marks entries, foreign key violations

### HTTP Status Codes
- **200**: Successful GET requests
- **201**: Successful POST requests (creation)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (invalid IDs)
- **500**: Internal Server Error

### Error Response Format
```json
{
    "error": "Validation failed",
    "details": {
        "marks_obtained": ["This field must be less than or equal to total_marks"],
        "exam_date": ["Date cannot be in the past"]
    }
}
```

## Testing Strategy

### Unit Tests
- **Model Tests**: Validate model constraints, relationships, and methods
- **Serializer Tests**: Test validation logic and data transformation
- **View Tests**: Test API endpoints with various scenarios

### Integration Tests
- **Authentication Flow**: Test permission controls across all endpoints
- **Data Flow**: Test complete workflows from exam creation to marks viewing
- **Edge Cases**: Test boundary conditions and error scenarios

### Test Scenarios
1. **Admin creates exam for class** → Verify exam appears in class exam list
2. **Admin enters marks for student** → Verify marks are saved and retrievable
3. **Student views marks** → Verify only own marks are returned
4. **Invalid data submission** → Verify appropriate error responses
5. **Permission violations** → Verify access controls work correctly

### Performance Considerations
- **Database Queries**: Use select_related and prefetch_related for efficient queries
- **Pagination**: Implement pagination for large datasets
- **Caching**: Consider caching frequently accessed data like subjects and classes
- **Indexing**: Ensure proper database indexes on foreign keys and frequently queried fields