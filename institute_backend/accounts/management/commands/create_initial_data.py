from django.core.management.base import BaseCommand
from accounts.models import Class, Subject


class Command(BaseCommand):
    help = 'Create initial data for classes and subjects'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating initial data for classes and subjects...'))
        
        # Create classes
        classes_data = [
            {'name': '9th A', 'grade_level': 9, 'section': 'A'},
            {'name': '9th B', 'grade_level': 9, 'section': 'B'},
            {'name': '10th A', 'grade_level': 10, 'section': 'A'},
            {'name': '10th B', 'grade_level': 10, 'section': 'B'},
            {'name': '11th A', 'grade_level': 11, 'section': 'A'},
            {'name': '11th B', 'grade_level': 11, 'section': 'B'},
            {'name': '12th A', 'grade_level': 12, 'section': 'A'},
            {'name': '12th B', 'grade_level': 12, 'section': 'B'},
        ]
        
        for class_data in classes_data:
            class_obj, created = Class.objects.get_or_create(
                name=class_data['name'],
                defaults=class_data
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"{status}: Class {class_obj.name}")
        
        # Create subjects
        subjects_data = [
            {'name': 'Mathematics', 'code': 'MATH101', 'grade_levels': '9,10,11,12'},
            {'name': 'Physics', 'code': 'PHY101', 'grade_levels': '9,10,11,12'},
            {'name': 'Chemistry', 'code': 'CHEM101', 'grade_levels': '9,10,11,12'},
            {'name': 'Biology', 'code': 'BIO101', 'grade_levels': '9,10,11,12'},
            {'name': 'Social Science', 'code': 'SOC101', 'grade_levels': '9,10,11,12'},
            {'name': 'English', 'code': 'ENG101', 'grade_levels': '9,10,11,12'},
        ]
        
        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults=subject_data
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"{status}: Subject {subject.name} ({subject.code})")
        
        self.stdout.write(self.style.SUCCESS('Initial data creation completed!'))