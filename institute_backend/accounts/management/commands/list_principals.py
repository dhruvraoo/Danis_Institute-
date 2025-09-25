from django.core.management.base import BaseCommand
from accounts.models import Principal

class Command(BaseCommand):
    help = 'List all principals in the database'

    def handle(self, *args, **options):
        principals = Principal.objects.all()
        
        if not principals.exists():
            self.stdout.write(
                self.style.WARNING('No principals found in database')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(f'Found {principals.count()} principal(s):')
        )
        self.stdout.write('-' * 50)
        
        for i, principal in enumerate(principals, 1):
            self.stdout.write(f'{i}. Name: {principal.name}')
            self.stdout.write(f'   Email: {principal.email}')
            self.stdout.write(f'   ID: {principal.id}')
            self.stdout.write(f'   Password Hashed: {principal.password.startswith("pbkdf2_")}')
            self.stdout.write('-' * 30)