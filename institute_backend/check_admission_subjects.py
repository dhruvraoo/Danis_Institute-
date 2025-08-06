#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'institute_backend.settings')
django.setup()

from accounts.models import Student
from students.models import AdmissionInquiry

print("=== CHECKING ADMISSION INQUIRY SUBJECTS ===")

# Find dhwani parmar
try:
    student = Student.objects.get(name__icontains="dhwani")
    print(f"Student found: {student.name} ({student.email})")
    print(f"Class: {student.student_class.name}")
    print(f"Selected subjects in system: {[s.name for s in student.subjects_selected.all()]}")
    
    # Try to find their admission inquiry
    inquiries = AdmissionInquiry.objects.filter(
        first_name__icontains="dhwani"
    )
    
    if inquiries.exists():
        for inquiry in inquiries:
            print(f"\nAdmission inquiry found:")
            print(f"Name: {inquiry.full_name}")
            print(f"Email: {inquiry.email}")
            print(f"Course: {inquiry.course}")
            print(f"Subjects from inquiry: {inquiry.get_subjects_list()}")
    else:
        print("\nNo admission inquiry found for dhwani")
        
        # Check all inquiries to see if there's a match by email
        if student.email:
            email_inquiries = AdmissionInquiry.objects.filter(email=student.email)
            if email_inquiries.exists():
                for inquiry in email_inquiries:
                    print(f"\nFound inquiry by email match:")
                    print(f"Name: {inquiry.full_name}")
                    print(f"Subjects from inquiry: {inquiry.get_subjects_list()}")
            else:
                print("No inquiry found by email either")
                
except Student.DoesNotExist:
    print("Student 'dhwani' not found")
    
print("\n=== ALL ADMISSION INQUIRIES ===")
inquiries = AdmissionInquiry.objects.all()
for inquiry in inquiries:
    print(f"- {inquiry.full_name} ({inquiry.email}): {inquiry.get_subjects_list()}")