import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  User,
  Shield,
  GraduationCap,
  Clock,
  CheckCheck,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: number;
  content: string;
  sender_type: 'student' | 'admin' | 'faculty' | 'principal';
  sender_id: number;
  sender_name: string;
  timestamp: string;
  is_read: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
}

interface ChatRoom {
  id: number;
  student_name: string;
  student_id: number;
  admin_name: string;
  admin_id: number;
  room_name: string;
  unread_count: number;
  last_message_time: string;
  recipient_type: 'admin' | 'faculty' | 'principal';
}

interface StudentMessagesProps {
  studentId: number;
  studentName: string;
}

export default function StudentMessages({ studentId, studentName }: StudentMessagesProps) {
  const [activeConversation, setActiveConversation] = useState<'admin' | 'faculty' | 'principal' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Check for existing chat rooms on component mount
  useEffect(() => {
    checkExistingRooms();
  }, [studentId]);

  // Disable WebSocket completely for now
  const [wsDisabled] = useState(true);

  const checkExistingRooms = async () => {
    try {
      console.log(`🔍 Checking existing rooms for student ID: ${studentId}, name: ${studentName}`);
      const response = await fetch(`http://127.0.0.1:8000/api/chat/rooms/?user_type=student&user_id=${studentId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('🔍 Existing rooms response:', data);
      
      if (data.success && data.rooms && data.rooms.length > 0) {
        console.log(`✅ Found ${data.rooms.length} existing rooms`);
        setRooms(data.rooms);
        
        // If there are existing rooms with messages, we might want to show them
        const roomWithMessages = data.rooms.find((room: ChatRoom) => room.unread_count > 0);
        if (roomWithMessages) {
          console.log(`📨 Auto-opening room with unread messages: ${roomWithMessages.id}`);
          // Automatically open the conversation with unread messages
          setActiveConversation(roomWithMessages.recipient_type as 'admin' | 'faculty' | 'principal');
          // WebSocket disabled - using HTTP only
          if (!wsDisabled) {
            connectWebSocket(roomWithMessages.id);
          }
          fetchMessages(roomWithMessages.id);
        }
      } else {
        console.log('❌ No existing rooms found');
      }
    } catch (error) {
      console.error('Error checking existing rooms:', error);
    }
  };

  // Conversation types with their details
  const conversationTypes = [
    {
      type: 'admin' as const,
      title: 'Admin Support',
      description: 'General queries, technical support, and administrative matters',
      icon: Shield,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      type: 'faculty' as const,
      title: 'Faculty',
      description: 'Academic questions, assignments, and subject-related queries',
      icon: GraduationCap,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      type: 'principal' as const,
      title: 'Principal',
      description: 'Important matters, complaints, and official communications',
      icon: User,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  // Get conversation details
  const getConversationDetails = (type: string) => {
    return conversationTypes.find(conv => conv.type === type);
  };

  // Fetch or create chat room
  const initializeConversation = async (type: 'admin' | 'faculty' | 'principal') => {
    setLoading(true);
    try {
      // Create or get chat room
      const response = await fetch('http://127.0.0.1:8000/api/chat/rooms/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          student_id: studentId,
          admin_id: 1, // You might need to adjust this based on the type
          recipient_type: type
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setActiveConversation(type);
        // WebSocket disabled - using HTTP only
        if (!wsDisabled) {
          connectWebSocket(data.room.id);
        }
        fetchMessages(data.room.id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Connect to WebSocket with retry logic
  const connectWebSocket = (roomId: number, retryCount = 0) => {
    const maxRetries = 3;
    
    if (retryCount === 0) {
      console.log('🔌 Attempting to connect to WebSocket for room:', roomId);
    } else {
      console.log(`🔌 WebSocket retry attempt ${retryCount}/${maxRetries} for room:`, roomId);
    }
    
    if (socket) {
      socket.close();
    }

    const protocol = 'ws:';
    const wsUrl = `${protocol}//127.0.0.1:8000/ws/chat/${roomId}/`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      setIsConnected(true);
    };
    
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'chat_message':
          setMessages(prev => [...prev, data.message]);
          break;
        case 'recent_messages':
          setMessages(data.messages);
          break;
        case 'messages_read':
          setMessages(prev => prev.map(msg => 
            data.message_ids.includes(msg.id) ? { ...msg, is_read: true } : msg
          ));
          break;
        case 'typing_indicator':
          if (data.sender_name !== studentName) {
            setOtherUserTyping(data.is_typing);
          }
          break;
      }
    };
    
    newSocket.onclose = (event) => {
      setIsConnected(false);
      
      // Only retry if it's not a normal closure and we haven't exceeded max retries
      if (event.code !== 1000 && retryCount < maxRetries) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`🔄 WebSocket will retry in ${retryDelay}ms`);
        setTimeout(() => {
          connectWebSocket(roomId, retryCount + 1);
        }, retryDelay);
      } else if (retryCount >= maxRetries) {
        console.log('❌ WebSocket max retries exceeded. Using HTTP fallback only.');
      }
    };
    
    newSocket.onerror = (error) => {
      console.log('❌ WebSocket connection failed. Will use HTTP fallback.');
      setIsConnected(false);
    };
    
    setSocket(newSocket);
  };

  // Fetch messages for a room
  const fetchMessages = async (roomId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/chat/rooms/${roomId}/`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    if (socket && isConnected) {
      // Send via WebSocket if connected
      const messageData = {
        type: 'chat_message',
        message: messageContent,
        sender_type: 'student',
        sender_id: studentId,
        sender_name: studentName
      };
      
      socket.send(JSON.stringify(messageData));
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        socket.send(JSON.stringify({
          type: 'typing',
          sender_name: studentName,
          is_typing: false
        }));
      }
    } else {
      // HTTP fallback when WebSocket is not connected
      console.log('📡 WebSocket not connected, using HTTP fallback');
      
      // Add message to local state immediately for instant feedback
      const localMessage: Message = {
        id: Date.now(),
        content: messageContent,
        sender_type: 'student',
        sender_id: studentId,
        sender_name: studentName,
        timestamp: new Date().toISOString(),
        is_read: false
      };
      
      setMessages(prev => [...prev, localMessage]);
      
      try {
        // Get the current room ID from the rooms state
        const currentRoom = rooms.find(room => room.recipient_type === activeConversation);
        if (!currentRoom) {
          console.error('No active room found');
          return;
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/chat/send-message/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            room_id: currentRoom.id,
            content: messageContent,
            sender_type: 'student',
            sender_id: studentId,
            sender_name: studentName
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ Message sent via HTTP');
          // Update the temporary message with the real ID from server
          setMessages(prev => prev.map(msg => 
            msg.id === localMessage.id 
              ? { ...msg, id: data.message.id, timestamp: data.message.timestamp }
              : msg
          ));
        } else {
          console.error('❌ HTTP message send failed:', data.error);
        }
      } catch (error) {
        console.error('❌ HTTP message send error:', error);
      }
    }
  };

  // Handle typing
  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!socket) return;
    
    if (value && !isTyping) {
      setIsTyping(true);
      socket.send(JSON.stringify({
        type: 'typing',
        sender_name: studentName,
        is_typing: true
      }));
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.send(JSON.stringify({
          type: 'typing',
          sender_name: studentName,
          is_typing: false
        }));
      }
    }, 1000);
  };

  // Delete message function
  const deleteMessage = async (messageId: number) => {
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
          user_type: 'student',
          user_id: studentId
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
                is_deleted: true,
                deleted_at: data.deleted_message.deleted_at
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

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {!activeConversation ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
            <p className="text-gray-600">Choose who you'd like to communicate with</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {conversationTypes.map((conv) => {
              const IconComponent = conv.icon;
              const existingRoom = rooms.find(room => room.recipient_type === conv.type);
              const hasUnreadMessages = existingRoom && existingRoom.unread_count > 0;
              
              return (
                <motion.div
                  key={conv.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-200 ${
                      hasUnreadMessages ? 'border-orange-300 bg-orange-50' : ''
                    }`}
                    onClick={() => initializeConversation(conv.type)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 ${conv.color} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
                        <IconComponent className="h-8 w-8 text-white" />
                        {hasUnreadMessages && (
                          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                            {existingRoom.unread_count}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className={`text-lg ${conv.textColor}`}>
                        {conv.title}
                        {hasUnreadMessages && (
                          <span className="ml-2 text-red-500">•</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        {conv.description}
                      </p>
                      {existingRoom && existingRoom.last_message_time ? (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">
                            Last message: {new Date(existingRoom.last_message_time).toLocaleString()}
                          </p>
                        </div>
                      ) : null}
                      <Button 
                        className={`w-full ${hasUnreadMessages ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <MessageSquare className="h-4 w-4 mr-2" />
                        )}
                        {existingRoom ? 'Continue Conversation' : 'Start Conversation'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Conversation Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {(() => {
                  const conv = getConversationDetails(activeConversation);
                  const IconComponent = conv?.icon || User;
                  return (
                    <>
                      <div className={`w-10 h-10 ${conv?.color} rounded-full flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{conv?.title}</h3>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <Card className="h-96">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'student' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                          message.is_deleted 
                            ? 'bg-gray-100 text-gray-500 italic border border-gray-300'
                            : message.sender_type === 'student'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          <div className="flex items-center space-x-1">
                            {message.sender_type === 'student' && !message.is_deleted && (
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 hover:text-white rounded p-1"
                                title="Delete message"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                            {message.sender_type === 'student' && !message.is_deleted && (
                              <span className="ml-1">
                                {message.is_read ? <CheckCheck className="h-3 w-3" /> : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {otherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    disabled={false}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}