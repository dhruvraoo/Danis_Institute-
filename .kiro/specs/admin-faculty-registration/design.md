# Design Document

## Overview

The admin faculty/principal registration system will extend the existing admin dashboard with new registration capabilities. The system will provide dedicated forms for registering faculty members (with class and subject assignments) and principals (with basic credentials) while maintaining separation from the existing login flows.

## Architecture

### Backend Architecture

The system will leverage the existing Django admin authentication system and extend it with new API endpoints for faculty and principal registration. The architecture follows the existing pattern:

- **Models**: Utilize existing `Faculty` and `Principal` models from `accounts.models`
- **Views**: New API endpoints in `accounts.views` for registration functionality
- **Authentication**: Leverage existing admin session authentication
- **Validation**: Server-side validation for form data and duplicate prevention

### Frontend Architecture

The system will extend the existing React-based admin dashboard with new registration components:

- **Admin Dashboard Extension**: Add new "User Management" tab to existing dashboard
- **Registration Forms**: Separate components for faculty and principal registration
- **Form Validation**: Client-side validation with server-side confirmation
- **Success Feedback**: Toast notifications for registration completion

## Components and Interfaces

### Backend Components

#### 1. API Endpoints

**Faculty Registration Endpoint**
- **Path**: `/api/admin/register-faculty/`
- **Method**: POST
- **Authentication**: Admin session required
- **Request Body**:
```json
{
  "name": "string",
  "email": "string", 
  "password": "string",
  "class_ids": [1, 2, 3],
  "subject_ids": [1, 2, 3]
}
```
- **Response**: Success/error message with validation details

**Principal Registration Endpoint**
- **Path**: `/api/admin/register-principal/`
- **Method**: POST
- **Authentication**: Admin session required
- **Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
- **Response**: Success/error message with validation details

**Data Retrieval Endpoints**
- **Path**: `/api/admin/classes/` - Get available classes
- **Path**: `/api/admin/subjects/` - Get available subjects
- **Method**: GET
- **Authentication**: Admin session required

#### 2. View Functions

**Admin Authentication Middleware**
```python
def require_admin_auth(view_func):
    """Decorator to ensure admin authentication"""
    def wrapper(request, *args, **kwargs):
        if not request.session.get('admin_authenticated'):
            return JsonResponse({'success': False, 'message': 'Admin authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper
```

**Registration Views**
- `api_admin_register_faculty()`: Handle faculty registration with validation
- `api_admin_register_principal()`: Handle principal registration with validation
- `api_admin_get_classes()`: Return available classes for selection
- `api_admin_get_subjects()`: Return available subjects for selection

### Frontend Components

#### 1. UserManagement Component
```typescript
interface UserManagementProps {}

const UserManagement: React.FC<UserManagementProps> = () => {
  const [activeForm, setActiveForm] = useState<'faculty' | 'principal' | null>(null);
  // Component logic
}
```

#### 2. FacultyRegistrationForm Component
```typescript
interface FacultyFormData {
  name: string;
  email: string;
  password: string;
  selectedClasses: number[];
  selectedSubjects: number[];
}

const FacultyRegistrationForm: React.FC = () => {
  // Form handling logic
}
```

#### 3. PrincipalRegistrationForm Component
```typescript
interface PrincipalFormData {
  name: string;
  email: string;
  password: string;
}

const PrincipalRegistrationForm: React.FC = () => {
  // Form handling logic
}
```

## Data Models

### Existing Models (No Changes Required)

**Faculty Model** (from `accounts.models.Faculty`)
- `name`: CharField(max_length=100)
- `email`: EmailField(unique=True)
- `password`: CharField(max_length=100)
- `classes`: ManyToManyField(Class, blank=True)
- `subjects`: ManyToManyField(Subject, blank=True)

**Principal Model** (from `accounts.models.Principal`)
- `name`: CharField(max_length=100)
- `email`: EmailField(unique=True)
- `password`: CharField(max_length=100)

**Class Model** (from `accounts.models.Class`)
- `name`: CharField(max_length=20, unique=True)
- `grade_level`: IntegerField()
- `section`: CharField(max_length=5, blank=True)

**Subject Model** (from `accounts.models.Subject`)
- `name`: CharField(max_length=50, unique=True)
- `code`: CharField(max_length=10, unique=True)
- `grade_levels`: CharField(max_length=20, default="9,10,11,12")

### Data Flow

1. **Admin Authentication**: Verify admin session exists
2. **Form Data Collection**: Gather user input from registration forms
3. **Client Validation**: Basic validation on frontend
4. **Server Validation**: Comprehensive validation including duplicate checks
5. **Database Creation**: Create new Faculty/Principal records with relationships
6. **Success Response**: Return confirmation message to frontend
7. **UI Update**: Display success message, reset form

## Error Handling

### Backend Error Handling

**Validation Errors**
- Email already exists
- Invalid email format
- Missing required fields
- Invalid class/subject IDs
- Password strength requirements

**Authentication Errors**
- Admin session not found
- Session expired
- Insufficient permissions

**Database Errors**
- Connection failures
- Constraint violations
- Transaction rollbacks

### Frontend Error Handling

**Form Validation**
- Real-time field validation
- Form submission prevention for invalid data
- Clear error messaging

**API Error Handling**
- Network request failures
- Server error responses
- Timeout handling
- User-friendly error messages

**Success Handling**
- Registration completion confirmation
- Form reset after success
- Navigation guidance

## Testing Strategy

### Backend Testing

**Unit Tests**
- Registration view functions
- Validation logic
- Authentication middleware
- Model relationships

**Integration Tests**
- End-to-end registration flow
- Admin authentication integration
- Database transaction handling
- API endpoint responses

### Frontend Testing

**Component Tests**
- Form rendering and interaction
- Validation behavior
- Success/error state handling
- User input handling

**Integration Tests**
- API communication
- Form submission flow
- Error handling scenarios
- Success feedback display

### Manual Testing Scenarios

1. **Faculty Registration Flow**
   - Admin logs in
   - Accesses user management
   - Fills faculty form with valid data
   - Selects multiple classes and subjects
   - Submits form
   - Verifies success message
   - Confirms faculty can login separately

2. **Principal Registration Flow**
   - Admin logs in
   - Accesses user management
   - Fills principal form with valid data
   - Submits form
   - Verifies success message
   - Confirms principal can login separately

3. **Error Scenarios**
   - Duplicate email registration
   - Invalid form data
   - Network failures
   - Session expiration

4. **Login Separation Verification**
   - Faculty/Principal login through main interface
   - No automatic login after registration
   - Proper dashboard redirection after login