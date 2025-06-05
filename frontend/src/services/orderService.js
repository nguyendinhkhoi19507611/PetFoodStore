import api from './api';

const orderService = {
  // Customer endpoints
  createOrder: (orderData) => {
    return api.post('/orders', orderData);
  },

  getMyOrders: () => {
    return api.get('/orders/my-orders');
  },

  getOrderDetails: (id) => {
    return api.get(`/orders/${id}`);
  },

  // Admin/Employee endpoints
  getAllOrders: () => {
    return api.get('/orders/all');
  },

  updateOrderStatus: (id, status) => {
    return api.put(`/orders/${id}/status`, null, { params: { status } });
  },

  getOrdersByStatus: (status) => {
    return api.get(`/orders/status/${status}`);
  },
};

export default orderService;