from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Max
from django.utils import timezone
from accounts.models import Student, AdminUser
from .models import ChatRoom, ChatMessage, ChatNotification
from .serializers import ChatRoomSerializer, ChatMessageSerializer


class ChatRoomListView(APIView):
    """List chat rooms for admin or student"""
    # Temporarily remove authentication for testing
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_type = request.query_params.get('user_type')  # 'admin' or 'student'
        user_id = request.query_params.get('user_id')
        
        if not user_type or not user_id:
            return Response({
                'error': 'user_type and user_id parameters are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            print(f"🔍 ChatRoomListView called with user_type={user_type}, user_id={user_id}")
            
            if user_type == 'admin':
                # Get all chat rooms for admin
                rooms = ChatRoom.objects.filter(
                    admin_id=user_id, is_active=True
                ).annotate(
                    unread_count=Count('messages', filter=Q(
                        messages__is_read=False,
                        messages__sender_type='student'
                    )),
                    last_message_time=Max('messages__timestamp')
                ).order_by('-updated_at')
                
            elif user_type == 'student':
                # Get all chat rooms for student
                student = get_object_or_404(Student, id=user_id)
                
                rooms = ChatRoom.objects.filter(
                    student=student, is_active=True
                ).annotate(
                    unread_count=Count('messages', filter=Q(
                        messages__is_read=False,
                        messages__sender_type__in=['admin', 'faculty', 'principal']
                    )),
                    last_message_time=Max('messages__timestamp')
                ).order_by('-updated_at')
            
            serializer = ChatRoomSerializer(rooms, many=True)
            return Response({
                'success': True,
                'rooms': serializer.data
            })
            
        except Exception as e:
            return Response({
                'error': f'Error fetching chat rooms: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatRoomDetailView(APIView):
    """Get specific chat room details"""
    # Temporarily remove authentication for testing
    # permission_classes = [IsAuthenticated]
    
    def get(self, request, room_id):
        try:
            room = get_object_or_404(ChatRoom, id=room_id, is_active=True)
            
            # Get pagination parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 50))
            
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Get total message count
            total_messages = room.messages.count()
            
            # Get paginated messages (ordered by timestamp, newest first for pagination)
            messages = room.messages.all().order_by('-timestamp')[offset:offset + page_size]
            
            # Reverse the messages for display (oldest first)
            messages = list(reversed(messages))
            
            # Calculate pagination info
            has_next = offset + page_size < total_messages
            has_previous = page > 1
            total_pages = (total_messages + page_size - 1) // page_size
            
            serializer = ChatRoomSerializer(room)
            message_serializer = ChatMessageSerializer(messages, many=True)
            
            return Response({
                'success': True,
                'room': serializer.data,
                'messages': message_serializer.data,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_messages': total_messages,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_previous': has_previous
                }
            })
            
        except Exception as e:
            return Response({
                'error': f'Error fetching chat room: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateChatRoomView(APIView):
    """Create a new chat room (admin initiating chat with student)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            student_id = request.data.get('student_id')
            admin_id = request.data.get('admin_id', 1)  # Default admin ID
            recipient_type = request.data.get('recipient_type', 'admin')
            
            if not student_id:
                return Response({
                    'error': 'student_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if recipient_type not in ['admin', 'faculty', 'principal']:
                return Response({
                    'error': 'recipient_type must be admin, faculty, or principal'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            student = get_object_or_404(Student, id=student_id)
            admin = get_object_or_404(AdminUser, id=admin_id)
            
            # Get or create chat room based on student and recipient type
            room, created = ChatRoom.objects.get_or_create(
                student=student,
                recipient_type=recipient_type,
                defaults={
                    'admin': admin,
                    'is_active': True
                }
            )
            
            # If room exists but no admin assigned, assign the admin
            if not created and not room.admin:
                room.admin = admin
                room.save()
            
            serializer = ChatRoomSerializer(room)
            
            return Response({
                'success': True,
                'room': serializer.data,
                'created': created
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error creating chat room: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatNotificationView(APIView):
    """Get unread message notifications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_type = request.query_params.get('user_type')
        user_id = request.query_params.get('user_id')
        
        if not user_type or not user_id:
            return Response({
                'error': 'user_type and user_id parameters are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            notifications = ChatNotification.objects.filter(
                recipient_type=user_type,
                recipient_id=user_id,
                unread_count__gt=0
            ).select_related('room', 'last_message')
            
            total_unread = sum(n.unread_count for n in notifications)
            
            notification_data = []
            for notification in notifications:
                notification_data.append({
                    'room_id': notification.room.id,
                    'room_name': str(notification.room),
                    'unread_count': notification.unread_count,
                    'last_message': {
                        'content': notification.last_message.content if notification.last_message else '',
                        'timestamp': notification.last_message.timestamp.isoformat() if notification.last_message else '',
                        'sender_name': notification.last_message.sender_name if notification.last_message else ''
                    } if notification.last_message else None,
                    'updated_at': notification.updated_at.isoformat()
                })
            
            return Response({
                'success': True,
                'total_unread': total_unread,
                'notifications': notification_data
            })
            
        except Exception as e:
            return Response({
                'error': f'Error fetching notifications: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarkMessagesReadView(APIView):
    """Mark messages as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            room_id = request.data.get('room_id')
            user_type = request.data.get('user_type')
            user_id = request.data.get('user_id')
            
            if not all([room_id, user_type, user_id]):
                return Response({
                    'error': 'room_id, user_type, and user_id are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            room = get_object_or_404(ChatRoom, id=room_id)
            
            # Mark messages as read (messages sent by the other party)
            if user_type == 'student':
                # Student reading admin messages
                ChatMessage.objects.filter(
                    room=room,
                    sender_type='admin',
                    is_read=False
                ).update(is_read=True)
            else:
                # Admin reading student messages
                ChatMessage.objects.filter(
                    room=room,
                    sender_type='student',
                    is_read=False
                ).update(is_read=True)
            
            # Reset notification count
            ChatNotification.objects.filter(
                room=room,
                recipient_type=user_type,
                recipient_id=user_id
            ).update(unread_count=0)
            
            return Response({
                'success': True,
                'message': 'Messages marked as read'
            })
            
        except Exception as e:
            return Response({
                'error': f'Error marking messages as read: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AllStudentsForChatView(APIView):
    """Get all registered students for admin messaging"""
    # Temporarily remove authentication for testing
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            print("🔍 AllStudentsForChatView called")
            # Get all active students
            students = Student.objects.all().order_by('name')
            print(f"📊 Found {students.count()} students")
            
            student_data = []
            for student in students:
                # Check if there's an existing chat room
                try:
                    room = ChatRoom.objects.get(student=student, recipient_type='admin')
                    
                    # Get unread count for admin
                    unread_count = ChatMessage.objects.filter(
                        room=room,
                        sender_type='student',
                        is_read=False
                    ).count()
                    
                    # Get last message
                    last_message = room.messages.last()
                    
                    student_data.append({
                        'id': student.id,
                        'name': student.name,
                        'email': student.email,
                        'roll_id': student.roll_id,
                        'class_name': student.student_class.name if student.student_class else 'No Class',
                        'room_id': room.id,
                        'has_chat_room': True,
                        'unread_count': unread_count,
                        'last_message': {
                            'content': last_message.content if last_message else '',
                            'timestamp': last_message.timestamp.isoformat() if last_message else '',
                            'sender_name': last_message.sender_name if last_message else '',
                            'sender_type': last_message.sender_type if last_message else ''
                        } if last_message else None,
                        'room_updated_at': room.updated_at.isoformat()
                    })
                    
                except ChatRoom.DoesNotExist:
                    # No chat room exists yet
                    student_data.append({
                        'id': student.id,
                        'name': student.name,
                        'email': student.email,
                        'roll_id': student.roll_id,
                        'class_name': student.student_class.name if student.student_class else 'No Class',
                        'room_id': None,
                        'has_chat_room': False,
                        'unread_count': 0,
                        'last_message': None,
                        'room_updated_at': None
                    })
            
            return Response({
                'success': True,
                'students': student_data,
                'total_count': len(student_data)
            })
            
        except Exception as e:
            return Response({
                'error': f'Error fetching students: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendMessageView(APIView):
    """Send a message via HTTP (fallback when WebSocket is not available)"""
    # Temporarily remove authentication for testing
    # permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            print("📡 SendMessageView called")
            room_id = request.data.get('room_id')
            content = request.data.get('content')
            sender_type = request.data.get('sender_type')
            sender_id = request.data.get('sender_id')
            sender_name = request.data.get('sender_name')
            
            print(f"📡 Message data: room_id={room_id}, sender_type={sender_type}, content={content}")
            
            if not all([room_id, content, sender_type, sender_id, sender_name]):
                return Response({
                    'error': 'room_id, content, sender_type, sender_id, and sender_name are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the chat room
            room = get_object_or_404(ChatRoom, id=room_id)
            
            # Create the message
            message = ChatMessage.objects.create(
                room=room,
                sender_type=sender_type,
                sender_id=sender_id,
                sender_name=sender_name,
                content=content,
                message_type='text'
            )
            
            # Update room's updated_at timestamp
            room.updated_at = timezone.now()
            room.save(update_fields=['updated_at'])
            
            print(f"✅ Message created with ID: {message.id}")
            
            return Response({
                'success': True,
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'sender_type': message.sender_type,
                    'sender_id': message.sender_id,
                    'sender_name': message.sender_name,
                    'timestamp': message.timestamp.isoformat(),
                    'is_read': message.is_read
                }
            })
            
        except Exception as e:
            print(f"❌ Error sending message: {e}")
            return Response({
                'error': f'Error sending message: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteMessageView(APIView):
    """Delete (unsend) a message"""
    # Temporarily remove authentication for testing
    # permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            message_id = request.data.get('message_id')
            user_type = request.data.get('user_type')  # 'student' or 'admin'
            user_id = request.data.get('user_id')
            
            if not all([message_id, user_type, user_id]):
                return Response({
                    'error': 'message_id, user_type, and user_id are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the message
            try:
                message = ChatMessage.objects.get(id=message_id)
            except ChatMessage.DoesNotExist:
                return Response({
                    'error': 'Message not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if user can delete this message (only sender can delete)
            if (message.sender_type != user_type or 
                str(message.sender_id) != str(user_id)):
                return Response({
                    'error': 'You can only delete your own messages'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if message is already deleted
            if message.is_deleted:
                return Response({
                    'error': 'Message is already deleted'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Delete the message
            message.delete_message()
            
            return Response({
                'success': True,
                'message': 'Message deleted successfully',
                'deleted_message': {
                    'id': message.id,
                    'content': message.content,
                    'is_deleted': message.is_deleted,
                    'deleted_at': message.deleted_at.isoformat() if message.deleted_at else None
                }
            })
            
        except Exception as e:
            return Response({
                'error': f'Error deleting message: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)