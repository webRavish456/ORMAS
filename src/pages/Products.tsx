
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Grid, List, Search, ShoppingCart } from 'lucide-react';
import { Layout } from '../components/common/Layout';
import { CategoryButtons } from '../components/products/CategoryButtons';
import { ProductGrid } from '../components/products/ProductGrid';
import { getProducts, type Product } from '../services/productService';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              {error}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please try again later
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Product Showcase"
      subtitle="Discover authentic handloom, handicrafts, and traditional products from Odisha"
      backgroundGradient="from-blue-50 via-purple-50 to-pink-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"
    >
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-dark-700"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Toggle and Product Count Row */}
          <div className="flex items-center justify-between">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-dark-600 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-dark-600 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

            {/* Product Count */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <Package className="w-4 h-4" />
              <span>{filteredProducts.length} products</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <CategoryButtons
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Products Grid */}
      <ProductGrid
        products={filteredProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: 'Traditional product from Odisha',
          price: '₹299',
          imageUrl: product.images?.[0] || '/api/placeholder/300/300',
          category: product.category
        }))}
        viewMode={viewMode}
      />

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 rounded-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchTerm('');
            }}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Special Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-2xl p-8 text-center"
      >
        <h3 className="text-2xl font-bold mb-4">
          Authentic Products from Odisha
        </h3>
        <p className="text-lg opacity-90">
          Each product tells a story of tradition, craftsmanship, and cultural heritage
        </p>
      </motion.div>
    </Layout>
  );
};
