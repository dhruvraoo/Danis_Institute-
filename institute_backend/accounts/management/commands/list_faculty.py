from django.core.management.base import BaseCommand
from accounts.models import Faculty

class Command(BaseCommand):
    help = 'List all faculty members in the database'

    def handle(self, *args, **options):
        faculty_members = Faculty.objects.all()
        
        if not faculty_members.exists():
            self.stdout.write(
                self.style.WARNING('No faculty members found in database')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(f'Found {faculty_members.count()} faculty member(s):')
        )
        self.stdout.write('-' * 50)
        
        for i, faculty in enumerate(faculty_members, 1):
            self.stdout.write(f'{i}. Name: {faculty.name}')
            self.stdout.write(f'   Email: {faculty.email}')
            self.stdout.write(f'   ID: {faculty.id}')
            self.stdout.write(f'   Password Hashed: {faculty.password.startswith("pbkdf2_")}')
            
            # Test with common passwords
            test_passwords = ['password', 'test123', 'admin123', faculty.name.lower(), 'faculty123']
            
            for test_pass in test_passwords:
                if faculty.check_password(test_pass):
                    self.stdout.write(
                        self.style.SUCCESS(f'   ✓ Working password: {test_pass}')
                    )
                    break
            else:
                self.stdout.write(
                    self.style.WARNING('   ✗ No common password found - check admin panel')
                )
            
            self.stdout.write('-' * 30)