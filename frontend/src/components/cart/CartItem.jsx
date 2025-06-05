import React from 'react';
import { Plus, Minus, Trash2, Package } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      onRemove(item.id);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-md"
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.category}</p>
        <p className="text-primary-600 font-medium mt-1">{formatPrice(item.price)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          className="p-1 rounded-md hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="px-3 py-1 min-w-[50px] text-center font-medium">
          {item.quantity}
        </span>
        
        <button
          onClick={handleIncrement}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[100px]">
        <p className="text-sm text-gray-500">Tổng</p>
        <p className="font-semibold text-gray-800">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition"
        title="Xóa khỏi giỏ hàng"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CartItem;