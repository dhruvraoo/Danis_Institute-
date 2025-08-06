# Marks Management System

A comprehensive Django REST Framework-based marks management system for educational institutions.

## Features

### 🎯 Core Functionality
- **Exam Management**: Create and manage exams for different classes
- **Marks Entry**: Bulk create/update student marks with validation
- **Student Portal**: Students can view their academic performance
- **Grade Calculation**: Automatic percentage and letter grade calculation
- **Data Validation**: Comprehensive validation for all operations

### 🔒 Security & Permissions
- **Admin Access**: Exam and marks management restricted to administrators
- **Student Access**: Students can only view their own marks
- **Authentication**: Proper authentication and authorization controls
- **Data Integrity**: Database constraints and validation rules

### ⚡ Performance Optimizations
- **Database Indexes**: Optimized queries with proper indexing
- **Query Optimization**: select_related and prefetch_related usage
- **Caching**: Frequently accessed data caching
- **Pagination**: Support for large datasets

## API Endpoints

### 1. Exam Management
```
GET  /api/exams/?class_grade=10
POST /api/exams/
```

**GET Example:**
```bash
curl -H "Authorization: Bearer <admin_token>" \
     "http://localhost:8000/api/exams/?class_grade=10"
```

**POST Example:**
```bash
curl -X POST \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Mid Term Exam",
       "exam_date": "2025-08-15",
       "student_class": 1
     }' \
     "http://localhost:8000/api/exams/"
```

### 2. Marks Management
```
GET  /api/exams/<exam_id>/marks/?student_id=<student_id>
POST /api/exams/<exam_id>/marks/
```

**GET Example:**
```bash
curl -H "Authorization: Bearer <admin_token>" \
     "http://localhost:8000/api/exams/1/marks/?student_id=1"
```

**POST Example:**
```bash
curl -X POST \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "student_id": 1,
       "marks": [
         {"subject_id": 1, "marks_obtained": 85.5, "total_marks": 100},
         {"subject_id": 2, "marks_obtained": 78.0, "total_marks": 100}
       ]
     }' \
     "http://localhost:8000/api/exams/1/marks/"
```

### 3. Student Marks View
```
GET /api/my-marks/?student_id=<student_id>
```

**GET Example:**
```bash
curl -H "Authorization: Bearer <student_token>" \
     "http://localhost:8000/api/my-marks/?student_id=1"
```

## Data Models

### Exam Model
```python
class Exam(models.Model):
    name = models.CharField(max_length=100)
    exam_date = models.DateField()
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Marks Model
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

## Grade System

The system uses the following grading scale:

| Percentage | Grade |
|------------|-------|
| 90-100%    | A+    |
| 80-89%     | A     |
| 70-79%     | B+    |
| 60-69%     | B     |
| 50-59%     | C     |
| 40-49%     | D     |
| Below 40%  | F     |

## Validation Rules

### Exam Validation
- Exam date cannot be in the past
- Exam date cannot be more than one year in the future
- Exam name must be at least 3 characters long
- Unique constraint on (name, exam_date, student_class)

### Marks Validation
- Marks obtained cannot be negative
- Total marks must be greater than zero
- Marks obtained cannot exceed total marks
- Student must belong to the exam's class
- Subject must be available for the student's grade level
- Unique constraint on (student, exam, subject)

## Installation & Setup

1. **Install Dependencies**
   ```bash
   pip install django djangorestframework
   ```

2. **Add to INSTALLED_APPS**
   ```python
   INSTALLED_APPS = [
       # ... other apps
       'marks',
   ]
   ```

3. **Run Migrations**
   ```bash
   python manage.py makemigrations marks
   python manage.py migrate
   ```

4. **Include URLs**
   ```python
   # urls.py
   urlpatterns = [
       # ... other patterns
       path('', include('marks.urls')),
   ]
   ```

## Testing

Run the comprehensive test suite:

```bash
python manage.py test marks
```

The test suite includes:
- Model validation tests
- Serializer validation tests
- API endpoint tests
- Permission and authentication tests
- Error handling tests

## Demo

Run the demo script to see the system in action:

```bash
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'institute_backend.settings')
import django
django.setup()
exec(open('marks/demo.py').read())
"
```

## Admin Interface

The system includes a comprehensive Django admin interface with:

- **Exam Management**: Create, edit, and delete exams
- **Marks Management**: View and edit student marks
- **Filtering & Search**: Advanced filtering and search capabilities
- **Statistics**: Grade distribution and performance analytics

Access the admin interface at: `http://localhost:8000/admin/`

## Performance Features

### Database Optimizations
- Proper indexing on frequently queried fields
- Query optimization with select_related and prefetch_related
- Custom manager methods for common queries

### Caching
- Subject data caching for grade levels
- Configurable cache timeout settings

### Pagination
- Built-in pagination for large datasets
- Configurable page sizes (default: 20, max: 100)

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: Detailed field-level validation messages
- **Permission Errors**: Clear authentication and authorization messages
- **Database Errors**: Graceful handling of constraint violations
- **Logging**: Comprehensive logging for debugging and monitoring

## Future Enhancements

Potential areas for future development:

1. **Bulk Import/Export**: Excel/CSV import/export functionality
2. **Analytics Dashboard**: Advanced reporting and analytics
3. **Notification System**: Email/SMS notifications for results
4. **Mobile API**: Optimized endpoints for mobile applications
5. **Audit Trail**: Complete audit logging for all operations

## Support

For questions or issues, please refer to:
- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- Project Issues: Create an issue in the project repository