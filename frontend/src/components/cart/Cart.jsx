// src/components/cart/Cart.jsx (Updated version)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import CartItem from './CartItem';
import orderService from '../../services/orderService';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderForm, setOrderForm] = useState({
    shippingAddress: user?.address || '',
    phone: user?.phone || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleInputChange = (e) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateOrder = async () => {
    if (!orderForm.shippingAddress || !orderForm.phone) {
      alert('Vui lòng điền đầy đủ địa chỉ giao hàng và số điện thoại');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shippingAddress: orderForm.shippingAddress,
        phone: orderForm.phone,
        notes: orderForm.notes,
        paymentMethod: 'MOMO', // Default payment method
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      const response = await orderService.createOrder(orderData);
      clearCart();
      
      // Chuyển đến trang thanh toán
      navigate(`/payment/${response.data.id}`);
      
    } catch (error) {
      alert(error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckout = async (paymentMethod) => {
    if (!orderForm.shippingAddress || !orderForm.phone) {
      alert('Vui lòng điền đầy đủ địa chỉ giao hàng và số điện thoại');
      return;
    }

    setLoading(true);
    try {
      // Tạo đơn hàng với phương thức thanh toán đã chọn
      const orderData = {
        shippingAddress: orderForm.shippingAddress,
        phone: orderForm.phone,
        notes: orderForm.notes,
        paymentMethod: paymentMethod,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      const orderResponse = await orderService.createOrder(orderData);
      clearCart();
      
      // Chuyển đến trang thanh toán với phương thức đã chọn
      navigate(`/payment/${orderResponse.data.id}?method=${paymentMethod}`);
      
    } catch (error) {
      alert(error.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
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

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-8">Hãy thêm một số sản phẩm vào giỏ hàng của bạn!</p>
        <Link
          to="/"
          className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  name="shippingAddress"
                  value={orderForm.shippingAddress}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={orderForm.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="border-t pt-4 mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-primary-600">{formatPrice(getCartTotal())}</span>
              </div>
            </div>

            {/* Payment Options */}
            {!showPaymentOptions ? (
              <div className="space-y-3">
                <button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Tiến hành thanh toán
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowPaymentOptions(true)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition"
                >
                  Thanh toán nhanh
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">Chọn phương thức thanh toán:</h3>
                
                {/* MoMo Payment */}
                <button
                  onClick={() => handleQuickCheckout('MOMO')}
                  disabled={loading}
                  className="w-full p-3 border border-pink-200 rounded-md hover:bg-pink-50 transition flex items-center disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">M</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Ví MoMo</div>
                    <div className="text-sm text-gray-600">Thanh toán ngay lập tức</div>
                  </div>
                </button>

                {/* Cash on Delivery */}
                <button
                  onClick={() => handleQuickCheckout('CASH_ON_DELIVERY')}
                  disabled={loading}
                  className="w-full p-3 border border-green-200 rounded-md hover:bg-green-50 transition flex items-center disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng</div>
                    <div className="text-sm text-gray-600">Trả tiền mặt khi nhận hàng</div>
                  </div>
                </button>

                {/* Bank Transfer */}
                <button
                  onClick={() => handleQuickCheckout('BANK_TRANSFER')}
                  disabled={loading}
                  className="w-full p-3 border border-blue-200 rounded-md hover:bg-blue-50 transition flex items-center disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-gray-600">Chuyển khoản qua ngân hàng</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowPaymentOptions(false)}
                  className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition"
                >
                  ← Quay lại
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;