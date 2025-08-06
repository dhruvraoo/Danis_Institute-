from django.core.management.base import BaseCommand
from accounts.models import Faculty, Class, Subject
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Creates a sample faculty user with classes and subjects'

    def handle(self, *args, **options):
        # Create classes
        class_10, created = Class.objects.get_or_create(name='Grade 10', grade_level=10)
        class_11, created = Class.objects.get_or_create(name='Grade 11', grade_level=11)

        # Create subject
        maths, created = Subject.objects.get_or_create(name='Maths', code='MATH', grade_levels='10,11')

        # Create faculty user
        faculty, created = Faculty.objects.get_or_create(
            email='faculty@example.com',
            defaults={
                'name': 'Sample Faculty',
                'password': make_password('password123')  # Hash the password
            }
        )

        # Assign classes and subjects to faculty
        faculty.classes.add(class_10, class_11)
        faculty.subjects.add(maths)

        self.stdout.write(self.style.SUCCESS('Successfully created sample faculty user'))