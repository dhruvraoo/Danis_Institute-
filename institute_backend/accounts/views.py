from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .models import Student, Faculty, Principal, Class, Subject, AdminUser

# Dashboard Views
def student_dashboard(request):
    student = validate_student_session(request)
    if not student:
        return redirect('login')
    return render(request, 'dashboard/student.html', {'student': student})

def faculty_dashboard(request):
    if 'faculty_id' not in request.session:
        return redirect('login')
    try:
        faculty = Faculty.objects.get(id=request.session['faculty_id'])
        return render(request, 'dashboard/faculty.html', {'faculty': faculty})
    except Faculty.DoesNotExist:
        return redirect('login')

def principal_dashboard(request):
    if 'principal_id' not in request.session:
        return redirect('login')
    try:
        principal = Principal.objects.get(id=request.session['principal_id'])
        return render(request, 'dashboard/principal.html', {'principal': principal})
    except Principal.DoesNotExist:
        return redirect('login')
import json
import os
import sys
import re

# Authentication middleware
def require_admin_auth(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get('admin_authenticated'):
            return JsonResponse({
                'success': False,
                'message': 'Admin authentication required',
                'redirect_to': '/admin/login'
            }, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

# Authentication helper functions
def create_authentication_error_response(request, message="Not authenticated", error_code="AUTHENTICATION_REQUIRED"):
    """Create standardized authentication error response with debugging info"""
    session_exists = bool(request.session.session_key)
    user_type = request.session.get('user_type')
    student_id = request.session.get('student_id')
    
    return JsonResponse({
        'success': False,
        'error_code': error_code,
        'message': message,
        'redirect_to': '/login',
        'details': {
            'session_exists': session_exists,
            'session_key_exists': bool(request.session.session_key),
            'user_type': user_type,
            'student_id': student_id,
            'suggested_action': 'Please login again to access this resource'
        }
    }, status=401)

def validate_student_session(request):
    """Validate student session using session cookies OR auth token"""
    print(f"=== VALIDATION DEBUG ===")
    print(f"Session key: {request.session.session_key}")
    print(f"Session data: {dict(request.session)}")
    print(f"Cookies received: {dict(request.COOKIES)}")
    print(f"Authorization header: {request.META.get('HTTP_AUTHORIZATION', 'None')}")
    
    # Check for auth token in headers
    auth_token = request.META.get('HTTP_AUTHORIZATION')
    if auth_token and auth_token.startswith('Bearer '):
        token = auth_token.split(' ')[1]
        print(f"🔑 Auth token received: {token}")
        
        # Find session by token
        from django.contrib.sessions.models import Session
        try:
            session_obj = Session.objects.get(session_key=token)
            session_data = session_obj.get_decoded()
            print(f"🔑 Token session data: {session_data}")
            
            if session_data.get('user_type') == 'student' and 'student_id' in session_data:
                student_id = session_data['student_id']
                student = Student.objects.get(id=student_id)
                print(f"✅ Token validation successful for: {student.name}")
                return student
        except (Session.DoesNotExist, Student.DoesNotExist) as e:
            print(f"❌ Token validation failed: {e}")
    else:
        print(f"❌ No valid auth token found")
    
    # Fallback to session cookies
    if 'student_id' not in request.session or request.session.get('user_type') != 'student':
        print(f"❌ Session validation failed - student_id in session: {'student_id' in request.session}, user_type: {request.session.get('user_type')}")
        return None
    
    try:
        student_id = request.session['student_id']
        student = Student.objects.get(id=student_id)
        print(f"✅ Session validation successful for: {student.name}")
        return student
    except Student.DoesNotExist:
        return None

def student_signup(request):
    if request.method == 'POST':
        try:
            name = request.POST['name']
            email = request.POST['email']
            password = request.POST['password']
            roll_id = request.POST['roll_id']
            student_class_id = request.POST['student_class']
            subject_ids = request.POST.getlist('subjects_selected')  # Get multiple subjects
            
            # Get the class object
            from .models import Class
            student_class = Class.objects.get(id=student_class_id)
            
            # Create student
            student = Student.objects.create(
                name=name,
                email=email,
                password=password,
                roll_id=roll_id,
                student_class=student_class
            )
            
            # Add selected subjects
            if subject_ids:
                student.subjects_selected.set(subject_ids)
            
            messages.success(request, 'Student account created successfully!')
            return redirect('student_login')
        except Exception as e:
            messages.error(request, f'Error creating account: {str(e)}')
    
    return render(request, 'signup_student.html')

def student_login(request):
    if request.method == 'POST':
        try:
            email = request.POST['email']
            password = request.POST['password']
            
            student = Student.objects.get(email=email, password=password)
            # Store student info in session
            request.session['student_id'] = student.id
            request.session['student_name'] = student.name
            request.session['user_type'] = 'student'
            
            messages.success(request, f'Welcome back, {student.name}!')
            return redirect('student_dashboard')  # You'll need to create this view
        except Student.DoesNotExist:
            messages.error(request, 'Invalid email or password')
        except Exception as e:
            messages.error(request, f'Login error: {str(e)}')
    
    return render(request, 'login_student.html')

def faculty_login(request):
    if request.method == 'POST':
        try:
            email = request.POST['email']
            password = request.POST['password']
            
            faculty = Faculty.objects.filter(email=email, password=password).first()
            if faculty:
                # Store faculty info in session
                request.session['faculty_id'] = faculty.id
                request.session['faculty_name'] = faculty.name
                request.session['user_type'] = 'faculty'
                
                messages.success(request, f'Welcome back, {faculty.name}!')
                return redirect('faculty_dashboard')
            else:
                messages.error(request, 'Invalid email or password')
        except Exception as e:
            messages.error(request, f'Login error: {str(e)}')
    
    return render(request, 'login_faculty.html')

def principal_login(request):
    if request.method == 'POST':
        try:
            email = request.POST['email']
            password = request.POST['password']
            
            principal = Principal.objects.filter(email=email, password=password).first()
            if principal:
                # Store principal info in session
                request.session['principal_id'] = principal.id
                request.session['principal_name'] = principal.name
                request.session['user_type'] = 'principal'
                
                messages.success(request, f'Welcome back, {principal.name}!')
                return redirect('principal_dashboard')
            else:
                messages.error(request, 'Invalid email or password')
        except Exception as e:
            messages.error(request, f'Login error: {str(e)}')
    
    return render(request, 'login_principal.html')
# API Endpoints for React Frontend

@csrf_exempt
@require_http_methods(["POST"])
def api_student_signup(request):
    try:
        print("=== SIGNUP REQUEST DEBUG ===")
        print(f"Request body: {request.body}")
        data = json.loads(request.body)
        print(f"Parsed data: {data}")
        print(f"Data keys: {list(data.keys())}")
        print(f"student_class_id in data: {'student_class_id' in data}")
        if 'student_class_id' in data:
            print(f"student_class_id value: {repr(data['student_class_id'])}")
        print("==========================")
        
        # Check if email already exists
        if Student.objects.filter(email=data['email']).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email already exists'
            }, status=400)
        
        # Get the class object - handle both field names
        from .models import Class
        class_id = data.get('student_class_id') or data.get('student_class')
        if not class_id:
            return JsonResponse({
                'success': False,
                'message': 'Class ID is required (student_class_id or student_class)'
            }, status=400)
        
        print(f"Received class_id: {repr(class_id)} (type: {type(class_id)})")
        
        # If class_id is a string (class name), try to find by name
        if isinstance(class_id, str) and not class_id.isdigit():
            try:
                student_class = Class.objects.get(name=class_id)
                print(f"Found class by name: {student_class.name} (ID: {student_class.id})")
            except Class.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': f'Class with name "{class_id}" does not exist'
                }, status=400)
        else:
            # Try to get by ID
            try:
                class_id = int(class_id)
                student_class = Class.objects.get(id=class_id)
                print(f"Found class by ID: {student_class.name} (ID: {student_class.id})")
            except (ValueError, Class.DoesNotExist):
                return JsonResponse({
                    'success': False,
                    'message': f'Class with ID {class_id} does not exist'
                }, status=400)
        
        # Create student
        student = Student.objects.create(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            roll_id=data.get('roll_id', f"AUTO_{data['email'].split('@')[0]}"),  # Auto-generate if missing
            student_class=student_class
        )
        
        # Add selected subjects - handle both field names and formats
        subject_ids = data.get('subject_ids') or data.get('subject_selected')
        if subject_ids:
            print(f"Received subject_ids: {repr(subject_ids)} (type: {type(subject_ids)})")
            
            # Convert subject names to IDs if needed
            from .models import Subject
            final_subject_ids = []
            
            # Handle different input formats
            if isinstance(subject_ids, str):
                # Split comma-separated string
                subject_list = [s.strip() for s in subject_ids.split(',')]
            elif isinstance(subject_ids, list):
                subject_list = subject_ids
            else:
                subject_list = [subject_ids]
            
            print(f"Processing subject list: {subject_list}")
            
            for subject_item in subject_list:
                if isinstance(subject_item, str) and not subject_item.isdigit():
                    # It's a subject name, find by exact name first, then try case-insensitive
                    try:
                        subject = Subject.objects.get(name__iexact=subject_item)
                        final_subject_ids.append(subject.id)
                        print(f"Found subject by exact name: {subject.name} (ID: {subject.id})")
                    except Subject.DoesNotExist:
                        # Try partial match but handle multiple results
                        try:
                            subjects = Subject.objects.filter(name__icontains=subject_item)
                            if subjects.count() == 1:
                                subject = subjects.first()
                                final_subject_ids.append(subject.id)
                                print(f"Found subject by partial name: {subject.name} (ID: {subject.id})")
                            elif subjects.count() > 1:
                                print(f"Multiple subjects found for '{subject_item}': {[s.name for s in subjects]}")
                                # Take the first exact match or shortest name
                                subject = min(subjects, key=lambda s: len(s.name))
                                final_subject_ids.append(subject.id)
                                print(f"Using shortest match: {subject.name} (ID: {subject.id})")
                            else:
                                print(f"Subject not found: {subject_item}")
                                continue
                        except Exception as e:
                            print(f"Error finding subject '{subject_item}': {e}")
                            continue
                    except Subject.MultipleObjectsReturned:
                        print(f"Multiple exact matches for '{subject_item}'")
                        continue
                else:
                    # It's already an ID
                    try:
                        final_subject_ids.append(int(subject_item))
                    except ValueError:
                        print(f"Invalid subject ID: {subject_item}")
                        continue
            
            print(f"Final subject IDs: {final_subject_ids}")
            student.subjects_selected.set(final_subject_ids)
        
        # Auto-login the user after successful signup
        request.session['student_id'] = student.id
        request.session['student_name'] = student.name
        request.session['user_type'] = 'student'
        
        print(f"Auto-login successful for student: {student.name} (ID: {student.id})")
        
        return JsonResponse({
            'success': True,
            'message': f'Account created successfully! Welcome, {student.name}!',
            'user': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_id': student.roll_id,
                'student_class': {
                    'id': student.student_class.id,
                    'name': student.student_class.name,
                    'grade_level': student.student_class.grade_level,
                    'section': student.student_class.section
                },
                'subjects_selected': [
                    {
                        'id': subject.id,
                        'name': subject.name,
                        'code': subject.code
                    } for subject in student.subjects_selected.all()
                ],
                'user_type': 'student'
            }
        })
        
    except KeyError as e:
        print(f"Missing field error: {str(e)}")
        print(f"Received data: {data}")
        print(f"Available keys: {list(data.keys())}")
        
        # Check if the field exists but is empty
        field_name = str(e).strip("'")
        if field_name in data:
            print(f"Field {field_name} exists but has value: {repr(data[field_name])}")
        
        return JsonResponse({
            'success': False,
            'message': f'Missing required field: {field_name}. Received fields: {list(data.keys())}'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error creating account: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_student_login(request):
    try:
        print("=== STUDENT LOGIN DEBUG ===")
        data = json.loads(request.body)
        email = data['email']
        password = data['password']
        print(f"Login attempt - Email: {repr(email)}, Password: {repr(password)}")
        
        # Check if student exists with this email
        try:
            student_by_email = Student.objects.get(email=email)
            print(f"Student found by email: {student_by_email.name}")
            print(f"Stored password: {repr(student_by_email.password)}")
            print(f"Provided password: {repr(password)}")
            print(f"Passwords match: {student_by_email.password == password}")
        except Student.DoesNotExist:
            print(f"No student found with email: {email}")
        
        student = Student.objects.get(email=email, password=password)
        
        # Store in session
        request.session['student_id'] = student.id
        request.session['student_name'] = student.name
        request.session['user_type'] = 'student'
        
        # Force session save
        request.session.save()
        
        print(f"=== LOGIN DEBUG ===")
        print(f"Student logged in: {student.name}")
        print(f"Session key: {request.session.session_key}")
        print(f"Session data: {dict(request.session)}")
        
        # Generate a simple auth token (session key)
        auth_token = request.session.session_key
        
        response = JsonResponse({
            'success': True,
            'message': f'Welcome back, {student.name}!',
            'auth_token': auth_token,  # Send token to frontend
            'user': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_id': student.roll_id,
                'student_class': {
                    'id': student.student_class.id,
                    'name': student.student_class.name,
                    'grade_level': student.student_class.grade_level
                },
                'subjects_selected': [
                    {
                        'id': subject.id,
                        'name': subject.name,
                        'code': subject.code
                    } for subject in student.subjects_selected.all()
                ],
                'user_type': 'student'
            }
        })
        
        return response
        
    except Student.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Invalid email or password'
        }, status=401)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Login error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_faculty_login(request):
    try:
        data = json.loads(request.body)
        faculty = Faculty.objects.get(email=data.get('email'))
        
        if not faculty.check_password(data.get('password')):
            return JsonResponse({
                'success': False,
                'message': 'Invalid password'
            }, status=401)
            
        request.session['faculty_id'] = faculty.id
        request.session['faculty_name'] = faculty.name
        request.session['user_type'] = 'faculty'
        request.session.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Welcome back, {faculty.name}!',
            'auth_token': request.session.session_key,
            'redirect_to': '/teacher-dashboard',  # Add redirect path
            'user': {
                'id': faculty.id,
                'name': faculty.name,
                'email': faculty.email,
                'subjects': [{
                    'id': s.id,
                    'name': s.name,
                    'code': s.code
                } for s in faculty.subjects.all()],
                'classes': [{
                    'id': c.id,
                    'name': c.name,
                    'grade_level': c.grade_level
                } for c in faculty.classes.all()],
                'user_type': 'faculty'
            }
        })
    except Faculty.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Faculty not found'
        }, status=401)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Login error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_faculty_signup(request):
    try:
        data = json.loads(request.body)
        
        # Check if email already exists
        if Faculty.objects.filter(email=data['email']).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email already exists'
            }, status=400)
            
        # Create faculty member
        faculty = Faculty.objects.create(
            name=data['name'],
            email=data['email'],
            password=data['password'],  # In production, use proper password hashing
            department=data.get('department', ''),
            employee_id=data.get('employee_id', f"FAC_{data['email'].split('@')[0]}")
        )
        
        # Add subjects if provided
        if 'subjects' in data:
            faculty.subjects.set(data['subjects'])
            
        # Add classes if provided
        if 'classes' in data:
            faculty.classes.set(data['classes'])
            
        return JsonResponse({
            'success': True,
            'message': 'Faculty account created successfully!',
            'user': {
                'id': faculty.id,
                'name': faculty.name,
                'email': faculty.email,
                'department': faculty.department,
                'employee_id': faculty.employee_id,
                'user_type': 'faculty'
            }
        })
            
    except KeyError as e:
        return JsonResponse({
            'success': False,
            'message': f'Missing required field: {str(e)}'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error creating faculty account: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_principal_signup(request):
    try:
        data = json.loads(request.body)
        
        # Check if email already exists
        if Principal.objects.filter(email=data['email']).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email already exists'
            }, status=400)
            
        # Create principal
        principal = Principal.objects.create(
            name=data['name'],
            email=data['email'],
            password=data['password'],  # In production, use proper password hashing
            school_name=data.get('school_name', ''),
            employee_id=data.get('employee_id', f"PRIN_{data['email'].split('@')[0]}")
        )
            
        return JsonResponse({
            'success': True,
            'message': 'Principal account created successfully!',
            'user': {
                'id': principal.id,
                'name': principal.name,
                'email': principal.email,
                'school_name': principal.school_name,
                'employee_id': principal.employee_id,
                'user_type': 'principal'
            }
        })
            
    except KeyError as e:
        return JsonResponse({
            'success': False,
            'message': f'Missing required field: {str(e)}'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error creating principal account: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_principal_login(request):
    try:
        print("=== PRINCIPAL LOGIN DEBUG ===")
        data = json.loads(request.body)
        email = data['email']
        password = data['password']
        print(f"Principal login attempt - Email: {repr(email)}, Password: {repr(password)}")
        
        # Find principal by email first
        try:
            principal = Principal.objects.get(email=email)
            print(f"Principal found by email: {principal.name}")
            
            # Check password using the proper method
            if principal.check_password(password):
                print(f"Password check successful for principal: {principal.name}")
                
                # Store in session
                request.session['principal_id'] = principal.id
                request.session['principal_name'] = principal.name
                request.session['user_type'] = 'principal'
                
                # Force session save
                request.session.save()
                
                print(f"=== PRINCIPAL LOGIN SUCCESS ===")
                print(f"Principal logged in: {principal.name}")
                print(f"Session key: {request.session.session_key}")
                print(f"Session data: {dict(request.session)}")
                
                # Generate a simple auth token (session key)
                auth_token = request.session.session_key
                
                return JsonResponse({
                    'success': True,
                    'message': f'Welcome back, {principal.name}!',
                    'auth_token': auth_token,  # Send token to frontend
                    'redirect_to': '/dashboard/principal',  # Use the consistent dashboard path
                    'user': {
                        'id': principal.id,
                        'name': principal.name,
                        'email': principal.email,
                        'user_type': 'principal'
                    }
                })
            else:
                print(f"Password check failed for principal: {principal.name}")
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid email or password'
                }, status=401)
                
        except Principal.DoesNotExist:
            print(f"No principal found with email: {email}")
            return JsonResponse({
                'success': False,
                'message': 'Invalid email or password'
            }, status=401)
            
    except Exception as e:
        print(f"Principal login error: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Login error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    try:
        request.session.flush()  # Clear all session data
        return JsonResponse({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Logout error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_check_auth(request):
    """Check if user is authenticated and return user data"""
    try:
        print("=== CHECK AUTH DEBUG ===")
        print(f"Session key: {request.session.session_key}")
        print(f"Session data: {dict(request.session)}")
        print(f"Authorization header: {request.META.get('HTTP_AUTHORIZATION', 'None')}")
        
        # Check for auth token in headers first
        auth_token = request.META.get('HTTP_AUTHORIZATION')
        if auth_token and auth_token.startswith('Bearer '):
            token = auth_token.split(' ')[1]
            print(f"🔑 Auth token received: {token}")
            
            # Find session by token
            from django.contrib.sessions.models import Session
            try:
                session_obj = Session.objects.get(session_key=token)
                session_data = session_obj.get_decoded()
                print(f"🔑 Token session data: {session_data}")
                
                # Check user type and get user data
                if session_data.get('user_type') == 'student' and 'student_id' in session_data:
                    student = Student.objects.get(id=session_data['student_id'])
                    return JsonResponse({
                        'success': True,
                        'authenticated': True,
                        'user': {
                            'id': student.id,
                            'name': student.name,
                            'email': student.email,
                            'roll_id': student.roll_id,
                            'student_class': {
                                'id': student.student_class.id,
                                'name': student.student_class.name,
                                'grade_level': student.student_class.grade_level,
                                'section': student.student_class.section
                            },
                            'subjects_selected': [
                                {
                                    'id': subject.id,
                                    'name': subject.name,
                                    'code': subject.code
                                } for subject in student.subjects_selected.all()
                            ],
                            'user_type': 'student'
                        }
                    })
                elif session_data.get('user_type') == 'faculty' and 'faculty_id' in session_data:
                    faculty = Faculty.objects.get(id=session_data['faculty_id'])
                    return JsonResponse({
                        'success': True,
                        'authenticated': True,
                        'user': {
                            'id': faculty.id,
                            'name': faculty.name,
                            'email': faculty.email,
                            'user_type': 'faculty'
                        }
                    })
                elif session_data.get('user_type') == 'principal' and 'principal_id' in session_data:
                    principal = Principal.objects.get(id=session_data['principal_id'])
                    return JsonResponse({
                        'success': True,
                        'authenticated': True,
                        'user': {
                            'id': principal.id,
                            'name': principal.name,
                            'email': principal.email,
                            'user_type': 'principal'
                        }
                    })
            except (Session.DoesNotExist, Student.DoesNotExist, Faculty.DoesNotExist, Principal.DoesNotExist) as e:
                print(f"❌ Token validation failed: {e}")
        
        # Fallback to session cookies
        user_type = request.session.get('user_type')
        if user_type == 'student' and 'student_id' in request.session:
            try:
                student = Student.objects.get(id=request.session['student_id'])
                return JsonResponse({
                    'success': True,
                    'authenticated': True,
                    'user': {
                        'id': student.id,
                        'name': student.name,
                        'email': student.email,
                        'roll_id': student.roll_id,
                        'student_class': {
                            'id': student.student_class.id,
                            'name': student.student_class.name,
                            'grade_level': student.student_class.grade_level,
                            'section': student.student_class.section
                        },
                        'subjects_selected': [
                            {
                                'id': subject.id,
                                'name': subject.name,
                                'code': subject.code
                            } for subject in student.subjects_selected.all()
                        ],
                        'user_type': 'student'
                    }
                })
            except Student.DoesNotExist:
                pass
        elif user_type == 'faculty' and 'faculty_id' in request.session:
            try:
                faculty = Faculty.objects.get(id=request.session['faculty_id'])
                return JsonResponse({
                    'success': True,
                    'authenticated': True,
                    'user': {
                        'id': faculty.id,
                        'name': faculty.name,
                        'email': faculty.email,
                        'user_type': 'faculty'
                    }
                })
            except Faculty.DoesNotExist:
                pass
        elif user_type == 'principal' and 'principal_id' in request.session:
            try:
                principal = Principal.objects.get(id=request.session['principal_id'])
                return JsonResponse({
                    'success': True,
                    'authenticated': True,
                    'user': {
                        'id': principal.id,
                        'name': principal.name,
                        'email': principal.email,
                        'user_type': 'principal'
                    }
                })
            except Principal.DoesNotExist:
                pass
        
        # Not authenticated
        return JsonResponse({
            'success': True,
            'authenticated': False,
            'user': None
        })
        
    except Exception as e:
        print(f"Check auth error: {e}")
        return JsonResponse({
            'success': False,
            'authenticated': False,
            'message': f'Error checking authentication: {str(e)}'
        }, status=500)

# API endpoints to fetch classes and subjects for frontend
@csrf_exempt
@require_http_methods(["GET"])
def api_get_classes(request):
    try:
        from .models import Class
        classes = Class.objects.all()
        classes_data = [
            {
                'id': cls.id,
                'name': cls.name,
                'grade_level': cls.grade_level,
                'section': cls.section
            } for cls in classes
        ]
        
        return JsonResponse({
            'success': True,
            'classes': classes_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching classes: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_get_subjects(request):
    try:
        from .models import Subject
        
        # Get grade level from query parameter (for signup)
        grade_level = request.GET.get('grade_level')
        
        if grade_level:
            try:
                grade_level = int(grade_level)
                # Filter subjects by grade level
                subjects = [s for s in Subject.objects.all() if s.is_available_for_grade(grade_level)]
                print(f"Filtering subjects for grade {grade_level}: {[s.name for s in subjects]}")
            except ValueError:
                # If invalid grade level, return all subjects
                subjects = Subject.objects.all()
        else:
            # If no grade level specified, return all subjects
            subjects = Subject.objects.all()
        
        subjects_data = [
            {
                'id': subject.id,
                'name': subject.name,
                'code': subject.code,
                'grade_levels': subject.grade_levels
            } for subject in subjects
        ]
        
        return JsonResponse({
            'success': True,
            'subjects': subjects_data,
            'filtered_by_grade': grade_level if grade_level else None
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching subjects: {str(e)}'
        }, status=500)

# API endpoint to get current student's data
@csrf_exempt
@require_http_methods(["GET"])
def api_get_current_student(request):
    try:
        # Validate student session using helper function
        student = validate_student_session(request)
        if not student:
            return create_authentication_error_response(
                request, 
                "Not authenticated as student", 
                "STUDENT_AUTHENTICATION_REQUIRED"
            )
        
        return JsonResponse({
            'success': True,
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_id': student.roll_id,
                'student_class': {
                    'id': student.student_class.id,
                    'name': student.student_class.name,
                    'grade_level': student.student_class.grade_level,
                    'section': student.student_class.section
                },
                'subjects_selected': [
                    {
                        'id': subject.id,
                        'name': subject.name,
                        'code': subject.code
                    } for subject in student.subjects_selected.all()
                ]
            }
        })          
        
    except Student.DoesNotExist:
        return create_authentication_error_response(
            request,
            "Student account not found in database",
            "STUDENT_NOT_FOUND"
        )
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error fetching student data: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# API endpoint to get practice questions for student's subjects
@csrf_exempt
@require_http_methods(["GET"])
def api_get_student_practice_questions(request):
    try:
        # Validate student session using helper function
        student = validate_student_session(request)
        if not student:
            return create_authentication_error_response(
                request, 
                "Not authenticated as student", 
                "STUDENT_AUTHENTICATION_REQUIRED"
            )
        
        # Get student's subjects that are appropriate for their grade level
        student_grade = student.student_class.grade_level
        student_subjects = student.subjects_selected.filter(
            grade_levels__contains=str(student_grade)
        )
        
        # For now, return mock practice questions based on subjects
        # You can later integrate with your questions app
        practice_questions = []
        for subject in student_subjects:
            practice_questions.extend([
                {
                    'id': f'{subject.id}_q1',
                    'subject': subject.name,
                    'subject_code': subject.code,
                    'question': f'Sample {subject.name} question 1',
                    'difficulty': 'Easy',
                    'type': 'Multiple Choice'
                },
                {
                    'id': f'{subject.id}_q2',
                    'subject': subject.name,
                    'subject_code': subject.code,
                    'question': f'Sample {subject.name} question 2',
                    'difficulty': 'Medium',
                    'type': 'Short Answer'
                }
            ])
        
        return JsonResponse({
            'success': True,
            'questions': practice_questions,
            'subjects': [
                {
                    'id': subject.id,
                    'name': subject.name,
                    'code': subject.code
                } for subject in student_subjects
            ]
        })
        
    except Student.DoesNotExist:
        return create_authentication_error_response(
            request,
            "Student account not found in database",
            "STUDENT_NOT_FOUND"
        )
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error fetching practice questions: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# API endpoint to get student marks filtered by selected subjects
@csrf_exempt
@require_http_methods(["GET"])
def api_get_student_marks(request):
    try:
        # Validate student session using helper function
        student = validate_student_session(request)
        if not student:
            return create_authentication_error_response(
                request, 
                "Not authenticated as student", 
                "STUDENT_AUTHENTICATION_REQUIRED"
            )
        
        # Get student's selected subjects that are appropriate for their grade level
        student_grade = student.student_class.grade_level
        student_subjects = student.subjects_selected.filter(
            grade_levels__contains=str(student_grade)
        )
        
        if not student_subjects.exists():
            return JsonResponse({
                'success': True,
                'marks': [],
                'subject_averages': {},
                'subjects_count': 0,
                'total_marks_count': 0,
                'message': 'No subjects selected for the current grade level'
            })
        
        # Get marks for selected subjects only
        marks = StudentMark.objects.filter(
            student=student,
            subject__in=student_subjects
        ).select_related('subject').order_by('-exam_date', 'subject__name')
        
        # Format marks data
        marks_data = []
        for mark in marks:
            marks_data.append({
                'id': mark.id,
                'subject': mark.subject.name,
                'exam_date': mark.exam_date,
                'marks_obtained': mark.marks_obtained,
                'total_marks': mark.total_marks,
                'percentage': (mark.marks_obtained / mark.total_marks) * 100 if mark.total_marks else 0
            })
        
        # Calculate subject-wise averages
        subject_averages = {}
        for subject in student_subjects:
            subject_marks = [m for m in marks_data if m['subject'] == subject.name]
            if subject_marks:
                avg = sum(m['percentage'] for m in subject_marks) / len(subject_marks)
                subject_averages[subject.name] = round(avg, 2)
            else:
                subject_averages[subject.name] = 0
        
        return JsonResponse({
            'success': True,
            'marks': marks_data,
            'subject_averages': subject_averages,
            'subjects_count': len(student_subjects),
            'total_marks_count': len(marks_data)
        })
        
    except Student.DoesNotExist:
        return create_authentication_error_response(
            request,
            "Student account not found in database",
            "STUDENT_NOT_FOUND"
        )
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error fetching marks: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# API endpoint to get book recommendations filtered by selected subjects
@csrf_exempt
@require_http_methods(["GET"])
def api_get_book_recommendations(request):
    try:
        # Validate student session using helper function
        student = validate_student_session(request)
        if not student:
            return create_authentication_error_response(
                request, 
                "Not authenticated as student", 
                "STUDENT_AUTHENTICATION_REQUIRED"
            )
            
        # Get recommendations for student's subjects
        recommendations = BookRecommendation.objects.filter(
            subject__in=student.subjects_selected.all()
        ).select_related('subject')
        
        return JsonResponse({
            'success': True,
            'recommendations': [
                {
                    'id': rec.id,
                    'title': rec.title,
                    'author': rec.author,
                    'subject': rec.subject.name,
                    'description': rec.description,
                    'difficulty_level': rec.difficulty_level,
                    'url': rec.url if hasattr(rec, 'url') else None
                } for rec in recommendations
            ]
        })
        
    except Student.DoesNotExist:
        return create_authentication_error_response(
            request,
            "Student account not found in database",
            "STUDENT_NOT_FOUND"
        )
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error fetching book recommendations: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# API endpoint to update student's selected subjects
@csrf_exempt
@require_http_methods(["POST"])
def api_update_student_subjects(request):
    try:
        # Validate student session using helper function
        student = validate_student_session(request)
        if not student:
            return create_authentication_error_response(
                request, 
                "Not authenticated as student", 
                "STUDENT_AUTHENTICATION_REQUIRED"
            )
        
        # Parse request data
        try:
            data = json.loads(request.body)
            subject_ids = data.get('subject_ids', [])
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error_code': 'INVALID_JSON',
                'message': 'Invalid JSON data provided',
                'details': {
                    'suggested_action': 'Please provide valid JSON data with subject_ids array'
                }
            }, status=400)
        
        # Validate subject IDs
        if not isinstance(subject_ids, list):
            return JsonResponse({
                'success': False,
                'error_code': 'INVALID_SUBJECT_IDS',
                'message': 'subject_ids must be an array of integers',
                'details': {
                    'provided_type': type(subject_ids).__name__,
                    'suggested_action': 'Provide subject_ids as an array of subject ID integers'
                }
            }, status=400)
        
        # Validate that all subject IDs exist
        from .models import Subject
        valid_subjects = Subject.objects.filter(id__in=subject_ids)
        valid_subject_ids = list(valid_subjects.values_list('id', flat=True))
        
        invalid_ids = [sid for sid in subject_ids if sid not in valid_subject_ids]
        if invalid_ids:
            return JsonResponse({
                'success': False,
                'error_code': 'INVALID_SUBJECT_IDS',
                'message': f'Invalid subject IDs provided: {invalid_ids}',
                'details': {
                    'invalid_ids': invalid_ids,
                    'valid_ids': valid_subject_ids,
                    'suggested_action': 'Please provide only valid subject IDs'
                }
            }, status=400)
        
        # Update student's selected subjects
        student.subjects_selected.set(valid_subjects)
        
        # Return updated student data
        updated_subjects = student.subjects_selected.all()
        subjects_data = [
            {
                'id': subject.id,
                'name': subject.name,
                'code': subject.code
            } for subject in updated_subjects
        ]
        
        return JsonResponse({
            'success': True,
            'message': 'Subjects updated successfully',
            'subjects': subjects_data,
            'subjects_count': len(subjects_data),
            'student': {
                'id': student.id,
                'name': student.name,
                'roll_id': student.roll_id
            }
        })
        
    except Student.DoesNotExist:
        return create_authentication_error_response(
            request,
            "Student account not found in database",
            "STUDENT_NOT_FOUND"
        )
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error updating student subjects: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# Debug page to test authentication
def debug_auth_page(request):
    """Serve the debug authentication page"""
    from django.http import HttpResponse
    
    debug_file_path = os.path.join(settings.BASE_DIR, 'debug_auth.html')
    try:
        with open(debug_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse("Debug page not found", status=404)

# Debug endpoint to check session and cookies
@csrf_exempt
@require_http_methods(["GET"])
def api_debug_session(request):
    """Debug endpoint to check session data and cookies"""
    return JsonResponse({
        'success': True,
        'session_key': request.session.session_key,
        'session_data': dict(request.session),
        'cookies': dict(request.COOKIES),
        'headers': {
            'origin': request.META.get('HTTP_ORIGIN'),
            'user_agent': request.META.get('HTTP_USER_AGENT'),
            'referer': request.META.get('HTTP_REFERER'),
        },
        'is_authenticated': 'student_id' in request.session and request.session.get('user_type') == 'student'
    })


# API endpoint to check current authentication status
@csrf_exempt
@require_http_methods(["GET"])
def api_check_auth(request):
    """
    Check current authentication status and return user data if authenticated
    """
    try:
        # Try to validate student session (handles both cookies and tokens)
        student = validate_student_session(request)
        if student:
            return JsonResponse({
                'success': True,
                'authenticated': True,
                'user_type': 'student',
                'user': {
                    'id': student.id,
                    'name': student.name,
                    'email': student.email,
                    'roll_id': student.roll_id,
                    'student_class': {
                        'id': student.student_class.id,
                        'name': student.student_class.name,
                        'grade_level': student.student_class.grade_level,
                        'section': student.student_class.section
                    },
                    'subjects_selected': [
                        {
                            'id': subject.id,
                            'name': subject.name,
                            'code': subject.code
                        } for subject in student.subjects_selected.all()
                    ],
                    'user_type': 'student'
                }
            })
        
        # No valid student authentication found
        return JsonResponse({
            'success': True,
            'authenticated': False,
            'user_type': None,
            'user': None,
            'message': 'No active authentication session'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error checking authentication status: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# Fake News Detection API
import os
import sys

# Add the parent directory to Python path to import fake_news_detector
parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(parent_dir)

try:
    from news.detector.fake_news_detector import FakeNewsDetector
    DETECTOR_AVAILABLE = True
except ImportError:
    DETECTOR_AVAILABLE = False
    print("Warning: fake_news_detector module not available")

# Global detector instance
fake_news_detector = None

def initialize_fake_news_detector():
    """Initialize the fake news detector"""
    global fake_news_detector
    if DETECTOR_AVAILABLE and fake_news_detector is None:
        try:
            fake_news_detector = FakeNewsDetector()
            # Try multiple possible model paths
            possible_paths = [
                os.path.join(parent_dir, 'saved_model'),  # Original path
                os.path.join(os.path.dirname(parent_dir), 'saved_model'),  # One level up
                './saved_model',  # Relative to current directory
                '../saved_model',  # One level up from current
            ]
            
            model_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    model_path = path
                    print(f"Found model at: {model_path}")
                    break
            
            if model_path and fake_news_detector.load_model(model_path):
                print("Fake news detector loaded successfully!")
                return True
            else:
                print("Failed to load saved model")
                print(f"Tried paths: {possible_paths}")
                return False
        except Exception as e:
            print(f"Error initializing detector: {e}")
            return False
    return fake_news_detector is not None

@csrf_exempt
@require_http_methods(["POST"])
def api_detect_fake_news(request):
    """
    Django API endpoint for fake news detection
    
    Expected JSON payload:
    {
        "text": "News article text to analyze"
    }
    
    Returns:
    {
        "success": true/false,
        "prediction": "Fake"/"Real",
        "confidence": 0.95,
        "message": "Analysis complete"
    }
    """
    try:
        # Parse request data
        data = json.loads(request.body)
        text = data.get('text', '').strip()
        
        if not text:
            return JsonResponse({
                'success': False,
                'message': 'No text provided for analysis'
            }, status=400)
        
        if len(text) < 50:
            return JsonResponse({
                'success': False,
                'message': 'Text too short for reliable analysis (minimum 50 characters)'
            }, status=400)
        
        # Initialize detector if not already done
        if not initialize_fake_news_detector():
            # Return mock prediction for demo purposes when model is not available
            import random
            is_real = random.random() > 0.5
            return JsonResponse({
                'success': True,
                'prediction': 'Real' if is_real else 'Fake',
                'confidence': round(random.uniform(0.7, 0.95), 4),
                'message': f'Analysis complete (Demo Mode). The news appears to be {"real" if is_real else "fake"}.',
                'demo_mode': True,
                'analysis_details': {
                    'text_length': len(text),
                    'model_confidence': round((random.uniform(0.7, 0.95)) * 100, 2)
                }
            })
        
        # Make prediction with real model
        try:
            label, confidence = fake_news_detector.predict(text)
            
            return JsonResponse({
                'success': True,
                'prediction': label,
                'confidence': round(confidence, 4),
                'message': f'Analysis complete. The news appears to be {label.lower()}.',
                'demo_mode': False,
                'analysis_details': {
                    'text_length': len(text),
                    'model_confidence': round(confidence * 100, 2)
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error during prediction: {str(e)}'
            }, status=500)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Server error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_fake_news_status(request):
    """
    Check if the fake news detector is available and ready
    """
    try:
        model_path = os.path.join(parent_dir, 'saved_model')
        model_available = os.path.exists(model_path)
        detector_ready = initialize_fake_news_detector()
        
        return JsonResponse({
            'success': True,
            'detector_available': DETECTOR_AVAILABLE,
            'model_saved': model_available,
            'detector_ready': detector_ready,
            'demo_mode': not detector_ready,
            'message': 'Detector status retrieved successfully'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error checking detector status: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_login(request):
    """
    Admin authentication endpoint for dashboard access
    """
    try:
        data = json.loads(request.body)
        username = data.get('username', '')
        password = data.get('password', '')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'message': 'Username and password are required'
            }, status=400)
        
        # Import AdminUser model
        from .models import AdminUser
        
        try:
            admin_user = AdminUser.objects.get(username=username, is_active=True)
            
            if admin_user.check_password(password):
                # Store admin session info
                request.session['admin_authenticated'] = True
                request.session['admin_username'] = username
                
                return JsonResponse({
                    'success': True,
                    'message': 'Admin authenticated successfully',
                    'username': username
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid username or password'
                }, status=401)
                
        except AdminUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Invalid username or password'
            }, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': 'Server error occurred'
        }, status=500)
# API endpoint to update student's subject selection with grade-level validation
@csrf_exempt
@require_http_methods(["POST"])
def api_update_student_subjects(request):
    try:
        # Validate student session using helper function
        student = validate_student_session(request)
        if not student:
            return create_authentication_error_response(
                request, 
                "Not authenticated as student", 
                "STUDENT_AUTHENTICATION_REQUIRED"
            )
        
        data = json.loads(request.body)
        subject_ids = data.get('subject_ids', [])
        
        if not isinstance(subject_ids, list):
            return JsonResponse({
                'success': False,
                'message': 'subject_ids must be a list of subject IDs'
            }, status=400)
        
        # Get student's grade level
        student_grade = student.student_class.grade_level
        
        # Validate that all selected subjects are appropriate for the student's grade
        from .models import Subject
        valid_subjects = []
        invalid_subjects = []
        
        for subject_id in subject_ids:
            try:
                subject = Subject.objects.get(id=subject_id)
                if subject.is_available_for_grade(student_grade):
                    valid_subjects.append(subject)
                else:
                    invalid_subjects.append({
                        'id': subject.id,
                        'name': subject.name,
                        'available_grades': subject.grade_levels
                    })
            except Subject.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': f'Subject with ID {subject_id} does not exist'
                }, status=400)
        
        # If there are invalid subjects, return error with details
        if invalid_subjects:
            return JsonResponse({
                'success': False,
                'message': f'Some subjects are not available for grade {student_grade}',
                'invalid_subjects': invalid_subjects,
                'student_grade': student_grade
            }, status=400)
        
        # Update student's subjects
        student.subjects_selected.set(valid_subjects)
        
        # Return updated student data
        updated_subjects = student.subjects_selected.filter(
            grade_levels__contains=str(student_grade)
        )
        subjects_data = [
            {
                'id': subject.id,
                'name': subject.name,
                'code': subject.code
            } for subject in updated_subjects
        ]
        
        return JsonResponse({
            'success': True,
            'message': 'Subjects updated successfully',
            'subjects_selected': subjects_data,
            'subjects_count': len(subjects_data)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error updating subjects: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# API endpoint to get available subjects for student's grade level
@csrf_exempt
@require_http_methods(["GET"])
def api_get_available_subjects(request):
    try:
        # Validate student session using helper function
        student = validate_student_session(request)
        if not student:
            return create_authentication_error_response(
                request, 
                "Not authenticated as student", 
                "STUDENT_AUTHENTICATION_REQUIRED"
            )
        
        # Get student's grade level
        student_grade = student.student_class.grade_level
        
        # Get all subjects available for this grade level
        from .models import Subject
        available_subjects = Subject.objects.filter(
            grade_levels__contains=str(student_grade)
        ).order_by('name')
        
        subjects_data = [
            {
                'id': subject.id,
                'name': subject.name,
                'code': subject.code,
                'grade_levels': subject.grade_levels
            } for subject in available_subjects
        ]
        
        return JsonResponse({
            'success': True,
            'available_subjects': subjects_data,
            'student_grade': student_grade,
            'total_count': len(subjects_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': f'Error fetching available subjects: {str(e)}',
            'details': {
                'error_type': type(e).__name__,
                'suggested_action': 'Please try again or contact support if the problem persists'
            }
        }, status=500)

# Admin authentication middleware decorator
def require_admin_auth(view_func):
    """Decorator to ensure admin authentication"""
    def wrapper(request, *args, **kwargs):
        if not request.session.get('admin_authenticated'):
            return JsonResponse({
                'success': False, 
                'message': 'Admin authentication required'
            }, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

# API endpoint for admin to register new faculty
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
@require_http_methods(["POST", "OPTIONS"])
@require_admin_auth
def api_admin_register_faculty(request):
    """
    Admin endpoint to register new faculty members
    """
    if request.method == "OPTIONS":
        response = HttpResponse()
        response["Access-Control-Allow-Origin"] = "http://localhost:8080"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
        return response

    try:
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'password', 'classes', 'subjects']
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    'success': False,
                    'message': f'{field.capitalize()} is required'
                }, status=400)
        
        name = data['full_name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        classes = data.get('classes', [])
        subjects = data.get('subjects', [])
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return JsonResponse({
                'success': False,
                'message': 'Invalid email format'
            }, status=400)
        
        # Check if email already exists
        if Faculty.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email already exists'
            }, status=400)
        
        # Validate class IDs
        from .models import Class
        valid_classes = []
        if class_ids:
            for class_id in class_ids:
                try:
                    class_obj = Class.objects.get(id=class_id)
                    valid_classes.append(class_obj)
                except Class.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'message': f'Class with ID {class_id} does not exist'
                    }, status=400)
        
        # Validate subject IDs
        from .models import Subject
        valid_subjects = []
        if subject_ids:
            for subject_id in subject_ids:
                try:
                    subject_obj = Subject.objects.get(id=subject_id)
                    valid_subjects.append(subject_obj)
                except Subject.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'message': f'Subject with ID {subject_id} does not exist'
                    }, status=400)
        
        # Create faculty member
        faculty = Faculty.objects.create(
            name=name,
            email=email,
            password=password
        )
        
        # Add classes and subjects
        if valid_classes:
            faculty.classes.set(valid_classes)
        if valid_subjects:
            faculty.subjects.set(valid_subjects)
        
        return JsonResponse({
            'success': True,
            'message': 'Faculty member registered successfully',
            'faculty': {
                'id': faculty.id,
                'name': faculty.name,
                'email': faculty.email,
                'classes': [{'id': c.id, 'name': c.name} for c in valid_classes],
                'subjects': [{'id': s.id, 'name': s.name} for s in valid_subjects]
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error registering faculty: {str(e)}'
        }, status=500)

# API endpoint for admin to register new principal
@csrf_exempt
@require_http_methods(["POST"])
def api_admin_register_principal(request):
    """
    Admin endpoint to register new principals
    """
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({
                    'success': False,
                    'message': f'{field.capitalize()} is required'
                }, status=400)
        
        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return JsonResponse({
                'success': False,
                'message': 'Invalid email format'
            }, status=400)
        
        # Check if email already exists
        if Principal.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email already exists'
            }, status=400)
        
        # Create principal
        principal = Principal.objects.create(
            name=name,
            email=email,
            password=password
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Principal registered successfully',
            'principal': {
                'id': principal.id,
                'name': principal.name,
                'email': principal.email
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error registering principal: {str(e)}'
        }, status=500)

# API endpoint to get available classes for admin
@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def api_admin_get_classes(request):
    """
    Admin endpoint to get all available classes
    """
    try:
        from .models import Class
        classes = Class.objects.all().order_by('grade_level', 'section')
        
        classes_data = [
            {
                'id': cls.id,
                'name': cls.name,
                'grade_level': cls.grade_level,
                'section': cls.section
            } for cls in classes
        ]
        
        return JsonResponse({
            'success': True,
            'classes': classes_data,
            'total_count': len(classes_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching classes: {str(e)}'
        }, status=500)

# API endpoint to get available subjects for admin
@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def api_admin_get_subjects(request):
    """
    Admin endpoint to get all available subjects
    """
    try:
        from .models import Subject
        subjects = Subject.objects.all().order_by('name')
        
        subjects_data = [
            {
                'id': subject.id,
                'name': subject.name,
                'code': subject.code,
                'grade_levels': subject.grade_levels
            } for subject in subjects
        ]
        
        return JsonResponse({
            'success': True,
            'subjects': subjects_data,
            'total_count': len(subjects_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching subjects: {str(e)}'
        }, status=500)

# Create sample faculty and principal accounts for testing
def create_sample_accounts():
    try:
        # Create classes if they don't exist
        class_10, _ = Class.objects.get_or_create(
            name="Class 10",
            defaults={'grade_level': 10, 'section': 'A'}
        )
        class_12, _ = Class.objects.get_or_create(
            name="Class 12",
            defaults={'grade_level': 12, 'section': 'A'}
        )

        # Create Math subject if it doesn't exist
        math_subject, _ = Subject.objects.get_or_create(
            name="Mathematics",
            defaults={
                'code': 'MATH',
                'grade_levels': '10,12'  # Available for both 10th and 12th
            }
        )

        # Create sample faculty
        faculty, created = Faculty.objects.get_or_create(
            email="mathteacher@example.com",
            defaults={
                'name': "John Smith",
                'password': "faculty123"  # In production, use proper password hashing
            }
        )
        if created:
            faculty.subjects.add(math_subject)
            faculty.classes.add(class_10, class_12)
            print("Sample faculty created:")
            print(f"Email: mathteacher@example.com")
            print(f"Password: faculty123")

        # Create sample principal
        principal, created = Principal.objects.get_or_create(
            email="principal@example.com",
            defaults={
                'name': "Sarah Johnson",
                'password': "principal123"  # In production, use proper password hashing
            }
        )
        if created:
            print("\nSample principal created:")
            print(f"Email: principal@example.com")
            print(f"Password: principal123")

    except Exception as e:
        print(f"Error creating sample accounts: {str(e)}")

# Create sample accounts when the module is loaded
create_sample_accounts()