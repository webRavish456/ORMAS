
import { motion } from 'framer-motion';
import { categories } from '../../services/productService';

interface CategoryButtonsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryButtons = ({ 
  selectedCategory, 
  onCategoryChange 
}: CategoryButtonsProps) => {
  const allCategories = ['All', ...categories];

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Horizontal scroll */}
      <div className="block sm:hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {allCategories.map((category) => (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-center transition-all whitespace-nowrap text-sm ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {allCategories.map((category) => (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-center transition-all text-sm sm:text-base ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
