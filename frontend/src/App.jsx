
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Customer pages
import Home from './pages/customer/Home';
import ProductDetail from './components/product/ProductDetail';
import Cart from './components/cart/Cart';
import Orders from './pages/customer/Orders';
import Profile from './pages/customer/Profile';
import Payment from './pages/customer/Payment';
import PaymentReturn from './pages/customer/PaymentReturn';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminChatDashboard from './components/admin/AdminChatDashboard';

// Employee pages
import OrderManagement from './pages/employee/OrderManagement';

// Chat components
import ChatButton from './components/chat/ChatButton';
import NotificationBell from './components/notifications/NotificationBell';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.roles?.[0];
  
  if (!user.token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Admin/Employee Layout with Sidebar
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdminOrEmployee = user.roles?.[0] === 'ADMIN' || user.roles?.[0] === 'EMPLOYEE';

  if (!isAdminOrEmployee) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} showMenuButton={true} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Customer Layout
const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      
      {/* Chat Button for customers */}
      <ChatButton />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Auth routes - No layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Customer routes with CustomerLayout */}
              <Route path="/" element={
                <CustomerLayout>
                  <Home />
                </CustomerLayout>
              } />
              <Route path="/product/:id" element={
                <CustomerLayout>
                  <ProductDetail />
                </CustomerLayout>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <Cart />
                  </CustomerLayout>
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <Orders />
                  </CustomerLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <Profile />
                  </CustomerLayout>
                </ProtectedRoute>
              } />
              
              {/* Payment routes */}
              <Route path="/payment/:orderId" element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <Payment />
                  </CustomerLayout>
                </ProtectedRoute>
              } />
              <Route path="/payment/return" element={
                <PaymentReturn />
              } />
              
              {/* Admin routes with AdminLayout */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <ProductManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/chat" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                  <AdminLayout>
                    <AdminChatDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Employee routes with AdminLayout */}
              <Route path="/employee/orders" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                  <AdminLayout>
                    <OrderManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/employee/chat" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                  <AdminLayout>
                    <AdminChatDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Redirect based on role after login */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RedirectBasedOnRole />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </CartProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

// Component to redirect users based on their role
const RedirectBasedOnRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.roles?.[0];
  
  if (userRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  } else if (userRole === 'EMPLOYEE') {
    return <Navigate to="/employee/orders" />;
  } else {
    return <Navigate to="/" />;
  }
};

export default App;