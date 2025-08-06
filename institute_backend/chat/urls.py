from django.urls import path
from .views import (
    ChatRoomListView, ChatRoomDetailView, CreateChatRoomView,
    ChatNotificationView, MarkMessagesReadView, AllStudentsForChatView,
    SendMessageView, DeleteMessageView
)

urlpatterns = [
    path('api/chat/rooms/', ChatRoomListView.as_view(), name='chat-rooms'),
    path('api/chat/rooms/<int:room_id>/', ChatRoomDetailView.as_view(), name='chat-room-detail'),
    path('api/chat/rooms/create/', CreateChatRoomView.as_view(), name='create-chat-room'),
    path('api/chat/notifications/', ChatNotificationView.as_view(), name='chat-notifications'),
    path('api/chat/mark-read/', MarkMessagesReadView.as_view(), name='mark-messages-read'),
    path('api/chat/students/', AllStudentsForChatView.as_view(), name='all-students-for-chat'),
    path('api/chat/send-message/', SendMessageView.as_view(), name='send-message'),
    path('api/chat/delete-message/', DeleteMessageView.as_view(), name='delete-message'),
]