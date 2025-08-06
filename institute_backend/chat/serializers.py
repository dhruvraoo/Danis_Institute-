from rest_framework import serializers
from .models import ChatRoom, ChatMessage, ChatNotification


class ChatRoomSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    admin_name = serializers.CharField(source='admin.username', read_only=True)
    admin_id = serializers.IntegerField(source='admin.id', read_only=True)
    room_name = serializers.CharField(read_only=True)
    unread_count = serializers.IntegerField(read_only=True)
    last_message_time = serializers.DateTimeField(read_only=True)
    recipient_type_display = serializers.CharField(source='get_recipient_type_display', read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'student_name', 'student_id', 'admin_name', 'admin_id',
            'room_name', 'recipient_type', 'recipient_type_display', 'created_at', 'updated_at', 'is_active',
            'unread_count', 'last_message_time'
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'sender_type', 'sender_id', 'sender_name',
            'message_type', 'content', 'file_url', 'timestamp', 'is_read',
            'is_deleted', 'deleted_at'
        ]


class ChatNotificationSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.__str__', read_only=True)
    last_message_content = serializers.CharField(source='last_message.content', read_only=True)
    last_message_sender = serializers.CharField(source='last_message.sender_name', read_only=True)
    
    class Meta:
        model = ChatNotification
        fields = [
            'id', 'room_name', 'unread_count', 'last_message_content',
            'last_message_sender', 'updated_at'
        ]