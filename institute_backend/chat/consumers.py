import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatRoom, ChatMessage, ChatNotification
from accounts.models import Student, AdminUser

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.heartbeat_task = None
        self.heartbeat_interval = 30  # seconds
        self.last_heartbeat = None
        self.connection_id = None
        self.offline_messages = []
        
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.connection_id = f"{self.room_id}_{self.channel_name}"
        
        try:
            # Verify user has access to this room
            has_access = await self.verify_room_access()
            if not has_access:
                logger.warning(f"Access denied for room {self.room_id}")
                await self.close(code=4003)  # Forbidden
                return
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            logger.info(f"WebSocket connected to room {self.room_id}")
            
            # Start heartbeat mechanism
            self.heartbeat_task = asyncio.create_task(self.heartbeat_loop())
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'room_id': self.room_id,
                'connection_id': self.connection_id,
                'timestamp': timezone.now().isoformat()
            }))
            
            # Send recent messages to newly connected user
            await self.send_recent_messages()
            
        except Exception as e:
            logger.error(f"Error during WebSocket connection: {e}")
            await self.close(code=4000)  # Server error
    
    async def disconnect(self, close_code):
        # Cancel heartbeat task
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
            
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        logger.info(f"WebSocket disconnected from room {self.room_id}, code: {close_code}")
        
        # Process any offline messages that were queued
        if self.offline_messages:
            await self.process_offline_messages()
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'chat_message')
            
            # Update last heartbeat time
            self.last_heartbeat = timezone.now()
            
            if message_type == 'chat_message':
                await self.handle_chat_message(text_data_json)
            elif message_type == 'mark_read':
                await self.handle_mark_read(text_data_json)
            elif message_type == 'typing':
                await self.handle_typing(text_data_json)
            elif message_type == 'heartbeat':
                await self.handle_heartbeat(text_data_json)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON format',
                'code': 'INVALID_JSON'
            }))
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Message processing failed',
                'code': 'PROCESSING_ERROR'
            }))
    
    async def handle_chat_message(self, data):
        message_content = data['message']
        sender_type = data['sender_type']  # 'student' or 'admin'
        sender_id = data['sender_id']
        sender_name = data['sender_name']
        
        # Save message to database
        message = await self.save_message(
            message_content, sender_type, sender_id, sender_name
        )
        
        if message:
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'sender_type': message.sender_type,
                        'sender_id': message.sender_id,
                        'sender_name': message.sender_name,
                        'timestamp': message.timestamp.isoformat(),
                        'is_read': message.is_read
                    }
                }
            )
            
            # Update notifications
            await self.update_notifications(message)
    
    async def handle_mark_read(self, data):
        message_ids = data.get('message_ids', [])
        await self.mark_messages_read(message_ids)
        
        # Notify other users that messages were read
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'messages_read',
                'message_ids': message_ids
            }
        )
    
    async def handle_typing(self, data):
        # Broadcast typing indicator to other users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'sender_name': data['sender_name'],
                'is_typing': data['is_typing']
            }
        )
    
    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))
    
    async def messages_read(self, event):
        # Send read receipt to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'message_ids': event['message_ids']
        }))
    
    async def typing_indicator(self, event):
        # Send typing indicator to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'sender_name': event['sender_name'],
            'is_typing': event['is_typing']
        }))
    
    @database_sync_to_async
    def verify_room_access(self):
        """Verify user has access to this chat room"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            # Add your authentication logic here
            # For now, allowing all authenticated users
            return True
        except ChatRoom.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, content, sender_type, sender_id, sender_name):
        """Save message to database"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
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
            
            return message
        except Exception as e:
            print(f"Error saving message: {e}")
            return None
    
    @database_sync_to_async
    def update_notifications(self, message):
        """Update notification counts for recipients"""
        try:
            room = message.room
            
            # Determine recipient type (opposite of sender)
            if message.sender_type == 'student':
                recipient_type = 'admin'
                recipient_id = room.admin.id if room.admin else 0
            else:
                recipient_type = 'student'
                recipient_id = room.student.id
            
            # Update or create notification
            notification, created = ChatNotification.objects.get_or_create(
                room=room,
                recipient_type=recipient_type,
                recipient_id=recipient_id,
                defaults={
                    'unread_count': 1,
                    'last_message': message
                }
            )
            
            if not created:
                notification.unread_count += 1
                notification.last_message = message
                notification.save()
                
        except Exception as e:
            print(f"Error updating notifications: {e}")
    
    @database_sync_to_async
    def mark_messages_read(self, message_ids):
        """Mark messages as read"""
        try:
            ChatMessage.objects.filter(
                id__in=message_ids,
                room_id=self.room_id
            ).update(is_read=True)
        except Exception as e:
            print(f"Error marking messages as read: {e}")
    
    @database_sync_to_async
    def get_recent_messages(self, limit=50):
        """Get recent messages for the room"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            messages = room.messages.all().order_by('-timestamp')[:limit]
            
            return [{
                'id': msg.id,
                'content': msg.content,
                'sender_type': msg.sender_type,
                'sender_id': msg.sender_id,
                'sender_name': msg.sender_name,
                'timestamp': msg.timestamp.isoformat(),
                'is_read': msg.is_read
            } for msg in reversed(messages)]
        except Exception as e:
            logger.error(f"Error getting recent messages: {e}")
            return []
    
    async def send_recent_messages(self):
        """Send recent messages to newly connected user"""
        messages = await self.get_recent_messages()
        
        await self.send(text_data=json.dumps({
            'type': 'recent_messages',
            'messages': messages
        }))
    
    async def heartbeat_loop(self):
        """Send periodic heartbeat to maintain connection"""
        try:
            while True:
                await asyncio.sleep(self.heartbeat_interval)
                
                # Check if connection is still alive
                if self.last_heartbeat:
                    time_since_last = (timezone.now() - self.last_heartbeat).total_seconds()
                    if time_since_last > self.heartbeat_interval * 2:
                        logger.warning(f"Connection {self.connection_id} appears stale")
                        break
                
                # Send heartbeat
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat',
                    'timestamp': timezone.now().isoformat(),
                    'connection_id': self.connection_id
                }))
                
        except asyncio.CancelledError:
            logger.info(f"Heartbeat cancelled for {self.connection_id}")
        except Exception as e:
            logger.error(f"Heartbeat error for {self.connection_id}: {e}")
    
    async def handle_heartbeat(self, data):
        """Handle heartbeat response from client"""
        self.last_heartbeat = timezone.now()
        await self.send(text_data=json.dumps({
            'type': 'heartbeat_ack',
            'timestamp': self.last_heartbeat.isoformat()
        }))
    
    async def process_offline_messages(self):
        """Process any messages that were queued while offline"""
        try:
            for message_data in self.offline_messages:
                await self.handle_chat_message(message_data)
            self.offline_messages.clear()
            logger.info(f"Processed {len(self.offline_messages)} offline messages")
        except Exception as e:
            logger.error(f"Error processing offline messages: {e}")
    
    async def queue_offline_message(self, message_data):
        """Queue message for processing when connection is restored"""
        self.offline_messages.append(message_data)
        logger.info(f"Queued offline message for {self.connection_id}")
    
    async def send_error_response(self, error_code, message, details=None):
        """Send standardized error response"""
        error_response = {
            'type': 'error',
            'error_code': error_code,
            'message': message,
            'timestamp': timezone.now().isoformat()
        }
        
        if details:
            error_response['details'] = details
            
        await self.send(text_data=json.dumps(error_response))