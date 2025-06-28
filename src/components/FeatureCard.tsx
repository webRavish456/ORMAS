
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  index: number;
  color?: string;
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  to, 
  index,
  color = 'from-orange-500 to-orange-600'
}: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group h-full"
  >
    <Link to={to} className="block h-full">
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 h-full border border-gray-100 dark:border-dark-700 group-hover:border-primary-200 dark:group-hover:border-primary-700">
        {/* Gradient overlay effect */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
        
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-50/30 dark:to-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-4 right-4 w-2 h-2 bg-primary-400 rounded-full opacity-0 group-hover:opacity-30"
          />
          <motion.div
            animate={{
              y: [-10, -30, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-8 right-8 w-1 h-1 bg-primary-300 rounded-full opacity-0 group-hover:opacity-40"
          />
        </div>
        
        {/* Icon with enhanced styling */}
        <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${color} text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <Icon className="w-8 h-8" />
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-navy-800 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-navy-600 dark:text-gray-300 mb-6 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
            {description}
          </p>
          
          {/* Enhanced CTA */}
          <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
            <span className="relative">
              Explore Now
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Icon className="w-full h-full text-primary-600 dark:text-primary-400" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-10 blur-xl`}></div>
        </div>
      </div>
    </Link>
  </motion.div>
);
