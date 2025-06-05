// src/services/paymentService.js
import api from './api';

const paymentService = {
  // Tạo thanh toán
  createPayment: (paymentData) => {
    return api.post('/payments/create', paymentData);
  },

  // Lấy thông tin thanh toán theo đơn hàng
  getPaymentsByOrder: (orderId) => {
    return api.get(`/payments/order/${orderId}`);
  },

  // Lấy chi tiết thanh toán
  getPaymentDetails: (paymentId) => {
    return api.get(`/payments/${paymentId}`);
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: (transactionId) => {
    return api.get(`/payments/status/${transactionId}`);
  },

  // Xử lý callback từ MoMo (dành cho admin)
  processMoMoCallback: (callbackData) => {
    return api.post('/payments/momo/callback', callbackData);
  },

  // Xử lý return từ MoMo
  handlePaymentReturn: (returnData) => {
    return api.get('/payments/return', { params: returnData });
  },

  // Simulate payment completion (for development)
  simulatePaymentComplete: (transactionId) => {
    return api.post(`/payments/test/complete/${transactionId}`);
  },

  // Admin: Lấy tất cả thanh toán
  getAllPayments: (params = {}) => {
    return api.get('/payments/admin/all', { params });
  },

  // Admin: Cập nhật trạng thái thanh toán
  updatePaymentStatus: (paymentId, status) => {
    return api.put(`/payments/${paymentId}/status`, null, { params: { status } });
  },

  // Admin: Hoàn tiền
  refundPayment: (paymentId, refundData = {}) => {
    return api.post(`/payments/${paymentId}/refund`, refundData);
  },

  // Lấy thông tin thanh toán theo transaction ID
  getPaymentByTransaction: (transactionId) => {
    return api.get(`/payments/transaction/${transactionId}`);
  },

  // Hủy thanh toán
  cancelPayment: (paymentId) => {
    return api.put(`/payments/${paymentId}/cancel`);
  },

  // Lấy lịch sử thanh toán của user hiện tại
  getMyPayments: (params = {}) => {
    return api.get('/payments/my-payments', { params });
  }
};

export default paymentService;