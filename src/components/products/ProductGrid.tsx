
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: {
    id: string;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
  }[];
  viewMode: 'grid' | 'list';
}

export const ProductGrid = ({ products, viewMode }: ProductGridProps) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3 sm:space-y-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-dark-700 flex flex-row"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img className="w-24 sm:w-32 h-24 sm:h-32 object-cover flex-shrink-0" src={product.imageUrl} alt={product.name} />
            <div className="p-3 sm:p-4 flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">{product.name}</h3>
              <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2">{product.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
        <motion.div
          key={product.id}
          className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-dark-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img className="w-full h-48 object-cover" src={product.imageUrl} alt={product.name} />
          <div className="p-3 sm:p-4">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">{product.name}</h3>
            <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-2">{product.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
