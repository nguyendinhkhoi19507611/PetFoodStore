import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ProductList from '../../components/product/ProductList';
import productService from '../../services/productService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPetType, setSelectedPetType] = useState('');

  const categories = ['Thức ăn khô', 'Thức ăn ướt', 'Snack & Bánh thưởng', 'Dinh dưỡng', 'Phụ kiện'];
  const petTypes = ['DOG', 'CAT', 'BIRD', 'FISH', 'RABBIT', 'OTHER'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await productService.searchProducts(searchTerm);
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    setSelectedPetType('');
    
    if (!category) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await productService.getProductsByCategory(category);
      setProducts(response.data);
    } catch (error) {
      console.error('Error filtering by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePetTypeFilter = async (petType) => {
    setSelectedPetType(petType);
    setSelectedCategory('');
    
    if (!petType) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await productService.getProductsByPetType(petType);
      setProducts(response.data);
    } catch (error) {
      console.error('Error filtering by pet type:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 rounded-lg mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Chào mừng đến với Pet Food Store</h1>
          <p className="text-xl mb-8">Thực phẩm chất lượng cao cho thú cưng của bạn</p>
          
          {/* Search bar */}
          <div className="max-w-2xl mx-auto flex">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-800 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-white text-primary-600 px-6 py-3 rounded-r-lg hover:bg-gray-100 transition"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-8">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-semibold">Lọc sản phẩm</h2>
        </div>
        
        <div className="space-y-4">
          {/* Category filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Danh mục:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-4 py-2 rounded-md transition ${
                  !selectedCategory
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-md transition ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Pet type filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Loại thú cưng:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePetTypeFilter('')}
                className={`px-4 py-2 rounded-md transition ${
                  !selectedPetType
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
              </button>
              {petTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handlePetTypeFilter(type)}
                  className={`px-4 py-2 rounded-md transition ${
                    selectedPetType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type === 'DOG' ? 'Chó' :
                   type === 'CAT' ? 'Mèo' :
                   type === 'BIRD' ? 'Chim' :
                   type === 'FISH' ? 'Cá' :
                   type === 'RABBIT' ? 'Thỏ' : 'Khác'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <ProductList products={products} loading={loading} title="Sản phẩm" />
    </div>
  );
};

export default Home;
              