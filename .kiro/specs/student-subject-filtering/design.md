# Design Document

## Overview

The student subject filtering system will enhance the existing student dashboard by ensuring that all sections (marks, practice questions, and book recommendations) display content only for subjects that the student has selected. The system leverages the existing `subjects_selected` many-to-many relationship in the Student model and implements filtering logic across the frontend and backend components.

## Architecture

### Current System Analysis
- **Frontend**: React-based student dashboard with separate sections for marks, practice questions, and book recommendations
- **Backend**: Django REST API with Student model containing `subjects_selected` ManyToManyField
- **Data Flow**: Student authentication → API calls → Dashboard rendering
- **Existing Filtering**: The dashboard already shows selected subjects in the marks table and practice questions dropdown

### Enhanced Architecture
The filtering system will be implemented as:
1. **Backend Enhancement**: Ensure all APIs return subject-filtered data
2. **Frontend Enhancement**: Add subject selection management and consistent filtering
3. **State Management**: Maintain subject selection state across dashboard sections
4. **Fallback Handling**: Graceful handling when no subjects are selected

## Components and Interfaces

### Backend Components

#### 1. Student API Enhancements
**Location**: `institute_backend/accounts/views.py`

**Enhanced Endpoints**:
- `api_get_current_student()` - Already returns `subjects_selected`
- `api_get_student_practice_questions()` - Already filters by student subjects
- **New**: `api_get_student_marks()` - Return marks filtered by selected subjects
- **New**: `api_get_book_recommendations()` - Return recommendations for selected subjects
- **New**: `api_update_student_subjects()` - Allow students to modify subject selection

#### 2. Book Recommendations System
**Location**: `institute_backend/recommendations/`

**New Models**:
```python
class BookRecommendation(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    description = models.TextField()
    isbn = models.CharField(max_length=13, blank=True)
    recommended_for_grade = models.IntegerField()
```

#### 3. Marks System Enhancement
**Location**: `institute_backend/students/` (if exists) or new app

**New Models**:
```python
class StudentMark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_type = models.CharField(max_length=50)  # 'midterm', 'final', 'quiz'
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    exam_date = models.DateField()
```

### Frontend Components

#### 1. Subject Selection Manager
**Location**: `client/components/SubjectSelectionManager.tsx`

**Purpose**: Centralized component for managing student subject selection
**Props**:
- `selectedSubjects: Subject[]`
- `availableSubjects: Subject[]`
- `onSubjectsChange: (subjects: Subject[]) => void`
- `readonly?: boolean`

#### 2. Enhanced Dashboard Sections
**Location**: `client/pages/StudentDashboard.tsx`

**Modifications**:
- **Marks Section**: Filter marks by selected subjects, show empty state
- **Practice Questions**: Already filtered, enhance empty state handling
- **Book Recommendations**: New section with subject-filtered recommendations
- **Subject Selection**: Add inline subject management capability

#### 3. Subject Filter Context
**Location**: `client/contexts/SubjectFilterContext.tsx`

**Purpose**: Manage subject filtering state across dashboard
**State**:
- `selectedSubjects: Subject[]`
- `isLoading: boolean`
- `updateSubjects: (subjects: Subject[]) => Promise<void>`

## Data Models

### Existing Models (Enhanced)
```typescript
// Frontend Types
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
}

interface Subject {
  id: number;
  name: string;
  code: string;
}
```

### New Models
```typescript
// Frontend Types
interface StudentMark {
  id: number;
  subject: Subject;
  exam_type: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  exam_date: string;
}

interface BookRecommendation {
  id: number;
  title: string;
  author: string;
  subject: Subject;
  description: string;
  isbn?: string;
  recommended_for_grade: number;
}

interface DashboardData {
  student: Student;
  marks: StudentMark[];
  practiceQuestions: PracticeQuestion[];
  bookRecommendations: BookRecommendation[];
}
```

## Error Handling

### Backend Error Scenarios
1. **No Subjects Selected**: Return empty arrays with success status
2. **Invalid Subject IDs**: Filter out invalid IDs, log warning
3. **Database Connection Issues**: Return appropriate error responses
4. **Authentication Failures**: Return 401 with clear error messages

### Frontend Error Scenarios
1. **API Failures**: Show error messages with retry options
2. **No Subjects Selected**: Display helpful prompts to select subjects
3. **Loading States**: Show skeleton loaders during data fetching
4. **Network Issues**: Implement offline-friendly error handling

### Error Response Format
```json
{
  "success": false,
  "error": "descriptive_error_code",
  "message": "User-friendly error message",
  "details": "Technical details for debugging"
}
```

## Testing Strategy

### Backend Testing
1. **Unit Tests**: Test filtering logic for each API endpoint
2. **Integration Tests**: Test complete data flow from database to API response
3. **Edge Case Tests**: Empty subject lists, invalid subject IDs, missing data
4. **Performance Tests**: Test with large datasets and multiple concurrent users

### Frontend Testing
1. **Component Tests**: Test individual dashboard sections with various data states
2. **Integration Tests**: Test subject selection flow and dashboard updates
3. **User Experience Tests**: Test loading states, error handling, and empty states
4. **Accessibility Tests**: Ensure proper ARIA labels and keyboard navigation

### Test Scenarios
1. **Happy Path**: Student with selected subjects sees filtered content
2. **Empty State**: Student with no subjects sees appropriate prompts
3. **Subject Change**: Dashboard updates immediately when subjects are modified
4. **Error Recovery**: System gracefully handles API failures and network issues
5. **Performance**: Dashboard loads quickly even with many subjects/data points

## Implementation Considerations

### Performance Optimization
- **Database Queries**: Use `select_related` and `prefetch_related` for efficient queries
- **Caching**: Implement Redis caching for frequently accessed subject data
- **Frontend Optimization**: Use React.memo and useMemo for expensive computations
- **Lazy Loading**: Load dashboard sections progressively

### Security Considerations
- **Authorization**: Ensure students can only access their own data
- **Input Validation**: Validate subject IDs and user inputs
- **CSRF Protection**: Maintain CSRF tokens for state-changing operations
- **Rate Limiting**: Implement rate limiting for API endpoints

### Scalability Considerations
- **Database Indexing**: Add indexes on frequently queried fields
- **API Pagination**: Implement pagination for large datasets
- **Component Reusability**: Design components for reuse across different user types
- **State Management**: Use efficient state management patterns

### Backward Compatibility
- **API Versioning**: Maintain backward compatibility for existing API consumers
- **Graceful Degradation**: Ensure system works even if new features fail
- **Migration Strategy**: Plan for smooth deployment without downtime