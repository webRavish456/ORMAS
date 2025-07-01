import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Package } from 'lucide-react';

interface ProductGridProps {
  products: {
    id: string;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
    stallRange?: string;
  }[];
  viewMode: 'grid' | 'list';
}

export const ProductGrid = ({ products, viewMode }: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="space-y-3 sm:space-y-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-dark-700 cursor-pointer group relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProductClick(product)}
            >
              <img className="w-24 sm:w-32 h-24 sm:h-32 object-cover flex-shrink-0" src={product.imageUrl} alt={product.name} />
              <div className="p-3 sm:p-4 flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">{product.name}</h3>
                
                {/* Mobile: Show stall numbers instead of description */}
                {product.stallRange ? (
                  <div className="mt-1 sm:mt-2 md:hidden">
                    <div className="flex items-start gap-1 text-orange-600 dark:text-orange-400">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="text-xs font-medium break-words whitespace-normal overflow-wrap-anywhere line-clamp-2">
                        Stalls: {product.stallRange}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 md:hidden">{product.description}</p>
                )}
                
                {/* Desktop: Show description */}
                <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 hidden md:block">{product.description}</p>
              </div>
              
              {/* Desktop: Hover overlay with stall info */}
              {product.stallRange && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-orange-600/90 backdrop-blur-sm opacity-0 md:group-hover:opacity-100 transition-all duration-300 items-center justify-center hidden md:flex">
                  <div className="text-center text-white">
                    <MapPin className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm font-medium">Available in Stalls</p>
                    <p className="text-lg font-bold">{product.stallRange}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden overflow-y-auto"
              >
                <div className="relative">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedProduct.name}
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Package className="w-4 h-4" />
                      <span>Category: {selectedProduct.category}</span>
                    </div>
                    
                    {selectedProduct.stallRange && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">Available in Stalls:</span>
                        </div>
                        <div className="bg-white dark:bg-orange-900/30 rounded-md p-3 border border-orange-200 dark:border-orange-700">
                          <p className="text-orange-700 dark:text-orange-300 font-semibold text-sm leading-relaxed break-all whitespace-normal overflow-wrap-anywhere">
                            {selectedProduct.stallRange}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-dark-700 cursor-pointer group relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleProductClick(product)}
          >
            <div className="relative overflow-hidden">
              <img className="w-full h-48 object-cover transition-transform duration-300 md:group-hover:scale-110" src={product.imageUrl} alt={product.name} />
              
              {/* Desktop hover overlay with stall info on image */}
              {product.stallRange && (
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/95 via-orange-500/70 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-2 hidden md:flex">
                  <div className="text-center text-white transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300 px-2 max-w-full">
                    <MapPin className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-xs font-medium">Available in Stalls</p>
                    <p className="text-xs font-bold leading-tight break-words whitespace-normal overflow-wrap-anywhere max-h-16 overflow-hidden">
                      {product.stallRange}
                    </p>
                  </div>
                </div>
              )}
              

              
              {/* Desktop: Small stall indicator (visible when not hovering) */}
              {product.stallRange && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full opacity-70 md:group-hover:opacity-0 transition-opacity duration-300 hidden md:block">
                  <MapPin className="w-3 h-3" />
                </div>
              )}
            </div>
            
            <div className="p-3 sm:p-4">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">{product.name}</h3>
              
              {/* Mobile: Show stall numbers instead of description */}
              {product.stallRange ? (
                <div className="mt-1 sm:mt-2 md:hidden">
                  <div className="flex items-start gap-1 text-orange-600 dark:text-orange-400">
                    <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-medium break-words whitespace-normal overflow-wrap-anywhere line-clamp-2">
                      Stalls: {product.stallRange}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 md:hidden">{product.description}</p>
              )}
              
              {/* Desktop: Show description */}
              <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 hidden md:block">{product.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden overflow-y-auto"
            >
              <div className="relative">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {selectedProduct.name}
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Package className="w-4 h-4" />
                    <span>Category: {selectedProduct.category}</span>
                  </div>
                  
                                      {selectedProduct.stallRange && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">Available in Stalls:</span>
                        </div>
                        <div className="bg-white dark:bg-orange-900/30 rounded-md p-3 border border-orange-200 dark:border-orange-700">
                          <p className="text-orange-700 dark:text-orange-300 font-semibold text-sm leading-relaxed break-all whitespace-normal overflow-wrap-anywhere">
                            {selectedProduct.stallRange}
                          </p>
                        </div>
                      </div>
                    )}
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
