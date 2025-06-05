import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Eye,
  Calendar
} from 'lucide-react';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import userService from '../../services/userService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockProducts: [],
    monthlyRevenue: 0,
    todayOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsResponse = await productService.getAllProducts();
      const products = productsResponse.data;
      
      // Fetch orders
      const ordersResponse = await orderService.getAllOrders();
      const orders = ordersResponse.data;

      // Fetch users
      const usersResponse = await userService.getAllUsers();
      const users = usersResponse.data;
      
      // Calculate stats
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalUsers = users.length;
      const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
      const totalRevenue = orders
        .filter(order => order.status !== 'CANCELLED')
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const lowStockProducts = products.filter(product => product.quantity <= 5 && product.quantity > 0);
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === currentMonth && 
                 orderDate.getFullYear() === currentYear &&
                 order.status !== 'CANCELLED';
        })
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

      // Calculate today's orders
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
      ).length;
      
      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        pendingOrders,
        totalRevenue,
        lowStockProducts,
        monthlyRevenue,
        todayOrders
      });
      
      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
      
      // Get recent users (last 5)
      setRecentUsers(users.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      CONFIRMED: 'text-blue-600 bg-blue-100',
      PROCESSING: 'text-purple-600 bg-purple-100',
      SHIPPED: 'text-indigo-600 bg-indigo-100',
      DELIVERED: 'text-green-600 bg-green-100',
      CANCELLED: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Quản trị viên',
      EMPLOYEE: 'Nhân viên',
      CUSTOMER: 'Khách hàng'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="h-12 w-12 text-blue-600" />
          </div>
          <div className="mt-2">
            <Link to="/admin/products" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Xem chi tiết <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500">Hôm nay: {stats.todayOrders}</p>
            </div>
            <ShoppingCart className="h-12 w-12 text-green-600" />
          </div>
          <div className="mt-2">
            <Link to="/employee/orders" className="text-sm text-green-600 hover:text-green-800 flex items-center">
              Quản lý đơn hàng <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-12 w-12 text-purple-600" />
          </div>
          <div className="mt-2">
            <Link to="/admin/users" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              Quản lý người dùng <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-yellow-600" />
          </div>
          {stats.pendingOrders > 0 && (
            <div className="mt-2">
              <Link to="/employee/orders" className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center">
                Xử lý ngay <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">Doanh thu tổng</p>
              <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-primary-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Doanh thu tháng này</p>
              <p className="text-3xl font-bold">{formatPrice(stats.monthlyRevenue)}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            Cảnh báo hết hàng
          </h2>
          {stats.lowStockProducts.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.category}</p>
                  </div>
                  <span className="text-orange-600 font-semibold text-sm">
                    Còn {product.quantity}
                  </span>
                </div>
              ))}
              <Link
                to="/admin/products"
                className="flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 mt-4 p-2 border border-orange-200 rounded-md hover:bg-orange-50 transition"
              >
                Quản lý sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Không có sản phẩm nào sắp hết hàng</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            Đơn hàng gần đây
          </h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-600">{order.user.fullName || order.user.username}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</span>
                    <span className="font-semibold text-sm">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
              <Link
                to="/employee/orders"
                className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 mt-4 p-2 border border-green-200 rounded-md hover:bg-green-50 transition"
              >
                Xem tất cả đơn hàng
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Người dùng mới
          </h2>
          {recentUsers.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentUsers.map((user) => (
                <div key={user.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.fullName || user.username}</p>
                      <p className="text-xs text-gray-600">@{user.username}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                </div>
              ))}
              <Link
                to="/admin/users"
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 mt-4 p-2 border border-blue-200 rounded-md hover:bg-blue-50 transition"
              >
                Quản lý người dùng
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Chưa có người dùng mới</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;