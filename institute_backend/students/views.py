from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
import json
import re
from .models import AdmissionInquiry

# Create your views here.

def validate_inquiry_data(data):
    """Validate inquiry form data"""
    errors = []
    
    # Required fields
    required_fields = ['firstName', 'lastName', 'email', 'phone', 'course', 'subjects']
    for field in required_fields:
        if not data.get(field):
            errors.append(f'{field} is required')
    
    # Email validation
    if data.get('email'):
        try:
            validate_email(data['email'])
        except ValidationError:
            errors.append('Invalid email format')
    
    # Phone validation (basic)
    if data.get('phone'):
        phone = re.sub(r'[^\d]', '', data['phone'])
        if len(phone) < 10:
            errors.append('Phone number must be at least 10 digits')
    
    # Name validation (no numbers or special chars)
    for field in ['firstName', 'lastName']:
        if data.get(field) and not re.match(r'^[a-zA-Z\s]+$', data[field]):
            errors.append(f'{field} should only contain letters and spaces')
    
    # Subjects validation
    if data.get('subjects') and not isinstance(data['subjects'], list):
        errors.append('Subjects must be a list')
    
    return errors

@csrf_exempt
@require_http_methods(["POST"])
def create_admission_inquiry(request):
    """Handle admission inquiry form submission with validation and rate limiting"""
    try:
        data = json.loads(request.body)
        
        # Validate input data
        validation_errors = validate_inquiry_data(data)
        if validation_errors:
            return JsonResponse({
                'success': False,
                'message': 'Validation failed: ' + ', '.join(validation_errors)
            }, status=400)
        
        # Basic rate limiting - check for duplicate submissions in last 5 minutes
        recent_time = timezone.now() - timedelta(minutes=5)
        recent_inquiry = AdmissionInquiry.objects.filter(
            email=data['email'],
            created_at__gte=recent_time
        ).first()
        
        if recent_inquiry:
            return JsonResponse({
                'success': False,
                'message': 'Please wait before submitting another inquiry'
            }, status=429)
        
        # Sanitize and create new inquiry
        inquiry = AdmissionInquiry(
            first_name=data['firstName'].strip()[:100],
            last_name=data['lastName'].strip()[:100],
            email=data['email'].strip().lower(),
            phone=re.sub(r'[^\d+\-\s()]', '', data['phone'])[:20],
            course=data['course'].strip()[:50],
            previous_education=data.get('previousEducation', '').strip()[:100],
            message=data.get('message', '').strip()[:1000]
        )
        
        # Handle subjects array
        subjects = data.get('subjects', [])
        if isinstance(subjects, list):
            # Sanitize subjects
            clean_subjects = [s.strip() for s in subjects if isinstance(s, str)][:10]
            inquiry.set_subjects_list(clean_subjects)
        
        inquiry.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Inquiry received successfully. We will contact you within 24 hours.',
            'inquiry_id': inquiry.id
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': 'Failed to submit inquiry. Please try again.'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_admission_inquiries(request):
    """Get all admission inquiries for admin dashboard"""
    try:
        status_filter = request.GET.get('status')
        
        inquiries = AdmissionInquiry.objects.all()
        
        if status_filter:
            inquiries = inquiries.filter(status=status_filter)
        
        inquiries_data = []
        for inquiry in inquiries:
            inquiries_data.append({
                'id': inquiry.id,
                'firstName': inquiry.first_name,
                'lastName': inquiry.last_name,
                'fullName': inquiry.full_name,
                'email': inquiry.email,
                'phone': inquiry.phone,
                'course': inquiry.course,
                'previousEducation': inquiry.previous_education,
                'subjects': inquiry.get_subjects_list(),
                'message': inquiry.message,
                'status': inquiry.status,
                'createdAt': inquiry.created_at.isoformat(),
                'updatedAt': inquiry.updated_at.isoformat()
            })
        
        # Get statistics
        stats = {
            'total': AdmissionInquiry.objects.count(),
            'pending': AdmissionInquiry.objects.filter(status='pending').count(),
            'contacted': AdmissionInquiry.objects.filter(status='contacted').count(),
            'resolved': AdmissionInquiry.objects.filter(status='resolved').count()
        }
        
        return JsonResponse({
            'success': True,
            'inquiries': inquiries_data,
            'stats': stats
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Failed to fetch inquiries: {str(e)}'
        }, status=400)

@csrf_exempt
@require_http_methods(["PUT"])
def update_inquiry_status(request, inquiry_id):
    """Update inquiry status"""
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if new_status not in ['pending', 'contacted', 'resolved']:
            return JsonResponse({
                'success': False,
                'message': 'Invalid status value'
            }, status=400)
        
        inquiry = AdmissionInquiry.objects.get(id=inquiry_id)
        inquiry.status = new_status
        inquiry.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Status updated successfully',
            'inquiry': {
                'id': inquiry.id,
                'status': inquiry.status,
                'updatedAt': inquiry.updated_at.isoformat()
            }
        })
        
    except AdmissionInquiry.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Inquiry not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Failed to update status: {str(e)}'
        }, status=400)