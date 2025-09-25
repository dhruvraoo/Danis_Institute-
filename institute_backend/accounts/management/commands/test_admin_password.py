from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Test common admin passwords'

    def handle(self, *args, **options):
        try:
            admin_user = User.objects.get(username='admin', is_superuser=True)
            self.stdout.write(f'Testing passwords for admin user: {admin_user.username}')
            
            # Common passwords to test
            test_passwords = [
                'admin',
                'admin123', 
                'password',
                'password123',
                '123456',
                'admin@123',
                'institute123',
                'dani123',
                'test123'
            ]
            
            for password in test_passwords:
                if admin_user.check_password(password):
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ FOUND! Admin password is: {password}')
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'Django Admin Login:')
                    )
                    self.stdout.write(f'  URL: http://127.0.0.1:8000/admin/')
                    self.stdout.write(f'  Username: admin')
                    self.stdout.write(f'  Password: {password}')
                    return
            
            self.stdout.write(
                self.style.WARNING('✗ None of the common passwords worked')
            )
            self.stdout.write('You may need to reset the password using:')
            self.stdout.write('python manage.py change_admin_password --password newpassword')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Admin user not found!')
            )