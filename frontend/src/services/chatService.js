import api from './api';

const chatService = {
  // Create or get chat room
  createChatRoom: (roomType = 'SUPPORT', subject = '') => {
    return api.post('/chat/rooms', { roomType, subject });
  },

  // Get user's chat rooms
  getUserChatRooms: () => {
    return api.get('/chat/rooms');
  },

  // Get chat history for a room
  getChatHistory: (roomId) => {
    return api.get(`/chat/rooms/${roomId}/messages`);
  },

  // Close chat room
  closeChatRoom: (roomId) => {
    return api.put(`/chat/rooms/${roomId}/close`);
  },

  // Get unassigned rooms (Admin/Employee)
  getUnassignedRooms: () => {
    return api.get('/chat/rooms/unassigned');
  },

  // Assign staff to room (Admin/Employee)
  assignStaffToRoom: (roomId) => {
    return api.put(`/chat/rooms/${roomId}/assign`);
  },

  // Get unread message count
  getUnreadMessageCount: () => {
    return api.get('/chat/unread-count');
  }
};

export default chatService;