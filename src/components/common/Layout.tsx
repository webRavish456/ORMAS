
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MarqueeBanner } from '../MarqueeBanner';
import { ExhibitionSlideshow } from '../ExhibitionSlideshow';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  showMarquee?: boolean;
  showSlideshow?: boolean;
  title?: string;
  subtitle?: string;
  backgroundGradient?: string;
  className?: string;
}

export const Layout = ({ 
  children, 
  showMarquee = false, 
  showSlideshow = false,
  title,
  subtitle,
  backgroundGradient = 'from-orange-50 to-orange-100 dark:from-dark-900 dark:to-dark-800',
  className = ''
}: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b ${backgroundGradient} transition-colors duration-300 overflow-x-hidden`}>
      <Navbar />
      
      <div className="pt-16 w-full">
        {showMarquee && <MarqueeBanner />}
        
        <div className={`w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-8 sm:pb-12 ${className}`}>
          {title && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 sm:mb-8 px-2"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-navy-800 dark:text-white mb-3 sm:mb-4 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-navy-600 dark:text-gray-300 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}
          
          {showSlideshow && <ExhibitionSlideshow />}
          
          <div className="relative z-10 w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
