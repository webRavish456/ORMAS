import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Home, Package, Calendar, Utensils, MessageSquare, Users, BarChart3, Map } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const allNavItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/foods', label: 'Foods', icon: Utensils },
  { path: '/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/administrator', label: 'Admin', icon: Users, adminOnly: true },
  { path: '/data', label: 'Data', icon: BarChart3, adminOnly: true },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isDark, toggleTheme, isAdmin, setIsAdmin } = useTheme();

  // Filter navigation items based on admin status
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  // Reset admin state when navigating away from admin pages
  useEffect(() => {
    if (location.pathname !== '/administrator' && location.pathname !== '/data') {
      setIsAdmin(false);
    }
  }, [location.pathname, setIsAdmin]);

  // Close the map dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mapRef.current && !mapRef.current.contains(event.target as Node)) {
        setIsMapOpen(false);
      }
    }
    if (isMapOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMapOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              ORMAS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            {/* Exhibition Map Dropdown */}
            <div className="relative" ref={mapRef}>
              <button
                onClick={() => setIsMapOpen((prev) => !prev)}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isMapOpen
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Exhibition Map</span>
                {isMapOpen && (
                  <motion.div
                    layoutId="activeMapTab"
                    className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              {isMapOpen && (
                <div className="absolute right-0 mt-2 w-max bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg z-50 p-4 max-w-xs sm:max-w-sm md:max-w-none">
                  {/* Header boxes */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg text-center">
                      <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Participant stalls</span>
                    </div>
                    <div className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg text-center">
                      <span className="text-orange-700 dark:text-orange-300 text-sm font-medium">Utility stalls</span>
                    </div>
                  </div>
                  
                  {/* 5x5 Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 25 }, (_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-green-500 rounded text-green-600 text-xs sm:text-sm font-semibold bg-white dark:bg-dark-800 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Exhibition Map */}
              <div className="relative">
                <button
                  onClick={() => setIsMapOpen((prev) => !prev)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    isMapOpen
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800'
                  }`}
                >
                  <Map className="w-5 h-5" />
                  <span>Exhibition Map</span>
                </button>
                
                {isMapOpen && (
                  <div className="mt-2 bg-gray-50 dark:bg-dark-800 rounded-lg p-4 mx-3">
                    {/* Header boxes */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded text-center">
                        <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">Participant stalls</span>
                      </div>
                      <div className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded text-center">
                        <span className="text-orange-700 dark:text-orange-300 text-xs font-medium">Utility stalls</span>
                      </div>
                    </div>
                    
                    {/* 5x5 Grid */}
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }, (_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 flex items-center justify-center border border-green-500 rounded text-green-600 text-xs font-semibold bg-white dark:bg-dark-700 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
