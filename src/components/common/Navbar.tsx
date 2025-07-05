import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Home, Package, Calendar, Utensils, MessageSquare, Users, BarChart3, Map } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useExhibition } from '../../contexts/ExhibitionContext';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

interface Exhibition {
  id: string;
  name: string;
}

const allNavItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/foods', label: 'Foods', icon: Utensils },
  { path: '/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/administrator', label: 'Admin', icon: Users, requiresAdmin: true },
  { path: '/data', label: 'Data', icon: BarChart3, requiresDataAccess: true },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme, isAdmin, isDataUser, userRole } = useTheme();
  const { selectedExhibition, setSelectedExhibition } = useExhibition();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => {
    if (item.requiresAdmin) {
      return isAdmin;
    }
    if (item.requiresDataAccess) {
      return isAdmin || isDataUser;
    }
    return true;
  });

  // Only show exhibition selector if not on /administrator or /data
  const showExhibitionSelector = location.pathname !== '/administrator' && location.pathname !== '/data';

  const fetchExhibitions = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'exhibitions'));
      const exhibitionData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Exhibition));
      
    
      
      setExhibitions(exhibitionData);
      
      // If no exhibition is selected and we have exhibitions, select the first one
      if (!selectedExhibition && exhibitionData.length > 0) {
        setSelectedExhibition(exhibitionData[0].name.toLowerCase().replace(/\s+/g, '-'));
      }
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      setExhibitions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedExhibition, setSelectedExhibition]);

  useEffect(() => {
    fetchExhibitions();
  }, [fetchExhibitions]);

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
          </div>

          {/* Exhibition Selector & Theme Toggle */}
          <div className="flex items-center space-x-2">
            {/* Exhibition Selector */}
            {showExhibitionSelector && (
                              <div className="hidden md:flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Exhibition:</label>
                  {loading ? (
                    <select className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" disabled>
                      <option>Loading...</option>
                    </select>
                  ) : exhibitions.length === 0 ? (
                    <select className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" disabled>
                      <option>No exhibitions</option>
                    </select>
                  ) : (
                    <select
                      value={selectedExhibition}
                      onChange={(e) => setSelectedExhibition(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {exhibitions.map(exh => (
                        <option key={exh.id} value={exh.name.toLowerCase().replace(/\s+/g, '-')}>{exh.name}</option>
                      ))}
                    </select>
                  )}
                </div>
            )}

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
              {/* Mobile Exhibition Selector */}
              {showExhibitionSelector && (
                                  <div className="flex items-center space-x-2 px-3 py-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Exhibition:</label>
                    {loading ? (
                      <select className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" disabled>
                        <option>Loading...</option>
                      </select>
                    ) : exhibitions.length === 0 ? (
                      <select className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" disabled>
                        <option>No exhibitions</option>
                      </select>
                    ) : (
                      <select
                        value={selectedExhibition}
                        onChange={(e) => setSelectedExhibition(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {exhibitions.map(exh => (
                          <option key={exh.id} value={exh.name.toLowerCase().replace(/\s+/g, '-')}>{exh.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
              )}

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
