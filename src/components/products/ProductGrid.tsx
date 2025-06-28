
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
      <div className="space-y-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-dark-700 flex flex-col sm:flex-row"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img className="w-full sm:w-32 h-48 sm:h-32 object-cover" src={product.imageUrl} alt={product.name} />
            <div className="p-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{product.name}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{product.description}</p>
              <div className="mt-3">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{product.price}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <motion.div
          key={product.id}
          className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-dark-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img className="w-full h-48 object-cover" src={product.imageUrl} alt={product.name} />
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{product.name}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{product.description}</p>
            <div className="mt-3">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{product.price}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
