
import { useState } from 'react';
import { ArrowLeft, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PasswordGate } from '../components/admin/PasswordGate';
import { Layout } from '../components/common/Layout';

export const Administrator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-dark-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Administrator Access</h2>
                <p className="text-gray-600 dark:text-gray-300">Secure portal for exhibition management</p>
              </div>
              <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />
            </div>
          </motion.div>
        </div>
      </Layout>
    );
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
              onClick={() => setIsAuthenticated(false)}
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
