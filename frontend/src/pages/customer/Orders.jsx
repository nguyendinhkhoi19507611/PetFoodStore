import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  FileText, 
  CreditCard,
  Smartphone,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderPayments, setOrderPayments] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.data);
      
      // Fetch payment info for each order
      for (const order of response.data) {
        fetchOrderPayments(order.id);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderStatusLabel = (status) => {
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
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'FAILED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PROCESSING': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  const getMainPayment = (payments) => {
    if (!payments || payments.length === 0) return null;
    // Ưu tiên payment có status COMPLETED, nếu không có thì lấy payment mới nhất
    return payments.find(p => p.status === 'COMPLETED') || payments[payments.length - 1];
  };

  const needsPayment = (order, payment) => {
    return order.status === 'PENDING' && 
           (!payment || (payment.status !== 'COMPLETED' && payment.method !== 'CASH_ON_DELIVERY'));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Chưa có đơn hàng nào</h2>
        <p className="text-gray-600 mb-8">Hãy mua sắm và tạo đơn hàng đầu tiên của bạn!</p>
        <Link
          to="/"
          className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
        >
          Bắt đầu mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const payments = orderPayments[order.id] || [];
          const mainPayment = getMainPayment(payments);
          
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="text-lg font-semibold">
                        Đơn hàng #{order.orderNumber}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                        {mainPayment && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(mainPayment.status)}`}>
                            {getPaymentStatusIcon(mainPayment.status)}
                            {getPaymentStatusLabel(mainPayment.status)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </span>
                      {mainPayment && (
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(mainPayment.method)}
                          {getPaymentMethodLabel(mainPayment.method)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-xl font-bold text-primary-600">
                      {formatPrice(order.totalAmount)}
                    </p>
                    
                    {/* Payment Action Button */}
                    {needsPayment(order, mainPayment) && (
                      <Link
                        to={`/payment/${order.id}`}
                        className="inline-block mt-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition"
                      >
                        Thanh toán ngay
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="px-6 py-3 bg-gray-50 border-b">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      <Package className="h-4 w-4 inline mr-1" />
                      {order.orderItems.length} sản phẩm
                    </span>
                    {mainPayment && mainPayment.paidAt && (
                      <span className="text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Đã thanh toán: {formatDate(mainPayment.paidAt)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    {selectedOrder === order.id ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Ẩn chi tiết
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Order Details */}
              {selectedOrder === order.id && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shipping Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Thông tin giao hàng
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Địa chỉ:</span>
                          <p className="text-gray-600">{order.shippingAddress}</p>
                        </div>
                        <div>
                          <span className="font-medium">Số điện thoại:</span>
                          <p className="text-gray-600">{order.phone}</p>
                        </div>
                        {order.notes && (
                          <div>
                            <span className="font-medium">Ghi chú:</span>
                            <p className="text-gray-600">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        Thông tin thanh toán
                      </h4>
                      {mainPayment ? (
                        <div className="space-y-2 text-sm">
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
                          {mainPayment.paidAt && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Thời gian thanh toán:</span>
                              <span className="text-green-600">
                                {formatDate(mainPayment.paidAt)}
                              </span>
                            </div>
                          )}
                          {mainPayment.method === 'CASH_ON_DELIVERY' && mainPayment.status === 'PENDING' && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs text-yellow-700">
                                💡 Vui lòng chuẩn bị tiền mặt khi nhận hàng
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-3">Chưa có thông tin thanh toán</p>
                          {order.status === 'PENDING' && (
                            <Link
                              to={`/payment/${order.id}`}
                              className="inline-block px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition"
                            >
                              Thanh toán ngay
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      Sản phẩm đã đặt
                    </h4>
                    <div className="bg-white rounded-lg border overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                ) : (
                                  <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded border">
                                    <Package className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                                  <p className="text-sm text-gray-600">
                                    {item.product.category} {item.product.brand && `• ${item.product.brand}`}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatPrice(item.price)} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Order Total */}
                      <div className="bg-gray-50 px-4 py-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Tổng cộng:</span>
                          <span className="font-bold text-xl text-primary-600">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Payments (if any) */}
                  {payments.length > 1 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Lịch sử thanh toán
                      </h4>
                      <div className="space-y-2">
                        {payments.map((payment, index) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
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
    </div>
  );
};

export default Orders;