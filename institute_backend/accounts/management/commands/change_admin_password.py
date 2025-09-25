from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import getpass

class Command(BaseCommand):
    help = 'Change Django admin password'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username of the admin (default: admin)'
        )
        parser.add_argument(
            '--password',
            type=str,
            help='New password (if not provided, will prompt)'
        )

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        
        try:
            user = User.objects.get(username=username, is_superuser=True)
            self.stdout.write(f'Found admin user: {user.username} ({user.email})')
            
            if not password:
                password = getpass.getpass('Enter new password: ')
                confirm_password = getpass.getpass('Confirm password: ')
                
                if password != confirm_password:
                    self.stdout.write(
                        self.style.ERROR('Passwords do not match!')
                    )
                    return
            
            # Change password
            user.set_password(password)
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully changed password for admin: {username}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'You can now login to Django admin at: http://127.0.0.1:8000/admin/')
            )
            self.stdout.write(f'Username: {username}')
            self.stdout.write(f'Password: {password}')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Admin user "{username}" not found!')
            )
            self.stdout.write('Available superusers:')
            for user in User.objects.filter(is_superuser=True):
                self.stdout.write(f'  - {user.username}')