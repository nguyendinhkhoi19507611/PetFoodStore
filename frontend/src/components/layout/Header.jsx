import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, UserCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import NotificationBell from '../notifications/NotificationBell';

const Header = ({ onMenuClick, showMenuButton = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Safe destructuring with default values
  const { user, logout, isAdmin, isEmployee } = useAuth() || {};
  const { getCartItemsCount } = useCart() || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/');
      setIsUserMenuOpen(false);
    }
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Safe function to get cart count
  const getCartCount = () => {
    try {
      return getCartItemsCount ? getCartItemsCount() : 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  };

  // Safe function to get user role
  const getUserRole = () => {
    if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return 'Khách hàng';
    }
    
    const role = user.roles[0];
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'EMPLOYEE':
        return 'Nhân viên';
      default:
        return 'Khách hàng';
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button (for admin) + Logo */}
          <div className="flex items-center">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 lg:hidden mr-2"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenus}>
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">Pet Food Store</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!showMenuButton && ( // Only show for customer layout
              <>
                <Link to="/" className="text-gray-600 hover:text-primary-600 transition">
                  Trang chủ
                </Link>
                
                {user && (
                  <Link to="/orders" className="text-gray-600 hover:text-primary-600 transition">
                    Đơn hàng của tôi
                  </Link>
                )}
              </>
            )}

            {/* Admin/Employee quick links */}
            {showMenuButton && (
              <>
                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 transition flex items-center gap-1">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link to="/admin/products" className="text-gray-600 hover:text-primary-600 transition">
                      Sản phẩm
                    </Link>
                    <Link to="/admin/users" className="text-gray-600 hover:text-primary-600 transition">
                      Người dùng
                    </Link>
                  </>
                )}
                <Link to="/employee/orders" className="text-gray-600 hover:text-primary-600 transition">
                  Đơn hàng
                </Link>
                <Link to="/employee/chat" className="text-gray-600 hover:text-primary-600 transition flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Chat hỗ trợ
                </Link>
              </>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Notifications - show for all authenticated users */}
            {user && <NotificationBell />}

            {/* Cart button - only show for customers */}
            {!showMenuButton && (
              <Link to="/cart" className="relative" onClick={closeMenus}>
                <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-primary-600 transition" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User className="h-6 w-6" />
                  <span className="hidden md:block">
                    {user.fullName || user.username || 'User'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-semibold">
                        {user.fullName || user.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getUserRole()}
                      </p>
                    </div>
                    
                    {!showMenuButton && ( // Customer menu items
                      <>
                        <Link
                          to="/profile"
                          onClick={closeMenus}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <UserCircle className="h-4 w-4 mr-2" />
                          Hồ sơ cá nhân
                        </Link>
                        <Link
                          to="/orders"
                          onClick={closeMenus}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Đơn hàng của tôi
                        </Link>
                        <div className="border-t"></div>
                      </>
                    )}
                    
                    {showMenuButton && ( // Admin/Employee menu items
                      <>
                        <Link
                          to="/"
                          onClick={closeMenus}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Xem cửa hàng
                        </Link>
                        <Link
                          to="/admin/chat"
                          onClick={closeMenus}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Quản lý Chat
                        </Link>
                        <div className="border-t"></div>
                      </>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 transition"
                  onClick={closeMenus}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
                  onClick={closeMenus}
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {!showMenuButton && (
              // Customer mobile menu
              <>
                <Link
                  to="/"
                  className="block py-2 text-gray-600 hover:text-primary-600"
                  onClick={closeMenus}
                >
                  Trang chủ
                </Link>
                {user && (
                  <Link
                    to="/orders"
                    className="block py-2 text-gray-600 hover:text-primary-600"
                    onClick={closeMenus}
                  >
                    Đơn hàng của tôi
                  </Link>
                )}
              </>
            )}
            
            {showMenuButton && (
              // Admin/Employee mobile menu
              <>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="block py-2 text-gray-600 hover:text-primary-600"
                      onClick={closeMenus}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/products"
                      className="block py-2 text-gray-600 hover:text-primary-600"
                      onClick={closeMenus}
                    >
                      Sản phẩm
                    </Link>
                    <Link
                      to="/admin/users"
                      className="block py-2 text-gray-600 hover:text-primary-600"
                      onClick={closeMenus}
                    >
                      Người dùng
                    </Link>
                  </>
                )}
                <Link
                  to="/employee/orders"
                  className="block py-2 text-gray-600 hover:text-primary-600"
                  onClick={closeMenus}
                >
                  Đơn hàng
                </Link>
                <Link
                  to="/employee/chat"
                  className="block py-2 text-gray-600 hover:text-primary-600"
                  onClick={closeMenus}
                >
                  Chat hỗ trợ
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;