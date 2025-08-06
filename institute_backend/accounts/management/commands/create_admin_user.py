from django.core.management.base import BaseCommand
from accounts.models import AdminUser


class Command(BaseCommand):
    help = 'Create a default admin user for dashboard access'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Admin username')
        parser.add_argument('--password', type=str, default='admin123', help='Admin password')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        
        # Check if admin user already exists
        if AdminUser.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Admin user "{username}" already exists!')
            )
            return
        
        # Create admin user
        admin_user = AdminUser.objects.create(
            username=username,
            is_active=True
        )
        admin_user.set_password(password)
        admin_user.save()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created admin user "{username}"')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Password: {password}')
        )
        self.stdout.write(
            self.style.WARNING('Please change the password through Django admin!')
        )