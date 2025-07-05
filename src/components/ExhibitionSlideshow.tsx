
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getExhibitionPhotosByExhibition, type ExhibitionPhoto } from '../services/exhibitionService';
import { useExhibition } from '../contexts/ExhibitionContext';

export const ExhibitionSlideshow = () => {
  const [photos, setPhotos] = useState<ExhibitionPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const { selectedExhibition } = useExhibition();

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!selectedExhibition) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      try {
        const fetchedPhotos = await getExhibitionPhotosByExhibition(selectedExhibition);
        setPhotos(fetchedPhotos);
      } catch (err) {
        console.error('Error fetching exhibition photos:', err);
        setError('Failed to load exhibition photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [selectedExhibition]);

  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [photos.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setTouchStart(null);
  };

  if (loading) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mb-8 flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mb-8 flex items-center justify-center bg-red-50 rounded-xl">
        <p className="text-red-600 text-center px-4">{error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mb-8 flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-600 text-center px-4">No photos available</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mb-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            role="img"
            aria-label={photo.caption || 'Exhibition photo'}
          >
            <img
              src={photo.url}
              alt={photo.caption || 'Exhibition photo'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white text-lg font-medium text-center drop-shadow-lg">
                  {photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3"
            role="tablist"
            aria-label="Slide navigation"
          >
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                } focus:outline-none focus:ring-2 focus:ring-white/50`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 
