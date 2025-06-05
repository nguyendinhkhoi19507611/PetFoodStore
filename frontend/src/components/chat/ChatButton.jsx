import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import ChatWindow from './ChatWindow';
import chatService from '../../services/chatService';

const ChatButton = () => {
  const { isAuthenticated } = useAuth();
  const { connected } = useWebSocket();
  const [showChat, setShowChat] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenChat = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để sử dụng tính năng chat');
      return;
    }

    if (roomId) {
      setShowChat(true);
      setMinimized(false);
      return;
    }

    setLoading(true);
    try {
      const response = await chatService.createChatRoom('SUPPORT', 'Hỗ trợ khách hàng');
      setRoomId(response.data.roomId);
      setShowChat(true);
      setMinimized(false);
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('Không thể mở chat. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setMinimized(false);
  };

  const handleToggleMinimize = () => {
    if (!showChat) {
      handleOpenChat();
    } else {
      setMinimized(!minimized);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (showChat && roomId) {
    return (
      <ChatWindow
        roomId={roomId}
        onClose={handleCloseChat}
        minimized={minimized}
        onToggleMinimize={handleToggleMinimize}
      />
    );
  }

  return (
    <button
      onClick={handleOpenChat}
      disabled={loading || !connected}
      className="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition disabled:opacity-50 z-50"
      title="Chat với chúng tôi"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </button>
  );
};

export default ChatButton;
