from django.core.management.base import BaseCommand
from accounts.models import Faculty

class Command(BaseCommand):
    help = 'Fix faculty passwords by ensuring they are properly hashed'

    def handle(self, *args, **options):
        faculty_members = Faculty.objects.all()
        
        if not faculty_members.exists():
            self.stdout.write(
                self.style.WARNING('No faculty members found in database')
            )
            return
        
        for faculty in faculty_members:
            # Check if password is already hashed
            if not faculty.password.startswith(('pbkdf2_', 'bcrypt', 'argon2')):
                old_password = faculty.password
                faculty.set_password(old_password)
                faculty.save()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Fixed password for faculty: {faculty.name} ({faculty.email})'
                    )
                )
            else:
                self.stdout.write(
                    f'Password already hashed for: {faculty.name} ({faculty.email})'
                )
        
        self.stdout.write(
            self.style.SUCCESS('Faculty password fix completed!')
        )