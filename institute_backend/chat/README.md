# Real-Time Chat System

A WebSocket-based real-time chat system for communication between administrators and students.

## Features

### 🚀 **Real-Time Communication**
- **WebSocket Connection**: Instant message delivery using Django Channels
- **Typing Indicators**: See when the other person is typing
- **Read Receipts**: Know when your messages have been read
- **Connection Status**: Visual indicator of connection status

### 💬 **Chat Functionality**
- **One-on-One Chat**: Direct communication between admin and student
- **Message History**: Persistent message storage and retrieval
- **Unread Counters**: Badge showing number of unread messages
- **Auto-scroll**: Automatically scroll to latest messages

### 🎨 **User Interface**
- **Floating Chat Widget**: Minimizable chat interface
- **Responsive Design**: Works on desktop and mobile
- **Real-time Notifications**: Visual badges for unread messages
- **Smooth Animations**: Framer Motion animations for better UX

## Architecture

### Backend (Django + Channels)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Chat Models   │    │   REST API      │
│   Consumer      │◄──►│   (Room/Msg)    │◄──►│   Views         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis/Memory  │    │   PostgreSQL    │    │   HTTP Client   │
│   Channel Layer │    │   Database      │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend (React + WebSocket)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ChatSystem    │    │   WebSocket     │    │   REST API      │
│   Component     │◄──►│   Connection    │◄──►│   Calls         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Models

### ChatRoom
- Links student with admin
- Tracks conversation metadata
- Manages active status

### ChatMessage
- Stores individual messages
- Tracks sender information
- Handles read status

### ChatNotification
- Manages unread counters
- Tracks last message per user
- Enables notification badges

## API Endpoints

### Chat Management
- `GET /api/chat/rooms/` - List chat rooms
- `GET /api/chat/rooms/<id>/` - Get room details
- `POST /api/chat/rooms/create/` - Create new room
- `GET /api/chat/notifications/` - Get unread notifications
- `POST /api/chat/mark-read/` - Mark messages as read

### WebSocket
- `ws://localhost:8000/ws/chat/<room_id>/` - Real-time chat connection

## Usage

### For Students
1. **Access Chat**: Click the floating chat button on dashboard
2. **Start Conversation**: Chat room is automatically created
3. **Send Messages**: Type and press Enter or click Send
4. **View History**: All previous messages are loaded
5. **Real-time Updates**: See typing indicators and read receipts

### For Administrators
1. **View All Chats**: See list of all student conversations
2. **Respond to Students**: Click on any student to start chatting
3. **Manage Multiple Chats**: Switch between different student conversations
4. **Monitor Activity**: See unread message counts and last activity

## Setup Instructions

### 1. Install Dependencies
```bash
pip install channels channels-redis
npm install socket.io-client
```

### 2. Configure Django Settings
```python
INSTALLED_APPS = [
    # ... other apps
    'channels',
    'chat',
]

ASGI_APPLICATION = 'institute_backend.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

### 3. Run Migrations
```bash
python manage.py makemigrations chat
python manage.py migrate
```

### 4. Setup Demo Data
```bash
python manage.py setup_chat_demo
```

### 5. Start Development Server
```bash
# Django (with ASGI support)
python manage.py runserver

# React Frontend
npm run dev
```

## WebSocket Events

### Client → Server
```javascript
// Send message
{
  "type": "chat_message",
  "message": "Hello!",
  "sender_type": "student",
  "sender_id": 1,
  "sender_name": "John Doe"
}

// Typing indicator
{
  "type": "typing",
  "sender_name": "John Doe",
  "is_typing": true
}

// Mark as read
{
  "type": "mark_read",
  "message_ids": [1, 2, 3]
}
```

### Server → Client
```javascript
// New message
{
  "type": "chat_message",
  "message": {
    "id": 1,
    "content": "Hello!",
    "sender_type": "student",
    "sender_name": "John Doe",
    "timestamp": "2025-08-04T10:30:00Z",
    "is_read": false
  }
}

// Recent messages (on connect)
{
  "type": "recent_messages",
  "messages": [...]
}

// Typing indicator
{
  "type": "typing_indicator",
  "sender_name": "Admin",
  "is_typing": true
}
```

## Customization

### Styling
- Modify `ChatSystem.tsx` for UI changes
- Update Tailwind classes for different themes
- Customize colors in the component props

### Features
- Add file upload support
- Implement emoji reactions
- Add message search functionality
- Create chat rooms for groups

### Notifications
- Integrate with push notifications
- Add email notifications for offline users
- Create desktop notifications

## Troubleshooting

### WebSocket Connection Issues
1. **Check Redis**: Ensure Redis is running for channel layers
2. **CORS Settings**: Configure CORS for WebSocket connections
3. **Firewall**: Ensure WebSocket ports are open

### Message Delivery Problems
1. **Database**: Check message storage in Django admin
2. **Permissions**: Verify user permissions for chat access
3. **Network**: Test WebSocket connection in browser dev tools

### Performance Issues
1. **Message Limit**: Implement message pagination
2. **Connection Pooling**: Configure Redis connection pooling
3. **Cleanup**: Add periodic cleanup of old messages

## Security Considerations

- **Authentication**: All WebSocket connections require authentication
- **Authorization**: Users can only access their own chat rooms
- **Input Validation**: All messages are validated and sanitized
- **Rate Limiting**: Consider implementing rate limiting for message sending
- **Data Privacy**: Messages are stored securely with proper access controls

## Future Enhancements

- **File Sharing**: Upload and share documents/images
- **Voice Messages**: Record and send voice messages
- **Video Chat**: Integrate video calling functionality
- **Chat Bots**: Add automated responses for common queries
- **Analytics**: Track chat usage and response times
- **Mobile App**: Native mobile app with push notifications