from django.core.management.base import BaseCommand
from accounts.models import Faculty


class Command(BaseCommand):
    help = 'Create a test faculty for testing login functionality'

    def handle(self, *args, **options):
        # Check if test faculty already exists
        test_email = 'testfaculty@test.com'
        
        if Faculty.objects.filter(email=test_email).exists():
            self.stdout.write(
                self.style.WARNING(f'Faculty with email {test_email} already exists')
            )
            faculty = Faculty.objects.get(email=test_email)
        else:
            # Create test faculty
            faculty = Faculty.objects.create(
                name='Test Faculty Member',
                email=test_email,
                password='faculty123'  # This will be automatically hashed
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created faculty: {faculty.name}')
            )
        
        self.stdout.write(f'Faculty Details:')
        self.stdout.write(f'  Name: {faculty.name}')
        self.stdout.write(f'  Email: {faculty.email}')
        self.stdout.write(f'  ID: {faculty.id}')
        self.stdout.write(f'  Password is hashed: {faculty.password.startswith("pbkdf2_")}')
