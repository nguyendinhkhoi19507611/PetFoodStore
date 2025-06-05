// src/components/payment/PaymentMethods.jsx
import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  QrCode,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle 
} from 'lucide-react';

const PaymentMethods = ({ selectedMethod, onMethodSelect, onProceed, loading }) => {
  const paymentMethods = [
    {
      id: 'MOMO',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: Smartphone,
      color: 'bg-pink-500',
      features: ['Thanh toán ngay lập tức', 'Bảo mật cao', 'Có thể quét QR'],
      popular: true
    },
    {
      id: 'CASH_ON_DELIVERY',
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: Banknote,
      color: 'bg-green-500',
      features: ['Không cần thanh toán trước', 'Kiểm tra hàng trước khi trả tiền', 'An toàn'],
      popular: false
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua tài khoản ngân hàng',
      icon: CreditCard,
      color: 'bg-blue-500',
      features: ['Chuyển khoản trực tiếp', 'Phí thấp', 'Xác nhận nhanh'],
      popular: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn phương thức thanh toán</h2>
        <p className="text-gray-600">Chọn phương thức thanh toán phù hợp với bạn</p>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <div
              key={method.id}
              className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onMethodSelect(method.id)}
            >
              {/* Popular badge */}
              {method.popular && (
                <div className="absolute -top-2 left-4">
                  <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Phổ biến
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${method.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {method.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {method.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-1">
                      {method.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                <div className={`p-2 rounded-full transition-colors ${
                  isSelected ? 'bg-primary-500' : 'bg-gray-200'
                }`}>
                  <ChevronRight className={`h-5 w-5 ${
                    isSelected ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
              </div>

              {/* Additional info for MoMo */}
              {method.id === 'MOMO' && isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <QrCode className="h-5 w-5 text-pink-600 mr-2" />
                      <span className="font-medium text-pink-900">Thanh toán MoMo</span>
                    </div>
                    <p className="text-sm text-pink-700">
                      Bạn sẽ được chuyển đến ứng dụng MoMo hoặc có thể quét mã QR để thanh toán
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security notice */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="font-medium text-gray-900">Bảo mật thanh toán</span>
        </div>
        <p className="text-sm text-gray-600">
          Tất cả giao dịch được mã hóa SSL 256-bit và tuân thủ các tiêu chuẩn bảo mật quốc tế
        </p>
      </div>

      {/* Proceed button */}
      {selectedMethod && (
        <div className="pt-6">
          <button
            onClick={onProceed}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                Tiếp tục thanh toán
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;