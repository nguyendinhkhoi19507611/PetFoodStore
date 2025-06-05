// src/pages/admin/PaymentManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Smartphone
} from 'lucide-react';
import paymentService from '../../services/paymentService';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const paymentStatuses = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ thanh toán', color: 'yellow' },
    { value: 'PROCESSING', label: 'Đang xử lý', color: 'blue' },
    { value: 'COMPLETED', label: 'Thành công', color: 'green' },
    { value: 'FAILED', label: 'Thất bại', color: 'red' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'gray' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'purple' }
  ];

  const paymentMethods = [
    { value: '', label: 'Tất cả phương thức' },
    { value: 'MOMO', label: 'Ví MoMo' },
    { value: 'CASH_ON_DELIVERY', label: 'Thanh toán khi nhận hàng' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' }
  ];

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        size: 50
      };
      
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;

      const response = await paymentService.getAllPayments(params);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Lỗi khi tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    if (window.confirm('Bạn có chắc muốn thay đổi trạng thái thanh toán này?')) {
      try {
        await paymentService.updatePaymentStatus(paymentId, newStatus);
        alert('Cập nhật trạng thái thành công!');
        fetchPayments();
      } catch (error) {
        alert('Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleRefund = async (paymentId) => {
    if (window.confirm('Bạn có chắc muốn hoàn tiền cho giao dịch này?')) {
      try {
        await paymentService.refundPayment(paymentId);
        alert('Hoàn tiền thành công!');
        fetchPayments();
      } catch (error) {
        alert('Lỗi khi hoàn tiền: ' + (error.response?.data?.message || error.message));
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

  const getStatusColor = (status) => {
    const statusObj = paymentStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'FAILED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PROCESSING': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'MOMO': return <Smartphone className="h-4 w-4 text-pink-600" />;
      case 'CASH_ON_DELIVERY': return <Package className="h-4 w-4 text-green-600" />;
      case 'BANK_TRANSFER': return <CreditCard className="h-4 w-4 text-blue-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: filteredPayments.length,
    completed: filteredPayments.filter(p => p.status === 'COMPLETED').length,
    pending: filteredPayments.filter(p => p.status === 'PENDING').length,
    failed: filteredPayments.filter(p => p.status === 'FAILED').length,
    totalAmount: filteredPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Đang tải danh sách thanh toán...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý thanh toán</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            <Download className="h-4 w-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Thành công</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalAmount)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng, giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {paymentStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {paymentMethods.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giao dịch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phương thức
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payment.transactionId.substring(0, 8)}...
                    </div>
                    <div className="text-sm text-gray-500">ID: {payment.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.orderNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {formatPrice(payment.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getMethodIcon(payment.method)}
                    <span className="ml-2 text-sm text-gray-900">
                      {paymentMethods.find(m => m.value === payment.method)?.label || payment.method}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(payment.status) === 'green' ? 'bg-green-100 text-green-800' :
                    getStatusColor(payment.status) === 'red' ? 'bg-red-100 text-red-800' :
                    getStatusColor(payment.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    getStatusColor(payment.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">
                      {paymentStatuses.find(s => s.value === payment.status)?.label || payment.status}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{formatDate(payment.createdAt)}</div>
                  {payment.paidAt && (
                    <div className="text-xs text-green-600">
                      Thanh toán: {formatDate(payment.paidAt)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {payment.status === 'PENDING' && (
                      <select
                        onChange={(e) => handleStatusUpdate(payment.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>Cập nhật</option>
                        <option value="COMPLETED">Thành công</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="CANCELLED">Hủy</option>
                      </select>
                    )}
                    
                    {payment.status === 'COMPLETED' && payment.method === 'MOMO' && (
                      <button
                        onClick={() => handleRefund(payment.id)}
                        className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        Hoàn tiền
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có giao dịch nào</p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                 onClick={() => setShowDetails(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chi tiết giao dịch #{selectedPayment.id}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã giao dịch</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedPayment.transactionId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đơn hàng</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.orderNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tiền</label>
                  <p className="mt-1 text-lg font-bold text-primary-600">
                    {formatPrice(selectedPayment.amount)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phương thức</label>
                  <div className="mt-1 flex items-center">
                    {getMethodIcon(selectedPayment.method)}
                    <span className="ml-2 text-sm text-gray-900">
                      {paymentMethods.find(m => m.value === selectedPayment.method)?.label}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(selectedPayment.status) === 'green' ? 'bg-green-100 text-green-800' :
                    getStatusColor(selectedPayment.status) === 'red' ? 'bg-red-100 text-red-800' :
                    getStatusColor(selectedPayment.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    getStatusColor(selectedPayment.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusIcon(selectedPayment.status)}
                    <span className="ml-1">
                      {paymentStatuses.find(s => s.value === selectedPayment.status)?.label}
                    </span>
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian tạo</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                
                {selectedPayment.paidAt && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Thời gian thanh toán</label>
                    <p className="mt-1 text-sm text-green-600">{formatDate(selectedPayment.paidAt)}</p>
                  </div>
                )}
                
                {selectedPayment.paymentUrl && selectedPayment.method === 'MOMO' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">URL thanh toán MoMo</label>
                    <a 
                      href={selectedPayment.paymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 break-all"
                    >
                      {selectedPayment.paymentUrl}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
                
                {selectedPayment.status === 'COMPLETED' && selectedPayment.method === 'MOMO' && (
                  <button
                    onClick={() => {
                      handleRefund(selectedPayment.id);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Hoàn tiền
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;