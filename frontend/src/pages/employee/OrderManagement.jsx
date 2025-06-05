import React, { useState, useEffect } from 'react';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
  Smartphone,
  XCircle,
  AlertCircle
} from 'lucide-react';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('ALL');
  const [orderPayments, setOrderPayments] = useState({});

  const orderStatuses = [
    { value: 'ALL', label: 'Tất cả', count: 0 },
    { value: 'PENDING', label: 'Chờ xác nhận', count: 0 },
    { value: 'CONFIRMED', label: 'Đã xác nhận', count: 0 },
    { value: 'PROCESSING', label: 'Đang xử lý', count: 0 },
    { value: 'SHIPPED', label: 'Đang giao hàng', count: 0 },
    { value: 'DELIVERED', label: 'Đã giao hàng', count: 0 },
    { value: 'CANCELLED', label: 'Đã hủy', count: 0 }
  ];

  const dateRanges = [
    { value: 'ALL', label: 'Tất cả thời gian' },
    { value: 'TODAY', label: 'Hôm nay' },
    { value: 'WEEK', label: '7 ngày qua' },
    { value: 'MONTH', label: '30 ngày qua' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response;
      if (filterStatus === 'ALL') {
        response = await orderService.getAllOrders();
      } else {
        response = await orderService.getOrdersByStatus(filterStatus);
      }
      setOrders(response.data);
      
      // Fetch payment info for each order
      for (const order of response.data) {
        fetchOrderPayments(order.id);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrderPayments = async (orderId) => {
    try {
      const response = await paymentService.getPaymentsByOrder(orderId);
      setOrderPayments(prev => ({
        ...prev,
        [orderId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching payments for order', orderId, error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm('Bạn có chắc muốn thay đổi trạng thái đơn hàng này?')) {
      try {
        await orderService.updateOrderStatus(orderId, newStatus);
        alert('Cập nhật trạng thái đơn hàng thành công!');
        fetchOrders();
        setExpandedOrder(null);
      } catch (error) {
        alert('Lỗi: Không thể cập nhật trạng thái đơn hàng');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
      SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      REFUNDED: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ thanh toán',
      PROCESSING: 'Đang xử lý',
      COMPLETED: 'Đã thanh toán',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền'
    };
    return labels[status] || status;
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-3 w-3" />;
      case 'FAILED': return <XCircle className="h-3 w-3" />;
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'PROCESSING': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'MOMO': return <Smartphone className="h-4 w-4 text-pink-600" />;
      case 'CASH_ON_DELIVERY': return <Package className="h-4 w-4 text-green-600" />;
      case 'BANK_TRANSFER': return <CreditCard className="h-4 w-4 text-blue-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      MOMO: 'Ví MoMo',
      CASH_ON_DELIVERY: 'Thanh toán khi nhận hàng',
      BANK_TRANSFER: 'Chuyển khoản ngân hàng'
    };
    return labels[method] || method;
  };

  const getOrderStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      CONFIRMED: '✅',
      PROCESSING: '⚙️',
      SHIPPED: '🚚',
      DELIVERED: '📦',
      CANCELLED: '❌'
    };
    return icons[status] || '📋';
  };

  const getOrderStatusLabel = (status) => {
    const label = orderStatuses.find(s => s.value === status);
    return label ? label.label : status;
  };

  const getMainPayment = (payments) => {
    if (!payments || payments.length === 0) return null;
    // Ưu tiên payment có status COMPLETED, nếu không có thì lấy payment mới nhất
    return payments.find(p => p.status === 'COMPLETED') || payments[payments.length - 1];
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filterOrdersByDate = (orders) => {
    if (dateRange === 'ALL') return orders;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (dateRange) {
        case 'TODAY':
          return orderDate >= today;
        case 'WEEK':
          return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'MONTH':
          return orderDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });
  };

  const filterOrdersBySearch = (orders) => {
    if (!searchTerm) return orders;
    
    return orders.filter(order =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm)
    );
  };

  const filteredOrders = filterOrdersBySearch(filterOrdersByDate(orders));

  // Calculate status counts
  const statusCounts = orderStatuses.map(status => ({
    ...status,
    count: status.value === 'ALL' ? orders.length : orders.filter(order => order.status === status.value).length
  }));

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            <Download className="h-4 w-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Lọc theo trạng thái:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusCounts.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
                filterStatus === status.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.value !== 'ALL' && <span>{getOrderStatusIcon(status.value)}</span>}
              {status.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filterStatus === status.value ? 'bg-white text-primary-600' : 'bg-white text-gray-600'
              }`}>
                {status.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Date Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredOrders.filter(o => o.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredOrders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(filteredOrders
                  .filter(o => o.status !== 'CANCELLED')
                  .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
          <p className="text-gray-600">
            {searchTerm || dateRange !== 'ALL' 
              ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc' 
              : 'Chưa có đơn hàng nào trong trạng thái này'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const payments = orderPayments[order.id] || [];
            const mainPayment = getMainPayment(payments);
            
            return (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDateShort(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {order.user.fullName || order.user.username}
                          </span>
                          {mainPayment && (
                            <span className="flex items-center gap-1">
                              {getPaymentMethodIcon(mainPayment.method)}
                              {getPaymentMethodLabel(mainPayment.method)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusIcon(order.status)} {getOrderStatusLabel(order.status)}
                          </span>
                          {mainPayment && (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(mainPayment.status)}`}>
                              {getPaymentStatusIcon(mainPayment.status)}
                              {getPaymentStatusLabel(mainPayment.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Status Update */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Trạng thái đơn hàng:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {orderStatuses.slice(1).map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quick Next Status Button */}
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                          className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Chuyển sang {getOrderStatusLabel(getNextStatus(order.status))}
                        </button>
                      )}

                      {/* Payment Status Info */}
                      {mainPayment && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                          <span className="text-xs text-gray-600">Thanh toán:</span>
                          <span className={`text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(mainPayment.status).replace('bg-', 'text-').replace('-100', '-600')}`}>
                            {getPaymentStatusIcon(mainPayment.status)}
                            {getPaymentStatusLabel(mainPayment.status)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Toggle Details Button */}
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition"
                    >
                      <Eye className="h-4 w-4" />
                      {expandedOrder === order.id ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Ẩn chi tiết
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Xem chi tiết
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Order Details */}
                {expandedOrder === order.id && (
                  <div className="p-6 bg-gray-50 border-t">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      {/* Customer Info */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          Thông tin khách hàng
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Họ tên:</span>
                              <p>{order.user.fullName || order.user.username}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">SĐT:</span>
                              <p>{order.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Địa chỉ:</span>
                              <p>{order.shippingAddress}</p>
                            </div>
                          </div>
                          {order.notes && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div>
                                <span className="font-medium">Ghi chú:</span>
                                <p className="text-gray-600">{order.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-600" />
                          Thông tin đơn hàng
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Mã đơn:</span>
                            <span className="font-mono">{order.orderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Ngày tạo:</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          {order.updatedAt && (
                            <div className="flex justify-between">
                              <span className="font-medium">Cập nhật:</span>
                              <span>{formatDate(order.updatedAt)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="font-medium">Số lượng sản phẩm:</span>
                            <span>{order.orderItems.length}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-primary-600 pt-2 border-t">
                            <span>Tổng tiền:</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                          Thông tin thanh toán
                        </h4>
                        {mainPayment ? (
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Phương thức:</span>
                              <div className="flex items-center gap-1">
                                {getPaymentMethodIcon(mainPayment.method)}
                                <span>{getPaymentMethodLabel(mainPayment.method)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Trạng thái:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(mainPayment.status)}`}>
                                {getPaymentStatusIcon(mainPayment.status)}
                                {getPaymentStatusLabel(mainPayment.status)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Số tiền:</span>
                              <span className="font-semibold text-primary-600">
                                {formatPrice(mainPayment.amount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Thời gian tạo:</span>
                              <span className="text-gray-600 text-xs">
                                {formatDate(mainPayment.createdAt)}
                              </span>
                            </div>
                            {mainPayment.paidAt && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Đã thanh toán:</span>
                                <span className="text-green-600 text-xs">
                                  {formatDate(mainPayment.paidAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Chưa có thông tin thanh toán
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-100 border-b">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Package className="h-5 w-5 text-purple-600" />
                          Chi tiết sản phẩm
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Sản phẩm
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                Số lượng
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Đơn giá
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {order.orderItems.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {item.product.imageUrl ? (
                                      <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="h-12 w-12 rounded object-cover"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium">{item.product.name}</p>
                                      <p className="text-sm text-gray-500">{item.product.category}</p>
                                      {item.product.brand && (
                                        <p className="text-xs text-gray-400">{item.product.brand}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center font-medium">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {formatPrice(item.price)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold">
                                  {formatPrice(item.price * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-right font-semibold text-lg">
                                Tổng cộng:
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-lg text-primary-600">
                                {formatPrice(order.totalAmount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Multiple Payments (if any) */}
                    {payments.length > 1 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-indigo-600" />
                          Lịch sử thanh toán
                        </h4>
                        <div className="bg-white rounded-lg overflow-hidden border">
                          {payments.map((payment, index) => (
                            <div key={payment.id} className={`p-4 ${index > 0 ? 'border-t' : ''}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getPaymentMethodIcon(payment.method)}
                                  <div>
                                    <p className="font-medium text-sm">
                                      {getPaymentMethodLabel(payment.method)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(payment.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(payment.status)}`}>
                                    {getPaymentStatusIcon(payment.status)}
                                    {getPaymentStatusLabel(payment.status)}
                                  </span>
                                  <p className="text-sm font-medium mt-1">
                                    {formatPrice(payment.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;