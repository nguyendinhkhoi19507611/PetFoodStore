// src/contexts/WebSocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  
  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());

  // Connect to WebSocket
  const connect = () => {
    if (!user?.token || clientRef.current?.connected) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${user.token}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('WebSocket Connected:', frame);
        setConnected(true);
        
        // Subscribe to user-specific notifications
        subscribeToNotifications();
        
        // Subscribe to online status updates
        subscribeToOnlineStatus();
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
        subscriptionsRef.current.clear();
      },
      onStompError: (frame) => {
        console.error('WebSocket Error:', frame);
        setConnected(false);
      }
    });

    clientRef.current = client;
    client.activate();
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (clientRef.current) {
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();
      
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }
  };

  // Subscribe to user notifications
  const subscribeToNotifications = () => {
    if (!clientRef.current?.connected || !user?.id) return;

    const subscription = clientRef.current.subscribe(
      `/user/${user.id}/queue/notifications`,
      (message) => {
        const wsMessage = JSON.parse(message.body);
        if (wsMessage.type === 'NOTIFICATION') {
          const notification = wsMessage.payload;
          setNotifications(prev => [notification, ...prev]);
          
          // Show browser notification if permission granted
          showBrowserNotification(notification);
        }
      }
    );

    subscriptionsRef.current.set('notifications', subscription);
  };

  // Subscribe to online status updates
  const subscribeToOnlineStatus = () => {
    if (!clientRef.current?.connected) return;

    const subscription = clientRef.current.subscribe(
      '/topic/online-status',
      (message) => {
        const wsMessage = JSON.parse(message.body);
        if (wsMessage.type === 'USER_STATUS') {
          const statusUpdate = wsMessage.payload;
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (statusUpdate.status === 'ONLINE') {
              newSet.add(statusUpdate.userId);
            } else {
              newSet.delete(statusUpdate.userId);
            }
            return newSet;
          });
        }
      }
    );

    subscriptionsRef.current.set('online-status', subscription);
  };

  // Join chat room
  const joinRoom = (roomId) => {
    if (!clientRef.current?.connected) return null;

    const subscription = clientRef.current.subscribe(
      `/topic/room/${roomId}`,
      (message) => {
        const wsMessage = JSON.parse(message.body);
        
        switch (wsMessage.type) {
          case 'MESSAGE':
            const chatMessage = wsMessage.payload;
            setMessages(prev => {
              const roomMessages = prev[roomId] || [];
              return {
                ...prev,
                [roomId]: [...roomMessages, chatMessage]
              };
            });
            break;
            
          case 'TYPING':
            const typingData = wsMessage.payload;
            handleTypingIndicator(roomId, typingData);
            break;
            
          default:
            console.log('Unknown message type:', wsMessage.type);
        }
      }
    );

    subscriptionsRef.current.set(`room-${roomId}`, subscription);

    // Send join message
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/chat.joinRoom/${roomId}`,
        body: JSON.stringify({ roomId })
      });
    }

    return subscription;
  };

  // Leave chat room
  const leaveRoom = (roomId) => {
    const subscriptionKey = `room-${roomId}`;
    const subscription = subscriptionsRef.current.get(subscriptionKey);
    
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(subscriptionKey);
    }

    // Send leave message
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/chat.leaveRoom/${roomId}`,
        body: JSON.stringify({ roomId })
      });
    }
  };

  // Send message to room
  const sendMessage = (roomId, content, messageType = 'CHAT') => {
    if (!clientRef.current?.connected) return;

    const message = {
      content,
      messageType,
      roomId
    };

    clientRef.current.publish({
      destination: `/app/chat.sendMessage/${roomId}`,
      body: JSON.stringify(message)
    });
  };

  // Send typing indicator
  const sendTypingIndicator = (roomId, isTyping) => {
    if (!clientRef.current?.connected) return;

    const typingData = {
      roomId,
      isTyping,
      userId: user.id,
      userName: user.fullName || user.username
    };

    clientRef.current.publish({
      destination: `/app/chat.typing/${roomId}`,
      body: JSON.stringify(typingData)
    });
  };

  // Handle typing indicator
  const handleTypingIndicator = (roomId, typingData) => {
    if (typingData.userId === user.id) return; // Ignore own typing

    setTypingUsers(prev => {
      const newMap = new Map(prev);
      const roomTyping = newMap.get(roomId) || new Set();
      
      if (typingData.isTyping) {
        roomTyping.add(typingData.userId);
      } else {
        roomTyping.delete(typingData.userId);
      }
      
      if (roomTyping.size === 0) {
        newMap.delete(roomId);
      } else {
        newMap.set(roomId, roomTyping);
      }
      
      return newMap;
    });

    // Clear typing indicator after 3 seconds
    setTimeout(() => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const roomTyping = newMap.get(roomId) || new Set();
        roomTyping.delete(typingData.userId);
        
        if (roomTyping.size === 0) {
          newMap.delete(roomId);
        } else {
          newMap.set(roomId, roomTyping);
        }
        
        return newMap;
      });
    }, 3000);
  };

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted' && document.hidden) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  };

  // Clear room messages
  const clearRoomMessages = (roomId) => {
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[roomId];
      return newMessages;
    });
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get room messages
  const getRoomMessages = (roomId) => {
    return messages[roomId] || [];
  };

  // Get typing users for room
  const getRoomTypingUsers = (roomId) => {
    return Array.from(typingUsers.get(roomId) || []);
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  useEffect(() => {
    if (user?.token) {
      connect();
      requestNotificationPermission();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user?.token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value = {
    connected,
    messages,
    notifications,
    onlineUsers: Array.from(onlineUsers),
    
    // Room operations
    joinRoom,
    leaveRoom,
    sendMessage,
    getRoomMessages,
    clearRoomMessages,
    
    // Typing indicators
    sendTypingIndicator,
    getRoomTypingUsers,
    
    // Notifications
    clearNotifications,
    requestNotificationPermission,
    
    // User status
    isUserOnline,
    
    // Connection management
    connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};