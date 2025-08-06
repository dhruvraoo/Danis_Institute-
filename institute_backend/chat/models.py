from django.db import models
from django.utils import timezone
from accounts.models import Student, AdminUser


class ChatRoom(models.Model):
    """Chat room between student and staff (admin/faculty/principal)"""
    RECIPIENT_TYPES = [
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
        ('principal', 'Principal'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='chat_rooms')
    admin = models.ForeignKey(AdminUser, on_delete=models.CASCADE, related_name='chat_rooms', null=True, blank=True)
    recipient_type = models.CharField(max_length=10, choices=RECIPIENT_TYPES, default='admin')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['student', 'recipient_type']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Chat: {self.student.name} - {self.get_recipient_type_display()}"
    
    @property
    def room_name(self):
        """Generate unique room name for WebSocket"""
        return f"chat_{self.id}"


class ChatMessage(models.Model):
    """Individual chat messages"""
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('file', 'File'),
        ('system', 'System'),
    ]
    
    SENDER_TYPES = [
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
        ('principal', 'Principal'),
        ('system', 'System'),
    ]
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPES)
    sender_id = models.IntegerField()  # ID of student or admin
    sender_name = models.CharField(max_length=100)  # Name for display
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    content = models.TextField()
    file_url = models.URLField(blank=True, null=True)  # For file messages
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender_name}: {self.content[:50]}..."
    
    def mark_as_read(self):
        """Mark message as read"""
        self.is_read = True
        self.save(update_fields=['is_read'])
    
    def delete_message(self):
        """Mark message as deleted (unsend)"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.content = "This message was deleted"
        self.save(update_fields=['is_deleted', 'deleted_at', 'content'])


class ChatNotification(models.Model):
    """Notifications for unread messages"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='notifications')
    recipient_type = models.CharField(max_length=10, choices=ChatMessage.SENDER_TYPES)
    recipient_id = models.IntegerField()
    unread_count = models.IntegerField(default=0)
    last_message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['room', 'recipient_type', 'recipient_id']
    
    def __str__(self):
        return f"Notification for {self.recipient_type} {self.recipient_id}: {self.unread_count} unread"