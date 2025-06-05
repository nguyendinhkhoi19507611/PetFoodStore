import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  X,
  Minimize2,
  MessageCircle,
  Check,
  CheckCheck
} from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';

const ChatWindow = ({ roomId, onClose, minimized, onToggleMinimize }) => {
  const { user } = useAuth();
  const {
    connected,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendTypingIndicator,
    getRoomTypingUsers,
    messages: contextMessages  // <-- Lấy messages toàn bộ từ context 
  } = useWebSocket();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // local state
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /** 
   * Effect A: load lịch sử chat và joinRoom mỗi khi roomId hoặc connected thay đổi 
   */
  useEffect(() => {
    if (!roomId || !connected) return;

    // 1. Load chat history qua REST API
    (async () => {
      setLoading(true);
      try {
        const response = await chatService.getChatHistory(roomId);
        setMessages(response.data || []);
        scrollToBottom();
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoading(false);
      }
    })();

    // 2. Thông báo cho backend là user join room
    joinRoom(roomId);

    return () => {
      // Khi leave, hủy subscription và thông báo backend
      leaveRoom(roomId);
    };
  }, [roomId, connected, joinRoom, leaveRoom]);

  /** 
   * Effect B: cứ mỗi khi contextMessages[roomId] thay đổi (tức server đẩy tin mới), cập nhật local state 
   */
  useEffect(() => {
    if (!roomId) return;
    const roomMsgs = contextMessages[roomId] || [];
    setMessages(roomMsgs);
    scrollToBottom();
  }, [contextMessages, roomId]);

  /** 
   * Luôn scroll xuống cuối khi local `messages` thay đổi 
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !connected) return;
    sendMessage(roomId, message.trim(), 'CHAT');
    setMessage('');
    // Dừng typing indicator nếu đang gõ
    if (isTyping) {
      sendTypingIndicator(roomId, false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // Gửi typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      sendTypingIndicator(roomId, true);
    }
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Sau 1s không gõ, gửi isTyping=false
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(roomId, false);
      }
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isOwnMessage = (msg) => {
    return msg.senderId === user.id;
  };

  const getMessageStatus = (msg) => {
    if (isOwnMessage(msg)) {
      return msg.isRead
        ? <CheckCheck className="h-3 w-3 text-blue-500" />
        : <Check className="h-3 w-3 text-gray-400" />;
    }
    return null;
  };

  const typingUsers = getRoomTypingUsers(roomId);

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition"
        >
          <MessageCircle className="h-6 w-6" />
          {messages.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Hỗ trợ khách hàng</span>
          {!connected && (
            <span className="text-xs bg-red-500 px-2 py-1 rounded">
              Đang kết nối...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMinimize}
            className="text-white hover:text-gray-200 transition"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm mt-2">Đang tải...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="text-xs mt-1">Gửi tin nhắn để bắt đầu trò chuyện</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${isOwnMessage(msg)
                    ? 'bg-primary-600 text-white'
                    : msg.messageType === 'SYSTEM'
                      ? 'bg-gray-100 text-gray-600 text-center w-full'
                      : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {!isOwnMessage(msg) && msg.messageType !== 'SYSTEM' && (
                  <div className="text-xs font-medium mb-1 text-primary-600">
                    {msg.senderName}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${isOwnMessage(msg) ? 'text-primary-100 justify-end' : 'text-gray-500'
                  }`}>
                  {formatTime(msg.createdAt)}
                  {getMessageStatus(msg)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs">đang nhập...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="1"
            disabled={!connected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !connected}
            className="bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {!connected && (
          <p className="text-xs text-red-500 mt-1">Đang kết nối lại...</p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
