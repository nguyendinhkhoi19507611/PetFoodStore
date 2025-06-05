import api from './api';

const authService = {
  login: (username, password) => {
    return api.post('/auth/signin', { username, password });
  },

  register: (signupData) => {
    return api.post('/auth/signup', signupData);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  },
};

export default authService;