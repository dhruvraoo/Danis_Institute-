from django.contrib import admin
from .models import ChatRoom, ChatMessage, ChatNotification


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'admin', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at', 'admin']
    search_fields = ['student__name', 'admin__username']
    ordering = ['-updated_at']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'admin')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'sender_name', 'sender_type', 'content_preview', 'timestamp', 'is_read']
    list_filter = ['sender_type', 'message_type', 'is_read', 'timestamp']
    search_fields = ['content', 'sender_name', 'room__student__name']
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('room', 'room__student', 'room__admin')


@admin.register(ChatNotification)
class ChatNotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'recipient_type', 'recipient_id', 'unread_count', 'updated_at']
    list_filter = ['recipient_type', 'updated_at']
    search_fields = ['room__student__name', 'room__admin__username']
    ordering = ['-updated_at']
    readonly_fields = ['updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('room', 'room__student', 'room__admin')