import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  User,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  content: string;
  sender_type: 'student' | 'admin';
  sender_id: number;
  sender_name: string;
  timestamp: string;
  is_read: boolean;
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
}

interface ChatSystemProps {
  userType: 'student' | 'admin';
  userId: number;
  userName: string;
}

export default function ChatSystem({ userType, userId, userName }: ChatSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch chat rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/?user_type=${userType}&user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setRooms(data.rooms);
        const unreadCount = data.rooms.reduce((sum: number, room: ChatRoom) => sum + room.unread_count, 0);
        setTotalUnread(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = (roomId: number) => {
    if (socket) {
      socket.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${roomId}/`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
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
          if (data.sender_name !== userName) {
            setOtherUserTyping(data.is_typing);
          }
          break;
      }
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    setSocket(newSocket);
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !activeRoom) return;
    
    const messageData = {
      type: 'chat_message',
      message: newMessage,
      sender_type: userType,
      sender_id: userId,
      sender_name: userName
    };
    
    socket.send(JSON.stringify(messageData));
    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socket.send(JSON.stringify({
        type: 'typing',
        sender_name: userName,
        is_typing: false
      }));
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
        sender_name: userName,
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
          sender_name: userName,
          is_typing: false
        }));
      }
    }, 1000);
  };

  // Select room
  const selectRoom = (room: ChatRoom) => {
    setActiveRoom(room);
    connectWebSocket(room.id);
    
    // Mark messages as read
    markMessagesAsRead(room.id);
  };

  // Mark messages as read
  const markMessagesAsRead = async (roomId: number) => {
    try {
      await fetch('/api/chat/mark-read/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          user_type: userType,
          user_id: userId
        })
      });
      
      // Update local state
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, unread_count: 0 } : room
      ));
      
      fetchRooms(); // Refresh to get updated counts
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen]);

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
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 500
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-orange-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">
                  {activeRoom ? activeRoom.room_name : 'Chat'}
                </span>
                {isConnected && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-orange-700 p-1"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-orange-700 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex h-96">
                {/* Room List */}
                <div className="w-1/3 border-r bg-gray-50">
                  <div className="p-3 border-b">
                    <h3 className="font-medium text-sm text-gray-700">
                      {userType === 'admin' ? 'Students' : 'Support'}
                    </h3>
                  </div>
                  
                  <div className="overflow-y-auto h-full">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => selectRoom(room)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                          activeRoom?.id === room.id ? 'bg-orange-50 border-orange-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {userType === 'admin' ? (
                              <User className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Shield className="h-4 w-4 text-orange-600" />
                            )}
                            <span className="text-sm font-medium">
                              {userType === 'admin' ? room.student_name : 'Admin Support'}
                            </span>
                          </div>
                          
                          {room.unread_count > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {room.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        {room.last_message_time && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(room.last_message_time).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {rooms.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No conversations yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {activeRoom ? (
                    <>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_type === userType ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg ${
                                message.sender_type === userType
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <div className="text-sm">{message.content}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                                {message.sender_type === userType && (
                                  <span className="ml-1">
                                    {message.is_read ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {otherUserTyping && (
                          <div className="flex justify-start">
                            <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">
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
                      <div className="border-t p-3">
                        <div className="flex space-x-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1"
                            disabled={!isConnected}
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || !isConnected}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a conversation to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}