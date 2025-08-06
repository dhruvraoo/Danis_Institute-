from django.core.management.base import BaseCommand
from accounts.models import Student, AdminUser, Class
from chat.models import ChatRoom, ChatMessage


class Command(BaseCommand):
    help = 'Set up demo data for chat system'

    def handle(self, *args, **options):
        # Get or create admin user
        admin_user, created = AdminUser.objects.get_or_create(
            username='admin',
            defaults={'is_active': True}
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.username}')
        
        # Get first student
        try:
            student = Student.objects.first()
            if not student:
                self.stdout.write(self.style.ERROR('No students found. Please create a student first.'))
                return
            
            # Create chat rooms for different recipient types
            recipient_types = ['admin', 'faculty', 'principal']
            
            for recipient_type in recipient_types:
                room, created = ChatRoom.objects.get_or_create(
                    student=student,
                    recipient_type=recipient_type,
                    defaults={
                        'admin': admin_user,
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(f'Created {recipient_type} chat room for {student.name}')
                    
                    # Create demo messages based on recipient type
                    if recipient_type == 'admin':
                        ChatMessage.objects.create(
                            room=room,
                            sender_type='student',
                            sender_id=student.id,
                            sender_name=student.name,
                            content='Hello, I need help with my account login issues.',
                            message_type='text'
                        )
                        
                        ChatMessage.objects.create(
                            room=room,
                            sender_type='admin',
                            sender_id=admin_user.id,
                            sender_name=admin_user.username,
                            content='Hi! I can help you with that. What specific login issue are you experiencing?',
                            message_type='text'
                        )
                    
                    elif recipient_type == 'faculty':
                        ChatMessage.objects.create(
                            room=room,
                            sender_type='student',
                            sender_id=student.id,
                            sender_name=student.name,
                            content='I have a question about the mathematics assignment.',
                            message_type='text'
                        )
                        
                        ChatMessage.objects.create(
                            room=room,
                            sender_type='faculty',
                            sender_id=admin_user.id,
                            sender_name='Math Faculty',
                            content='Sure! Which part of the assignment are you having trouble with?',
                            message_type='text'
                        )
                    
                    elif recipient_type == 'principal':
                        ChatMessage.objects.create(
                            room=room,
                            sender_type='student',
                            sender_id=student.id,
                            sender_name=student.name,
                            content='I would like to discuss my academic progress.',
                            message_type='text'
                        )
                        
                        ChatMessage.objects.create(
                            room=room,
                            sender_type='principal',
                            sender_id=admin_user.id,
                            sender_name='Principal',
                            content='Of course! I\'d be happy to discuss your progress. Let\'s schedule a meeting.',
                            message_type='text'
                        )
                    
                    self.stdout.write(f'Created demo messages for {recipient_type}')
                else:
                    self.stdout.write(f'{recipient_type.title()} chat room already exists: {room}')
            
            self.stdout.write(
                self.style.SUCCESS('Chat demo setup completed successfully!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error setting up chat demo: {e}')
            )