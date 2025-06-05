// src/pages/customer/PaymentReturn.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import paymentService from '../../services/paymentService';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('processing'); // processing, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    handlePaymentReturn();
  }, []);

  const handlePaymentReturn = async () => {
    try {
      const returnData = {
        partnerCode: searchParams.get('partnerCode'),
        orderId: searchParams.get('orderId'),
        requestId: searchParams.get('requestId'),
        amount: searchParams.get('amount'),
        orderInfo: searchParams.get('orderInfo'),
        orderType: searchParams.get('orderType'),
        transId: searchParams.get('transId'),
        resultCode: searchParams.get('resultCode'),
        message: searchParams.get('message'),
        localMessage: searchParams.get('localMessage'),
        responseTime: searchParams.get('responseTime'),
        extraData: searchParams.get('extraData'),
        signature: searchParams.get('signature')
      };

      const response = await paymentService.handlePaymentReturn(returnData);
      setPaymentData(response.data);

      if (returnData.resultCode === '0') {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
        setError(returnData.message || 'Thanh toán thất bại');
      }

    } catch (error) {
      console.error('Error handling payment return:', error);
      setPaymentStatus('failed');
      setError('Lỗi khi xử lý kết quả thanh toán');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Status indicator */}
        <div className={`p-6 text-center ${
          paymentStatus === 'success' ? 'bg-green-500' :
          paymentStatus === 'failed' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}>
          {paymentStatus === 'processing' && (
            <>
              <Clock className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Đang xử lý...</h2>
              <p className="mt-2">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {paymentStatus === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Thanh toán thành công!</h2>
              <p className="mt-2">Đơn hàng của bạn đã được xác nhận</p>
            </>
          )}

          {paymentStatus === 'failed' && (
            <>
              <XCircle className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Thanh toán thất bại</h2>
              <p className="mt-2">Đã có lỗi xảy ra trong quá trình thanh toán</p>
            </>
          )}
        </div>

        {/* Payment details */}
        <div className="p-6">
          {paymentData && (
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{paymentData.orderNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium text-lg">{formatPrice(paymentData.amount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium">
                  {paymentData.method === 'MOMO' ? 'Ví MoMo' : 
                   paymentData.method === 'CASH_ON_DELIVERY' ? 'Thanh toán khi nhận hàng' :
                   paymentData.method === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 
                   paymentData.method}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium ${
                  paymentStatus === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {paymentStatus === 'success' ? 'Thành công' : 'Thất bại'}
                </span>
              </div>

              {paymentData.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {new Date(paymentData.paidAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success message */}
          {paymentStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">Đơn hàng đã được xác nhận</p>
                  <p className="text-green-700 text-sm">
                    Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {paymentStatus === 'success' && (
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition font-medium"
              >
                Xem đơn hàng của tôi
              </button>
            )}

            {paymentStatus === 'failed' && paymentData && (
              <button
                onClick={() => navigate(`/payment/${paymentData.orderId}`)}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition font-medium"
              >
                Thử lại thanh toán
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition font-medium"
            >
              Về trang chủ
            </button>
          </div>

          {/* Support contact */}
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              Cần hỗ trợ? Liên hệ{' '}
              <a href="tel:0123456789" className="text-primary-600 font-medium">
                0123 456 789
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;