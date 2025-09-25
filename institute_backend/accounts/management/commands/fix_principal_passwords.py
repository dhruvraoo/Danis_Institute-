from django.core.management.base import BaseCommand
from accounts.models import Principal

class Command(BaseCommand):
    help = 'Fix principal passwords by ensuring they are properly hashed'

    def handle(self, *args, **options):
        principals = Principal.objects.all()
        
        if not principals.exists():
            self.stdout.write(
                self.style.WARNING('No principals found in database')
            )
            return
        
        for principal in principals:
            # Check if password is already hashed
            if not principal.password.startswith(('pbkdf2_', 'bcrypt', 'argon2')):
                old_password = principal.password
                principal.set_password(old_password)
                principal.save()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Fixed password for principal: {principal.name} ({principal.email})'
                    )
                )
            else:
                self.stdout.write(
                    f'Password already hashed for: {principal.name} ({principal.email})'
                )
        
        self.stdout.write(
            self.style.SUCCESS('Password fix completed!')
        )