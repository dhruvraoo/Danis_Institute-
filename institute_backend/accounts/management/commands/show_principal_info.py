from django.core.management.base import BaseCommand
from accounts.models import Principal

class Command(BaseCommand):
    help = 'Show principal information for testing (DEVELOPMENT ONLY)'

    def handle(self, *args, **options):
        principals = Principal.objects.all()
        
        if not principals.exists():
            self.stdout.write(
                self.style.WARNING('No principals found in database')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS('Principal Login Information (for testing):')
        )
        self.stdout.write('=' * 60)
        
        for principal in principals:
            self.stdout.write(f'Name: {principal.name}')
            self.stdout.write(f'Email: {principal.email}')
            self.stdout.write(f'ID: {principal.id}')
            
            # Test with common passwords
            test_passwords = ['password', 'test123', 'admin123', principal.name.lower(), 'mamta123', 'ranjana123']
            
            for test_pass in test_passwords:
                if principal.check_password(test_pass):
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Working password: {test_pass}')
                    )
                    break
            else:
                self.stdout.write(
                    self.style.WARNING('✗ No common password found - check admin panel')
                )
            
            self.stdout.write('-' * 40)