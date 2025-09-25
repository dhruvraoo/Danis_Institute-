from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'List all Django superusers'

    def handle(self, *args, **options):
        superusers = User.objects.filter(is_superuser=True)
        
        if not superusers.exists():
            self.stdout.write(
                self.style.WARNING('No Django superusers found in database')
            )
            self.stdout.write(
                self.style.SUCCESS('You can create one using: python manage.py createsuperuser')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(f'Found {superusers.count()} Django superuser(s):')
        )
        self.stdout.write('-' * 50)
        
        for i, user in enumerate(superusers, 1):
            self.stdout.write(f'{i}. Username: {user.username}')
            self.stdout.write(f'   Email: {user.email}')
            self.stdout.write(f'   First Name: {user.first_name}')
            self.stdout.write(f'   Last Name: {user.last_name}')
            self.stdout.write(f'   Is Active: {user.is_active}')
            self.stdout.write(f'   Date Joined: {user.date_joined}')
            self.stdout.write(f'   Last Login: {user.last_login}')
            self.stdout.write('-' * 30)