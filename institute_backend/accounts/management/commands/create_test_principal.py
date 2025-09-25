from django.core.management.base import BaseCommand
from accounts.models import Principal

class Command(BaseCommand):
    help = 'Create a test principal for testing login functionality'

    def handle(self, *args, **options):
        # Check if test principal already exists
        test_email = 'principal@test.com'
        
        if Principal.objects.filter(email=test_email).exists():
            self.stdout.write(
                self.style.WARNING(f'Principal with email {test_email} already exists')
            )
            principal = Principal.objects.get(email=test_email)
        else:
            # Create test principal
            principal = Principal.objects.create(
                name='Test Principal',
                email=test_email,
                password='testpass123'  # This will be automatically hashed
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created principal: {principal.name}')
            )
        
        self.stdout.write(f'Principal Details:')
        self.stdout.write(f'  Name: {principal.name}')
        self.stdout.write(f'  Email: {principal.email}')
        self.stdout.write(f'  ID: {principal.id}')
        self.stdout.write(f'  Password is hashed: {principal.password.startswith("pbkdf2_")}')