// src/components/payment/MoMoPayment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  QrCode, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Copy,
  RefreshCw,
  ArrowLeft,
  Smartphone,
  Timer,
  ExternalLink,
  Info,
  Shield,
  Zap,
  Laptop
} from 'lucide-react';
import paymentService from '../../services/paymentService';

const MoMoPayment = ({ paymentData, onSuccess, onError, onCancel }) => {
  // State management
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [checkCount, setCheckCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if the user is on a mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Timer for countdown
  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('failed');
          setErrorMessage('Phiên thanh toán đã hết hạn');
          onError('Phiên thanh toán đã hết hạn');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus, onError]);

  // Auto check payment status
  useEffect(() => {
    if (!autoCheckEnabled || paymentStatus !== 'pending' || !paymentData.transactionId) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastCheckTime >= 5000) { // 5 seconds between checks
        handleCheckStatus(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoCheckEnabled, paymentStatus, paymentData.transactionId, lastCheckTime]);

  // Check payment status function
  const handleCheckStatus = useCallback(async (isAutoCheck = false) => {
    if (checkingPayment && !isAutoCheck) return;
    if (paymentStatus !== 'pending') return;
    if (!paymentData.transactionId) return;
    
    if (!isAutoCheck) {
      setCheckingPayment(true);
    }
    
    try {
      console.log('Checking payment status for transaction:', paymentData.transactionId);
      const response = await paymentService.checkPaymentStatus(paymentData.transactionId);
      const payment = response.data;
      
      setLastCheckTime(Date.now());
      setCheckCount(prev => prev + 1);
      
      console.log('Payment status check result:', payment);
      
      if (payment.status === 'COMPLETED') {
        setPaymentStatus('success');
        setAutoCheckEnabled(false);
        onSuccess({
          ...paymentData,
          ...payment,
          paidAt: payment.paidAt || new Date().toISOString()
        });
      } else if (payment.status === 'FAILED' || payment.status === 'CANCELLED') {
        setPaymentStatus('failed');
        setAutoCheckEnabled(false);
        setErrorMessage('Thanh toán thất bại');
        onError('Thanh toán thất bại');
      } else if (payment.status === 'PROCESSING') {
        setPaymentStatus('processing');
      }
      // If still PENDING, keep current state
      
      setRetryAttempts(0); // Reset retry count on successful check
      
    } catch (error) {
      console.error('Error checking payment status:', error);
      setRetryAttempts(prev => prev + 1);
      
      if (!isAutoCheck) {
        // Only show error for manual checks
        setErrorMessage('Lỗi khi kiểm tra trạng thái thanh toán');
        
        // If too many failed attempts, disable auto-check
        if (retryAttempts >= 3) {
          setAutoCheckEnabled(false);
          setPaymentStatus('failed');
          onError('Không thể kiểm tra trạng thái thanh toán');
        }
      }
    } finally {
      if (!isAutoCheck) {
        setCheckingPayment(false);
      }
    }
  }, [checkingPayment, paymentStatus, paymentData.transactionId, retryAttempts, onSuccess, onError]);

  // Simulate payment success (development only)
  const handleSimulateSuccess = async () => {
    if (!paymentData.transactionId) return;
    
    try {
      setCheckingPayment(true);
      console.log('Simulating payment completion for:', paymentData.transactionId);
      const response = await paymentService.simulatePaymentComplete(paymentData.transactionId);
      
      if (response.data.message.includes('successfully')) {
        setPaymentStatus('success');
        setAutoCheckEnabled(false);
        onSuccess({
          ...paymentData,
          status: 'COMPLETED',
          paidAt: new Date().toISOString()
        });
      } else {
        setErrorMessage('Lỗi khi simulate thanh toán');
      }
    } catch (error) {
      console.error('Error simulating payment:', error);
      setErrorMessage('Lỗi khi simulate thanh toán: ' + (error.response?.data?.message || error.message));
    } finally {
      setCheckingPayment(false);
    }
  };

  // Copy QR code URL or payment URL based on device
  const handleCopyQR = () => {
    let textToCopy = '';
    
    if (isMobile) {
      // Trên điện thoại: ưu tiên deeplink hoặc paymentUrl
      textToCopy = paymentData.deeplink || paymentData.qrCodeUrl|| paymentData.paymentUrl  || '';
    } else {
      // Trên PC: ưu tiên qrCodeUrl hoặc paymentUrl
      textToCopy = paymentData.paymentUrl || paymentData.qrCodeUrl || '';
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Open MoMo app (if deeplink available)
  const handleOpenMoMo = () => {
    // Ưu tiên sử dụng deeplink cho điện thoại
    if (isMobile && paymentData.deeplink) {
      window.location.href = paymentData.deeplink;
    } else if (isMobile && paymentData.deeplink) {
      window.open(paymentData.deeplink, '_blank');
    } else if (paymentData.paymentUrl) {
      window.open(paymentData.paymentUrl, '_blank');
    }
  };

  // Reset payment to try again
  const handleRetry = () => {
    setPaymentStatus('pending');
    setTimeLeft(900);
    setErrorMessage('');
    setRetryAttempts(0);
    setCheckCount(0);
    setAutoCheckEnabled(true);
    setLastCheckTime(Date.now());
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (timeLeft > 300) return 'text-green-600'; // > 5 phút
    if (timeLeft > 120) return 'text-yellow-600'; // > 2 phút
    return 'text-red-600 animate-pulse'; // <= 2 phút
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Debug info
  console.log('MoMoPayment render:', {
    paymentData,
    paymentStatus,
    timeLeft,
    autoCheckEnabled,
    checkCount
  });

  return (
    <div className="max-w-lg mx-auto">
      {/* Header with Timer */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-t-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <Smartphone className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Thanh toán MoMo</h2>
              <p className="text-pink-100 text-sm">Quét mã QR để thanh toán</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${getTimeColor()}`}>
              <Timer className="h-5 w-5 inline mr-1" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-pink-100">Thời gian còn lại</div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="text-center py-4 border-t border-pink-400">
          <div className="text-3xl font-bold mb-1">
            {formatAmount(paymentData.amount)}
          </div>
          <div className="text-pink-100 text-sm">Số tiền cần thanh toán</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
        
        {/* PENDING STATE */}
        {paymentStatus === 'pending' && (
          <div className="p-8">
            {/* QR Code Display */}
            <div className="text-center mb-6">
              <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border-2 border-pink-100 qr-pulse">
                {/* PC View: Hiển thị mã QR để quét */}
                {!isMobile && (paymentData.qrCodeUrl || paymentData.paymentUrl) ? (
                  <div className="relative">
                    <div className="flex flex-col items-center mb-2">
                      <Smartphone className="h-5 w-5 text-pink-500 mb-1" />
                      <p className="text-sm text-pink-600 font-medium">Quét mã bằng điện thoại</p>
                    </div>
                    <img
                      src={paymentData.qrCodeUrl || paymentData.paymentUrl}
                      alt="MoMo QR Code"
                      className="w-64 h-64 mx-auto rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback QR placeholder */}
                    <div 
                      className="w-64 h-64 mx-auto border-2 border-dashed border-pink-300 rounded-lg flex-col items-center justify-center bg-pink-50 hidden"
                    >
                      <QrCode className="h-24 w-24 text-pink-400 mb-2" />
                      <p className="text-pink-600 text-sm font-medium">Mã QR MoMo</p>
                      <p className="text-pink-500 text-xs">Đang tải...</p>
                    </div>
                  </div>
                ) : /* Mobile View: Hiển thị nút mở app */ isMobile && (paymentData.deeplink || paymentData.paymentUrl) ? (
                  <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center">
                    <Smartphone className="h-16 w-16 text-pink-500 mb-3" />
                    <p className="text-pink-600 font-medium mb-4">Thanh toán trên điện thoại</p>
                    <button
                      onClick={handleOpenMoMo}
                      className="bg-pink-500 text-white py-3 px-6 rounded-lg hover:bg-pink-600 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Zap className="h-5 w-5" />
                      Mở ứng dụng MoMo
                    </button>
                  </div>
                ) : (
                  <div className="w-64 h-64 mx-auto border-2 border-dashed border-pink-300 rounded-lg flex flex-col items-center justify-center bg-pink-50">
                    <QrCode className="h-24 w-24 text-pink-400 mb-2" />
                    <p className="text-pink-600 text-sm font-medium">Mã QR MoMo</p>
                    <p className="text-pink-500 text-xs">Đang tải...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Hướng dẫn thanh toán
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-3">
                  <span className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Mở ứng dụng MoMo trên điện thoại</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Chọn "Quét QR" và quét mã QR trên màn hình</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="w-7 h-7 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Xác nhận thông tin và hoàn tất thanh toán</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {/* Open MoMo App Button - chỉ hiện trên PC hoặc khi không hiện ở trên */}
              {(!isMobile || !(paymentData.deeplink || paymentData.paymentUrl)) && (paymentData.deeplink || paymentData.paymentUrl) && (
                <button
                  onClick={handleOpenMoMo}
                  className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-5 w-5" />
                  Mở ứng dụng MoMo
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}

              {/* Copy Link Button - hiển thị khác nhau trên PC/Mobile */}
              <button
                onClick={handleCopyQR}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? '✓ Đã sao chép!' : isMobile ? 'Sao chép link thanh toán' : 'Sao chép mã QR'}
              </button>

              {/* Device Indicator */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 flex items-center justify-center gap-2 text-blue-600 text-sm">
                {isMobile ? (
                  <>
                    <Smartphone className="h-4 w-4" />
                    <span>Phát hiện điện thoại</span>
                  </>
                ) : (
                  <>
                    <Laptop className="h-4 w-4" />
                    <span>Phát hiện máy tính</span>
                  </>
                )}
              </div>

              {/* Manual Check Status Button */}
              <button
                onClick={() => handleCheckStatus(false)}
                disabled={checkingPayment}
                className="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-200 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${checkingPayment ? 'animate-spin' : ''}`} />
                {checkingPayment ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
              </button>
            </div>

            {/* Development Test Button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-center mb-6">
                <button
                  onClick={handleSimulateSuccess}
                  disabled={checkingPayment}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  [DEV] Giả lập thành công
                </button>
              </div>
            )}

            {/* Auto Check Status Info */}
            {autoCheckEnabled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Tự động kiểm tra trạng thái thanh toán</span>
                  <span className="text-green-600">({checkCount} lần kiểm tra)</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Lần kiểm tra tiếp theo: {Math.max(0, 5 - Math.floor((Date.now() - lastCheckTime) / 1000))}s
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm mb-1">An toàn & Bảo mật</h4>
                  <p className="text-blue-700 text-xs">
                    Giao dịch được mã hóa SSL 256-bit và bảo vệ bởi MoMo. 
                    Chúng tôi không lưu trữ thông tin thanh toán của bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Mã giao dịch:</span>
                  <p className="text-gray-600 font-mono text-xs">
                    {paymentData.transactionId?.substring(0, 8)}...
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Đơn hàng:</span>
                  <p className="text-gray-600 text-xs">
                    {paymentData.orderNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="text-center">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mx-auto text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại chọn phương thức khác
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING STATE */}
        {paymentStatus === 'processing' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Đang xử lý thanh toán
            </h3>
            <p className="text-gray-600 mb-6">
              Chúng tôi đang xác nhận giao dịch của bạn. Vui lòng không tắt trang này.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Đang xử lý...</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Quá trình này thường mất vài giây
              </p>
            </div>

            {/* Processing info */}
            <div className="text-left bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Thông tin giao dịch</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-semibold">{formatAmount(paymentData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span>Ví MoMo</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="text-blue-600">Đang xử lý</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {paymentStatus === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 success-icon" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Thanh toán thành công! 🎉
            </h3>
            <p className="text-gray-600 mb-6">
              Đơn hàng của bạn đã được thanh toán và xác nhận thành công.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Giao dịch hoàn tất</span>
              </div>
              <p className="text-green-600 text-sm">
                Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất
              </p>
            </div>
            
            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-3 text-center">Chi tiết giao dịch</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Mã giao dịch:</span>
                  <span className="font-mono">{paymentData.transactionId?.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian:</span>
                  <span>{new Date().toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span>Ví MoMo</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Số tiền:</span>
                  <span className="font-bold text-green-600">
                    {formatAmount(paymentData.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {paymentStatus === 'failed' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h3>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
            </p>
            
            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Giao dịch không thành công</span>
              </div>
              <p className="text-red-600 text-sm">
                {timeLeft <= 0 
                  ? 'Phiên thanh toán đã hết hạn (15 phút)' 
                  : 'Vui lòng thử lại hoặc chọn phương thức thanh toán khác'}
              </p>
              {retryAttempts > 0 && (
                <p className="text-red-500 text-xs mt-2">
                  Đã thử {retryAttempts} lần kiểm tra
                </p>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="space-y-3">
              {timeLeft > 0 && (
                <button
                  onClick={handleRetry}
                  className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Thử lại thanh toán
                </button>
              )}
              <button
                onClick={onCancel}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Chọn phương thức khác
              </button>
            </div>

            {/* Help info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2 text-blue-700 text-sm">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Cần hỗ trợ?</p>
                  <p className="text-blue-600 text-xs mt-1">
                    Liên hệ hotline: 1900-1234 hoặc email: support@petfoodstore.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoMoPayment;