import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PasswordGate } from '../components/admin/PasswordGate';
import { Layout } from '../components/common/Layout';
import { useTheme } from '../contexts/ThemeContext';

export const Administrator = () => {
  const { isAdmin, setIsAdmin, logout } = useTheme();
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(isAdmin);
  const location = useLocation();
  const navigate = useNavigate();

  // Set global admin state when locally authenticated
  useEffect(() => {
    if (localIsAuthenticated) {
      setIsAdmin(true);
    }
  }, [localIsAuthenticated, setIsAdmin]);

  const handleAuthenticate = () => {
    setLocalIsAuthenticated(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setLocalIsAuthenticated(false);
    logout();
    navigate('/'); // Redirect to home page
  };

  if (!localIsAuthenticated) {
    return <PasswordGate onAuthenticate={handleAuthenticate} accessType="admin" />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-700"
          >
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-dark-600"></div>
              
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Administrator Dashboard
                </h1>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Logout
            </button>
          </motion.div>

          {/* Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AdminDashboard />
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};
