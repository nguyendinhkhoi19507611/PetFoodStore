import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }
    addToCart(product);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPetTypeLabel = (petType) => {
    const labels = {
      DOG: 'Chó',
      CAT: 'Mèo',
      BIRD: 'Chim',
      FISH: 'Cá',
      RABBIT: 'Thỏ',
      OTHER: 'Khác'
    };
    return labels[petType] || petType;
  };

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{product.category}</span>
            {product.petType && (
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                {getPetTypeLabel(product.petType)}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            
            <button
              onClick={handleAddToCart}
              className="bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 transition"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
          
          {product.quantity <= 5 && product.quantity > 0 && (
            <p className="text-sm text-orange-600 mt-2">
              Chỉ còn {product.quantity} sản phẩm
            </p>
          )}
          
          {product.quantity === 0 && (
            <p className="text-sm text-red-600 mt-2">Hết hàng</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;