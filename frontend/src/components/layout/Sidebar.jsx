import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  X,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const menuItems = [
    ...(isAdmin ? [{
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin/dashboard'
    }] : []),
    ...(isAdmin ? [{
      icon: Package,
      label: 'Quản lý sản phẩm',
      path: '/admin/products'
    }] : []),
    ...(isAdmin ? [{
      icon: Users,
      label: 'Quản lý người dùng',
      path: '/admin/users'
    }] : []),
    {
      icon: ShoppingCart,
      label: 'Quản lý đơn hàng',
      path: '/employee/orders'
    },
    {
      icon: MessageCircle,
      label: 'Chat hỗ trợ',
      path: '/employee/chat'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {isAdmin ? 'Admin Panel' : 'Nhân viên'}
          </h2>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-gray-500">
                {user?.roles?.[0] === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={`
                    flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-md transition-colors
                    ${active 
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 mr-3 ${active ? 'text-primary-600' : ''}`} />
                  {item.label}
                  {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Pet Food Store © 2024
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;