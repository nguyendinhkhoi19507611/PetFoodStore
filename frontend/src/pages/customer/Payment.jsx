// src/pages/customer/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import PaymentMethods from '../../components/payment/PaymentMethods';
import MoMoPayment from '../../components/payment/MoMoPayment';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [currentStep, setCurrentStep] = useState('select'); // select, paying, success
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getOrderDetails(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Không thể tải thông tin đơn hàng');
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError('');
  };

  const handleProceedToPayment = async () => {
    if (!selectedMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentRequest = {
        orderId: parseInt(orderId),
        paymentMethod: selectedMethod,
        returnUrl: `${window.location.origin}/payment/return`,
        extraData: JSON.stringify({
          orderNumber: order.orderNumber,
          customerName: user.fullName || user.username
        })
      };

      const response = await paymentService.createPayment(paymentRequest);
      setPaymentData(response.data);

      if (selectedMethod === 'MOMO') {
        setCurrentStep('paying');
      } else {
        // For COD and Bank Transfer, redirect to success
        setCurrentStep('success');
      }

    } catch (error) {
      console.error('Error creating payment:', error);
      setError(error.response?.data?.message || 'Lỗi khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (data) => {
    setCurrentStep('success');
    // Redirect to orders page after a delay
    setTimeout(() => {
      navigate('/orders');
    }, 3000);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setCurrentStep('select');
  };

  const handlePaymentCancel = () => {
    setCurrentStep('select');
    setPaymentData(null);
    setSelectedMethod('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold">Thanh toán đơn hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            
            {/* Order details */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Địa chỉ giao hàng:</p>
                    <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Số điện thoại:</p>
                    <p className="text-gray-600 text-sm">{order.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="border-t pt-4 mb-6">
              <h3 className="font-medium mb-3">Sản phẩm ({order.orderItems.length})</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-gray-600 text-xs">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-primary-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Content */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {currentStep === 'select' && (
            <PaymentMethods
              selectedMethod={selectedMethod}
              onMethodSelect={handleMethodSelect}
              onProceed={handleProceedToPayment}
              loading={loading}
            />
          )}

          {currentStep === 'paying' && selectedMethod === 'MOMO' && paymentData && (
            <MoMoPayment
              paymentData={paymentData}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          )}

          {currentStep === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedMethod === 'MOMO' ? 'Thanh toán thành công!' : 'Đặt hàng thành công!'}
              </h2>
              <p className="text-gray-600 mb-8">
                {selectedMethod === 'MOMO' 
                  ? 'Đơn hàng của bạn đã được thanh toán và xác nhận.'
                  : selectedMethod === 'CASH_ON_DELIVERY'
                  ? 'Đơn hàng của bạn đã được tạo. Vui lòng chuẩn bị tiền mặt khi nhận hàng.'
                  : 'Đơn hàng của bạn đã được tạo. Vui lòng chuyển khoản theo thông tin đã gửi.'
                }
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
                >
                  Xem đơn hàng của tôi
                </button>
                <br />
                <button
                  onClick={() => navigate('/')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;