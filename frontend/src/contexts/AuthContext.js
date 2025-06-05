import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const userData = response.data;
      
      // Backend returns JwtResponse with different structure
      const userInfo = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        token: userData.token,
        roles: userData.roles,
        fullName: userData.fullName || userData.username // fallback if fullName not provided
      };
      
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      return userInfo;
    } catch (error) {
      throw error;
    }
  };

  const register = async (signupData) => {
    try {
      const response = await authService.register(signupData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.roles?.includes('ADMIN'),
    isEmployee: user?.roles?.includes('EMPLOYEE') || user?.roles?.includes('ADMIN'),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};