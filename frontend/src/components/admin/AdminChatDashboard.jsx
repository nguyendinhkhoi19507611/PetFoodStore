import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import chatService from '../../services/chatService';
import ChatWindow from '../chat/ChatWindow';

const AdminChatDashboard = () => {
  const { connected } = useWebSocket();
  const [chatRooms, setChatRooms] = useState([]);
  const [unassignedRooms, setUnassignedRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatRooms();
    loadUnassignedRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      const response = await chatService.getUserChatRooms();
      setChatRooms(response.data);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const loadUnassignedRooms = async () => {
    try {
      const response = await chatService.getUnassignedRooms();
      setUnassignedRooms(response.data);
    } catch (error) {
      console.error('Error loading unassigned rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRoom = async (roomId) => {
    try {
      await chatService.assignStaffToRoom(roomId);
      // Refresh lists
      loadChatRooms();
      loadUnassignedRooms();
      alert('Đã nhận hỗ trợ khách hàng');
    } catch (error) {
      console.error('Error assigning room:', error);
      alert('Lỗi khi nhận hỗ trợ');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Chưa có tin nhắn';
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'WAITING': return 'text-yellow-600 bg-yellow-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getRoomStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'WAITING': return <Clock className="h-4 w-4" />;
      case 'CLOSED': return <AlertCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý Chat</h1>
        <div className="flex items-center gap-2 text-sm">
          <div className={`flex items-center gap-1 ${connected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {connected ? 'Đã kết nối' : 'Mất kết nối'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ hỗ trợ</p>
              <p className="text-2xl font-bold text-gray-900">{unassignedRooms.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang hỗ trợ</p>
              <p className="text-2xl font-bold text-gray-900">
                {chatRooms.filter(room => room.status === 'ACTIVE').length}
              </p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng cuộc trò chuyện</p>
              <p className="text-2xl font-bold text-gray-900">{chatRooms.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unassigned Rooms */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-6 w-6 text-yellow-600" />
              Khách hàng chờ hỗ trợ ({unassignedRooms.length})
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {unassignedRooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Không có khách hàng nào đang chờ</p>
              </div>
            ) : (
              unassignedRooms.map((room) => (
                <div key={room.id} className="p-4 border-b hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{room.customerName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoomStatusColor(room.status)}`}>
                          {getRoomStatusIcon(room.status)}
                          {room.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{room.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tạo lúc: {formatTime(room.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAssignRoom(room.roomId)}
                      className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition flex items-center gap-1"
                    >
                      <UserCheck className="h-3 w-3" />
                      Nhận hỗ trợ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Chat Rooms */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-green-600" />
              Cuộc trò chuyện của tôi ({chatRooms.length})
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {chatRooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              chatRooms.map((room) => (
                <div 
                  key={room.id} 
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRoom(room.roomId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{room.customerName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoomStatusColor(room.status)}`}>
                          {getRoomStatusIcon(room.status)}
                          {room.status}
                        </span>
                        {room.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {room.lastMessage.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(room.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {selectedRoom && (
        <ChatWindow
          roomId={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          minimized={false}
          onToggleMinimize={() => {}}
        />
      )}
    </div>
  );
};

export default AdminChatDashboard;