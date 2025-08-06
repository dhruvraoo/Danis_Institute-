import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Bell,
  Users,
  GraduationCap,
  Crown,
  X
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'student' | 'admin' | 'principal';
  receiverId: string;
  receiverType: 'admin' | 'principal';
  content: string;
  timestamp: Date;
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
  isDeleted?: boolean;
  deletedAt?: string;
}

interface ChatUser {
  id: string;
  name: string;
  type: 'student' | 'principal';
  email: string;
  rollId?: string;
  className?: string;
  studentId?: number;
  hasRoom?: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

export default function AdminMessaging() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'principal'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'class' | 'lastMessage' | 'unread'>('lastMessage');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Disable WebSocket completely for now
  const [wsDisabled] = useState(true);

  // Load chat data and initialize WebSocket
  useEffect(() => {
    loadChatRooms();
    loadNotifications();

    return () => {
      // Clean up all timers and connections
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const loadChatRooms = async () => {
    try {
      console.log('🔄 Loading all registered students...');
      const response = await fetch('http://127.0.0.1:8000/api/chat/students/', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Loaded ${data.total_count} students`);
        const users: ChatUser[] = data.students.map((student: any) => ({
          id: student.room_id ? student.room_id.toString() : `new_${student.id}`,
          name: student.name,
          type: 'student' as const,
          email: student.email,
          rollId: student.roll_id,
          className: student.class_name,
          studentId: student.id,
          hasRoom: student.has_chat_room,
          lastMessage: student.last_message?.content || (student.has_chat_room ? '' : 'No messages yet - Click to start conversation'),
          lastMessageTime: student.last_message?.timestamp ? new Date(student.last_message.timestamp) : undefined,
          unreadCount: student.unread_count || 0,
          isOnline: Math.random() > 0.5, // Mock online status for now
        }));
        
        // Sort users: those with unread messages first, then by last message time, then by name
        users.sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
          }
          if (a.lastMessageTime && !b.lastMessageTime) return -1;
          if (!a.lastMessageTime && b.lastMessageTime) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setChatUsers(users);
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      // Show error message to user
      setChatUsers([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat/notifications/?user_type=admin&user_id=1', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        // Update unread counts based on notifications
        setChatUsers(prev => prev.map(user => {
          const notification = data.notifications.find((n: any) => n.room_id.toString() === user.id);
          return notification ? { ...user, unreadCount: notification.unread_count } : user;
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const initializeWebSocket = (roomId: string, isReconnect = false) => {
    try {
      console.log('🔌 Initializing WebSocket for room:', roomId, isReconnect ? '(reconnect)' : '');
      
      // Clear existing timers
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close existing connection
      if (socketRef.current) {
        console.log('🔌 Closing existing WebSocket connection');
        socketRef.current.close();
      }

      setConnectionStatus('connecting');
      
      // Connect to specific chat room WebSocket
      const wsUrl = `ws://127.0.0.1:8000/ws/chat/${roomId}/`;
      console.log('🔌 Connecting to:', wsUrl);
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        console.log('✅ WebSocket connected to room:', roomId);
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        setLastHeartbeat(new Date());
        
        // Start heartbeat monitoring
        startHeartbeatMonitoring();
      };

      socketRef.current.onmessage = (event) => {
        console.log('📨 WebSocket message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Clear heartbeat monitoring
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        // Attempt reconnection if not intentional close
        if (event.code !== 1000 && reconnectAttempts < 5) {
          attemptReconnection(roomId);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      setIsConnected(false);
      setConnectionStatus('error');
    }
  };

  const attemptReconnection = (roomId: string) => {
    const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max 30 seconds
    console.log(`🔄 Attempting reconnection in ${backoffDelay}ms (attempt ${reconnectAttempts + 1})`);
    
    setReconnectAttempts(prev => prev + 1);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      initializeWebSocket(roomId, true);
    }, backoffDelay);
  };

  const startHeartbeatMonitoring = () => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // Send ping every 30 seconds
  };

  // Delete message function
  const deleteMessage = async (messageId: string) => {
    try {
      console.log('🗑️ Deleting message:', messageId);
      
      const response = await fetch('http://127.0.0.1:8000/api/chat/delete-message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message_id: messageId,
          user_type: 'admin',
          user_id: 1
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Message deleted successfully');
        // Update the message in local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                content: 'This message was deleted',
                isDeleted: true,
                deletedAt: data.deleted_message.deleted_at
              }
            : msg
        ));
      } else {
        console.error('❌ Failed to delete message:', data.error);
        alert('Failed to delete message: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      alert('Error deleting message. Please try again.');
    }
  };

  const handleIncomingMessage = (data: any) => {
    if (data.type === 'chat_message') {
      const newMessage: Message = {
        id: data.message.id.toString(),
        senderId: data.message.sender_id.toString(),
        senderName: data.message.sender_name,
        senderType: data.message.sender_type,
        receiverId: 'admin',
        receiverType: 'admin',
        content: data.message.content,
        timestamp: new Date(data.message.timestamp),
        isRead: data.message.is_read,
        status: 'delivered'
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Update chat users list
      setChatUsers(prev => prev.map(user => 
        user.id === activeChat && data.message.sender_type === 'student'
          ? { 
              ...user, 
              lastMessage: newMessage.content,
              lastMessageTime: newMessage.timestamp,
              unreadCount: user.unreadCount + 1
            }
          : user
      ));
    } else if (data.type === 'recent_messages') {
      const recentMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id.toString(),
        senderId: msg.sender_id.toString(),
        senderName: msg.sender_name,
        senderType: msg.sender_type,
        receiverId: 'admin',
        receiverType: 'admin',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        isRead: msg.is_read,
        status: 'delivered'
      }));
      setMessages(recentMessages);
    } else if (data.type === 'connection_established') {
      console.log('✅ Connection established:', data.connection_id);
      setConnectionStatus('connected');
    } else if (data.type === 'heartbeat') {
      setLastHeartbeat(new Date(data.timestamp));
      // Send heartbeat response
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        }));
      }
    } else if (data.type === 'pong') {
      setLastHeartbeat(new Date(data.timestamp));
    } else if (data.type === 'typing_indicator') {
      if (data.sender_name !== 'Admin') {
        setOtherUserTyping(data.is_typing);
        setTypingUser(data.sender_name);
        
        // Clear typing indicator after a timeout
        if (data.is_typing) {
          setTimeout(() => {
            setOtherUserTyping(false);
            setTypingUser('');
          }, 3000);
        }
      }
    } else if (data.type === 'error') {
      console.error('WebSocket error received:', data);
      setConnectionStatus('error');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    console.log('📤 Sending message:', newMessage.trim());
    console.log('🔌 WebSocket connected:', isConnected);
    console.log('🎯 Active chat:', activeChat);

    // Create local message immediately for instant feedback
    const localMessage: Message = {
      id: `temp_${Date.now()}`,
      senderId: '1', // Admin ID
      senderName: 'Admin',
      senderType: 'admin',
      receiverId: activeChat,
      receiverType: 'admin',
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
      status: 'sent'
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, localMessage]);

    // Send via WebSocket if connected
    if (socketRef.current && isConnected) {
      const message = {
        type: 'chat_message',
        message: newMessage.trim(),
        sender_type: 'admin',
        sender_id: 1, // Admin ID
        sender_name: 'Admin'
      };

      try {
        socketRef.current.send(JSON.stringify(message));
        console.log('✅ Message sent via WebSocket');
      } catch (error) {
        console.error('❌ WebSocket send error:', error);
        // Update message status to show error
        setMessages(prev => prev.map(msg => 
          msg.id === localMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }
    } else {
      console.warn('⚠️ WebSocket not connected, using HTTP fallback');
      // HTTP fallback - send message via REST API
      sendMessageViaHTTP(localMessage);
    }

    setNewMessage('');
  };

  const sendMessageViaHTTP = async (message: Message) => {
    try {
      console.log('📡 Sending message via HTTP API');
      const response = await fetch('http://127.0.0.1:8000/api/chat/send-message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          room_id: activeChat,
          content: message.content,
          sender_type: 'admin',
          sender_id: 1,
          sender_name: 'Admin'
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Message sent via HTTP');
        // Update the temporary message with the real ID from server
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, id: data.message.id.toString(), status: 'delivered' }
            : msg
        ));
      } else {
        console.error('❌ HTTP message send failed:', data.error);
      }
    } catch (error) {
      console.error('❌ HTTP message send error:', error);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    if (value && !isTyping) {
      setIsTyping(true);
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        sender_name: 'Admin',
        is_typing: true
      }));
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        setIsTyping(false);
        socketRef.current.send(JSON.stringify({
          type: 'typing',
          sender_name: 'Admin',
          is_typing: false
        }));
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectChat = async (chatId: string) => {
    const selectedUser = chatUsers.find(user => user.id === chatId);
    if (!selectedUser) return;

    console.log('🔄 Selecting chat for:', selectedUser.name);
    setActiveChat(chatId);
    
    let roomId = chatId;
    
    // If this student doesn't have a chat room yet, create one
    if (!selectedUser.hasRoom && selectedUser.studentId) {
      console.log('🆕 Creating new chat room for student:', selectedUser.name);
      try {
        const createResponse = await fetch('http://127.0.0.1:8000/api/chat/rooms/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            student_id: selectedUser.studentId,
            admin_id: 1,
            recipient_type: 'admin'
          }),
        });
        
        const createData = await createResponse.json();
        if (createData.success) {
          roomId = createData.room.id.toString();
          console.log('✅ Chat room created with ID:', roomId);
          
          // Update the user in local state
          setChatUsers(prev => prev.map(user => 
            user.id === chatId 
              ? { ...user, id: roomId, hasRoom: true, lastMessage: 'Start your conversation...' }
              : user
          ));
          setActiveChat(roomId);
        } else {
          console.error('❌ Failed to create chat room:', createData.error);
          return;
        }
      } catch (error) {
        console.error('❌ Error creating chat room:', error);
        return;
      }
    }
    
    // Mark messages as read if room exists
    if (selectedUser.hasRoom || roomId !== chatId) {
      try {
        await fetch('http://127.0.0.1:8000/api/chat/mark-read/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            room_id: roomId,
            user_type: 'admin',
            user_id: 1
          }),
        });
        
        // Update local state
        setChatUsers(prev => prev.map(user => 
          user.id === chatId || user.id === roomId ? { ...user, unreadCount: 0 } : user
        ));
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    }
    
    // WebSocket disabled - using HTTP only
    if (!wsDisabled) {
      initializeWebSocket(roomId);
    }
    
    // Load messages for this chat room
    await loadMessages(roomId, 1, true);
  };

  const loadMessages = async (roomId: string, page: number = 1, reset: boolean = false) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/chat/rooms/${roomId}/?page=${page}&page_size=50`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        const roomMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          senderId: msg.sender_id.toString(),
          senderName: msg.sender_name,
          senderType: msg.sender_type,
          receiverId: 'admin',
          receiverType: 'admin',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isRead: msg.is_read,
          status: 'delivered'
        }));
        
        if (reset) {
          setMessages(roomMessages);
          setCurrentPage(1);
        } else {
          // Prepend older messages to the beginning
          setMessages(prev => [...roomMessages, ...prev]);
        }
        
        setHasMoreMessages(data.pagination?.has_previous || false);
        setCurrentPage(page);
        console.log(`✅ Loaded ${roomMessages.length} messages for room ${roomId} (page ${page})`);
      }
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
      if (reset) {
        setMessages([]);
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!activeChat || !hasMoreMessages || messagesLoading) return;
    
    const nextPage = currentPage + 1;
    await loadMessages(activeChat, nextPage, false);
  };

  const filteredUsers = chatUsers
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.rollId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.className?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || user.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'class':
          if (a.className && b.className) {
            return a.className.localeCompare(b.className);
          }
          return a.className ? -1 : 1;
        case 'unread':
          return b.unreadCount - a.unreadCount;
        case 'lastMessage':
        default:
          // Sort by unread first, then by last message time, then by name
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
          }
          if (a.lastMessageTime && !b.lastMessageTime) return -1;
          if (!a.lastMessageTime && b.lastMessageTime) return 1;
          return a.name.localeCompare(b.name);
      }
    });

  const totalUnreadCount = chatUsers.reduce((sum, user) => sum + user.unreadCount, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 h-[700px] flex"
    >
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
              Messages
              {totalUnreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {totalUnreadCount}
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <span className="text-xs text-gray-500 capitalize">
                {connectionStatus}
                {reconnectAttempts > 0 && ` (${reconnectAttempts}/5)`}
              </span>
              {lastHeartbeat && (
                <span className="text-xs text-gray-400">
                  Last: {lastHeartbeat.toLocaleTimeString()}
                </span>
              )}
              {connectionStatus === 'error' && activeChat && (
                <button
                  onClick={() => initializeWebSocket(activeChat)}
                  className="text-xs text-orange-600 hover:text-orange-700 underline"
                >
                  Retry
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex space-x-1 mb-3">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs rounded-full ${
                filterType === 'all' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('student')}
              className={`px-3 py-1 text-xs rounded-full flex items-center ${
                filterType === 'student' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Students
            </button>
            <button
              onClick={() => setFilterType('principal')}
              className={`px-3 py-1 text-xs rounded-full flex items-center ${
                filterType === 'principal' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Crown className="h-3 w-3 mr-1" />
              Principal
            </button>
          </div>

          {/* Sort Options */}
          <div className="flex space-x-1">
            <span className="text-xs text-gray-500 px-2 py-1">Sort by:</span>
            <button
              onClick={() => setSortBy('lastMessage')}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === 'lastMessage' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('unread')}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === 'name' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('class')}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === 'class' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Class
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => selectChat(user.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                activeChat === user.id ? 'bg-orange-50 border-r-2 border-r-orange-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.type === 'student' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {user.type === 'student' ? (
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Crown className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    {user.lastMessageTime && (
                      <p className="text-xs text-gray-500">
                        {user.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {!user.hasRoom && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  {user.rollId && user.className && (
                    <p className="text-xs text-gray-400 mb-1">
                      Roll: {user.rollId} • Class: {user.className}
                    </p>
                  )}
                  {user.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
                  )}
                  {user.unreadCount > 0 && (
                    <div className="mt-1">
                      <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                        {user.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  chatUsers.find(u => u.id === activeChat)?.type === 'student' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {chatUsers.find(u => u.id === activeChat)?.type === 'student' ? (
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Crown className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {chatUsers.find(u => u.id === activeChat)?.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {chatUsers.find(u => u.id === activeChat)?.email}
                  </p>
                </div>
                {chatUsers.find(u => u.id === activeChat)?.isOnline && (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span className="text-sm">Online</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Load More Messages Button */}
              {hasMoreMessages && (
                <div className="text-center">
                  <button
                    onClick={loadMoreMessages}
                    disabled={messagesLoading}
                    className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {messagesLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-orange-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      'Load More Messages'
                    )}
                  </button>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                      message.isDeleted 
                        ? 'bg-gray-100 text-gray-500 italic border border-gray-300'
                        : message.senderType === 'admin'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        message.senderType === 'admin' ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex items-center space-x-1">
                        {message.senderType === 'admin' && !message.isDeleted && (
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 hover:text-white rounded p-1"
                            title="Delete message"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        {message.senderType === 'admin' && !message.isDeleted && (
                          <div className="ml-1">
                            {message.status === 'sent' && <Clock className="h-3 w-3 text-orange-200" />}
                            {message.status === 'delivered' && <CheckCircle className="h-3 w-3 text-orange-200" />}
                            {message.status === 'read' && <CheckCircle className="h-3 w-3 text-orange-200 fill-current" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{typingUser} is typing</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || connectionStatus === 'connecting'}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    connectionStatus === 'connected' 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : connectionStatus === 'connecting'
                      ? 'bg-yellow-500 text-white cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={
                    connectionStatus === 'connected' ? 'Send message' :
                    connectionStatus === 'connecting' ? 'Connecting...' :
                    connectionStatus === 'error' ? 'Connection error - will use HTTP fallback' :
                    'Disconnected - will use HTTP fallback'
                  }
                >
                  <Send className="h-4 w-4" />
                  {connectionStatus === 'connecting' && (
                    <div className="ml-2 w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a student or principal to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}