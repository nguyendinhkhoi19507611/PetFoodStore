import api from './api';

const notificationService = {
  // Get user notifications
  getUserNotifications: (unreadOnly = false) => {
    return api.get('/notifications', { params: { unreadOnly } });
  },

  // Get unread notification count
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  }
};

export default notificationService;