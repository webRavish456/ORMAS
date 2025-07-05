import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Utensils, MapPin, Clock } from 'lucide-react';
import { Layout } from '../components/common/Layout';
import { getFoods, type Food } from '../services/foodService';
import { useExhibition } from '../contexts/ExhibitionContext';
import { getFoodsByExhibition } from '../services/foodService';

// Image Carousel component
const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl">
      <motion.img
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        src={images[currentIndex]}
        alt="Food item"
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={previousImage}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const Foods = () => {
  const { selectedExhibition } = useExhibition();
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string>('All'); // All, Veg, Non-Veg

  useEffect(() => {
    setLoading(true);
    setError(null);
    getFoodsByExhibition(selectedExhibition)
      .then((data) => {
        setFoods(data);
        setFilteredFoods(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load foods');
        setLoading(false);
      });
  }, [selectedExhibition]);

  const filterFoods = () => {
    let filtered = [...foods];

    if (dietaryFilter !== 'All') {
      filtered = filtered.filter(food => {
        if (dietaryFilter === 'Veg') return food.isVegetarian;
        if (dietaryFilter === 'Non-Veg') return !food.isVegetarian;
        return true;
      });
    }

    setFilteredFoods(filtered);
  };

  useEffect(() => {
    filterFoods();
  }, [foods, dietaryFilter]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
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
              <Utensils className="w-8 h-8 text-red-600 dark:text-red-400" />
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
      title="Food & Cuisine"
      subtitle="Experience the rich flavors of traditional Odia food and local delicacies"
      backgroundGradient="from-orange-50 via-yellow-50 to-red-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"
    >
      {/* Enhanced Header with Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-dark-700"
      >
        {/* Dietary Filter Buttons and Stats */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setDietaryFilter('All')}
              className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 ${
                dietaryFilter === 'All'
                  ? 'bg-gray-500 border-gray-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-700 border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietaryFilter('Veg')}
              className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 ${
                dietaryFilter === 'Veg'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-green-50 dark:bg-green-900/20 border-gray-200 dark:border-dark-700 text-green-700 dark:text-green-300 hover:border-green-300'
              }`}
            >
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border border-green-600"></div>
              <span className="hidden sm:inline">Vegetarian</span>
              <span className="sm:hidden">Veg</span>
            </button>
            <button
              onClick={() => setDietaryFilter('Non-Veg')}
              className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 ${
                dietaryFilter === 'Non-Veg'
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-red-50 dark:bg-red-900/20 border-gray-200 dark:border-dark-700 text-red-700 dark:text-red-300 hover:border-red-300'
              }`}
            >
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border border-red-600"></div>
              <span className="hidden sm:inline">Non-Vegetarian</span>
              <span className="sm:hidden">Non-Veg</span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center sm:justify-end gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Utensils className="w-4 h-4" />
              <span>{filteredFoods.length} items</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Fresh daily</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Foods Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFoods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-dark-700"
          >
            {/* Image Carousel */}
            {food.images && food.images.length > 0 && (
              <div className="relative">
                <ImageCarousel images={food.images} />
                {/* Veg/Non-Veg Indicator */}
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    food.isVegetarian 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      food.isVegetarian ? 'bg-green-700' : 'bg-red-700'
                    }`}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-1">
                  {food.name}
                </h3>
                {/* Veg/Non-Veg Indicator for items without images */}
                {(!food.images || food.images.length === 0) && (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-2 flex-shrink-0 ${
                    food.isVegetarian 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-red-500 border-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      food.isVegetarian ? 'bg-green-700' : 'bg-red-700'
                    }`}></div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-3">
                <span className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {food.price}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base line-clamp-2">
                {food.description}
              </p>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{food.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFoods.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 rounded-full flex items-center justify-center">
            <Utensils className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No food items found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
            Try adjusting your filters or check back later for more options
          </p>
          <button
            onClick={() => {
              setDietaryFilter('All');
            }}
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
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
        className="mt-8 sm:mt-12 bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white rounded-2xl p-6 sm:p-8 text-center"
      >
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
          Taste the Authentic Flavors of Odisha
        </h3>
        <p className="text-base sm:text-lg opacity-90">
          From traditional Pakhala to delicious Rasgulla, experience the culinary heritage
        </p>
      </motion.div>
    </Layout>
  );
};
