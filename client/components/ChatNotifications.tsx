import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Bell, 
  X,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChatNotification {
  room_id: number;
  room_name: string;
  unread_count: number;
  last_message: {
    content: string;
    timestamp: string;
    sender_name: string;
    sender_type: string;
  } | null;
  updated_at: string;
}

interface ChatNotificationsProps {
  onChatOpen?: (roomId: number) => void;
}

export default function ChatNotifications({ onChatOpen }: ChatNotificationsProps) {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat/notifications/?user_type=admin&user_id=1', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setTotalUnread(data.total_unread);
      }
    } catch (error) {
      console.error('Error fetching chat notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (roomId: number) => {
    if (onChatOpen) {
      onChatOpen(roomId);
    }
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100"
      >
        <MessageSquare className="h-5 w-5 text-gray-600" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {totalUnread > 99 ? '99+' : totalUnread}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Chat Messages</h3>
                {totalUnread > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {totalUnread}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.room_id}
                    onClick={() => handleNotificationClick(notification.room_id)}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.room_name}
                          </p>
                          <Badge className="bg-orange-500 text-white text-xs">
                            {notification.unread_count}
                          </Badge>
                        </div>
                        {notification.last_message && (
                          <>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {notification.last_message.content}
                            </p>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(notification.last_message.timestamp)}</span>
                              <span>•</span>
                              <span>{notification.last_message.sender_name}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-sm font-medium text-gray-900 mb-2">No new messages</h4>
                  <p className="text-sm text-gray-500">
                    You're all caught up! New chat messages will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Open full chat interface
                    if (onChatOpen) {
                      onChatOpen(0); // 0 indicates open chat interface without specific room
                    }
                    setIsOpen(false);
                  }}
                  className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  View All Conversations
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}