from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import Student, Subject
from students.models import AdmissionInquiry


class Command(BaseCommand):
    help = 'Sync student subjects from admission inquiries'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making changes',
        )
        parser.add_argument(
            '--student-email',
            type=str,
            help='Sync subjects for a specific student by email',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        student_email = options.get('student_email')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Get all admission inquiries
        inquiries = AdmissionInquiry.objects.all()
        
        if student_email:
            inquiries = inquiries.filter(email=student_email)
        
        updated_count = 0
        not_found_count = 0
        
        for inquiry in inquiries:
            self.stdout.write(f"\nProcessing inquiry: {inquiry.full_name} ({inquiry.email})")
            
            # Find matching student by email
            try:
                student = Student.objects.get(email=inquiry.email)
                self.stdout.write(f"Found student: {student.name}")
                
                # Get subjects from inquiry
                inquiry_subjects = inquiry.get_subjects_list()
                self.stdout.write(f"Subjects from inquiry: {inquiry_subjects}")
                
                if not inquiry_subjects:
                    self.stdout.write(self.style.WARNING("No subjects in inquiry, skipping"))
                    continue
                
                # Find matching subjects in database
                matched_subjects = []
                for subject_name in inquiry_subjects:
                    # Try exact match first
                    subject = Subject.objects.filter(name__iexact=subject_name).first()
                    if not subject:
                        # Try partial match
                        subject = Subject.objects.filter(name__icontains=subject_name).first()
                    
                    if subject:
                        matched_subjects.append(subject)
                        self.stdout.write(f"  ✓ Matched '{subject_name}' to '{subject.name}'")
                    else:
                        self.stdout.write(self.style.ERROR(f"  ✗ Could not find subject: {subject_name}"))
                
                if matched_subjects:
                    current_subjects = list(student.subjects_selected.all())
                    self.stdout.write(f"Current subjects: {[s.name for s in current_subjects]}")
                    self.stdout.write(f"New subjects: {[s.name for s in matched_subjects]}")
                    
                    if not dry_run:
                        with transaction.atomic():
                            # Clear current subjects and set new ones
                            student.subjects_selected.clear()
                            student.subjects_selected.set(matched_subjects)
                            self.stdout.write(self.style.SUCCESS(f"Updated subjects for {student.name}"))
                    else:
                        self.stdout.write(self.style.WARNING("Would update subjects (dry run)"))
                    
                    updated_count += 1
                else:
                    self.stdout.write(self.style.ERROR("No subjects could be matched"))
                    
            except Student.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Student not found with email: {inquiry.email}"))
                not_found_count += 1
        
        self.stdout.write(f"\n=== SUMMARY ===")
        self.stdout.write(f"Students updated: {updated_count}")
        self.stdout.write(f"Students not found: {not_found_count}")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("This was a dry run - no changes were made"))
        else:
            self.stdout.write(self.style.SUCCESS("Subject sync completed!"))