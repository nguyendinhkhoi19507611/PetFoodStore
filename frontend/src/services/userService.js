import api from './api';

const userService = {
  // Get current user profile
  getProfile: () => {
    return api.get('/users/profile');
  },

  // Update current user profile
  updateProfile: (userData) => {
    return api.put('/users/profile', userData);
  },

  // Change password
  changePassword: (passwordData) => {
    return api.post('/users/change-password', passwordData);
  },

  // Admin endpoints
  getAllUsers: () => {
    return api.get('/users/all');
  },

  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  createUser: (userData) => {
    return api.post('/users', userData);
  },

  updateUser: (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  toggleUserStatus: (id) => {
    return api.put(`/users/${id}/toggle-status`);
  },

  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },
};

export default userService;