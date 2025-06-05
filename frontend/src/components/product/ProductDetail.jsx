import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Plus, Minus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productService.getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Không thể tải thông tin sản phẩm');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (quantity > product.quantity) {
      alert('Số lượng vượt quá số sản phẩm có sẵn');
      return;
    }

    addToCart(product, quantity);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Quay lại
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              {product.category && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md">
                  {product.category}
                </span>
              )}
              {product.petType && (
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-md">
                  {getPetTypeLabel(product.petType)}
                </span>
              )}
            </div>

            {product.brand && (
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Thương hiệu:</span> {product.brand}
              </p>
            )}

            <div className="mb-6">
              <p className="text-3xl font-bold text-primary-600 mb-2">
                {formatPrice(product.price)}
              </p>
              
              {product.quantity > 0 ? (
                <p className="text-green-600">
                  Còn {product.quantity} sản phẩm
                </p>
              ) : (
                <p className="text-red-600">Hết hàng</p>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Quantity selector and Add to cart */}
            {product.quantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Số lượng:</span>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 hover:bg-gray-100"
                      disabled={quantity >= product.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Thêm vào giỏ hàng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;