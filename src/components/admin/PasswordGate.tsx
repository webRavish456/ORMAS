import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, BarChart3, Shield, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PasswordGateProps {
  onAuthenticate: () => void;
  accessType: 'admin' | 'data';
}

export const PasswordGate = ({ onAuthenticate, accessType }: PasswordGateProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Define different passwords for different access levels
      const adminPassword = 'ORMAS@2025';
      const dataPassword = 'ORMASDATA@2025';
      
      const isValidPassword = accessType === 'admin' 
        ? password === adminPassword 
        : password === dataPassword;

      if (isValidPassword) {
        onAuthenticate();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    admin: {
      title: 'Administrator Portal',
      subtitle: 'Secure access to exhibition management',
      icon: Shield,
      iconBg: 'from-blue-500 via-purple-500 to-indigo-600',
      cardBg: 'from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20',
      buttonBg: 'from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700',
      glowColor: 'shadow-blue-500/25 dark:shadow-blue-400/20'
    },
    data: {
      title: 'Data Analytics Portal',
      subtitle: 'Access comprehensive exhibition insights',
      icon: BarChart3,
      iconBg: 'from-indigo-500 via-blue-500 to-cyan-600',
      cardBg: 'from-indigo-50/50 via-blue-50/30 to-cyan-50/50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20',
      buttonBg: 'from-indigo-500 via-blue-500 to-cyan-600 hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-700',
      glowColor: 'shadow-indigo-500/25 dark:shadow-indigo-400/20'
    }
  };

  const currentConfig = config[accessType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded-full border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 hover:scale-105"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>
      
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Main Card */}
          <motion.div
            className={`relative bg-gradient-to-br ${currentConfig.cardBg} backdrop-blur-2xl rounded-3xl shadow-2xl ${currentConfig.glowColor} border border-white/20 dark:border-gray-700/30 overflow-hidden`}
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Card Background Pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-slate-700/40"></div>
            </div>
            
            <div className="relative p-8">
              {/* Header Section */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {/* Icon Container */}
                <motion.div
                  className={`relative w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${currentConfig.iconBg} rounded-2xl shadow-xl ${currentConfig.glowColor} flex items-center justify-center`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <currentConfig.icon className="w-9 h-9 text-white drop-shadow-lg" />
                  
                  {/* Icon Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                </motion.div>
                
                {/* Title and Subtitle */}
                <motion.h1
                  className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {currentConfig.title}
                </motion.h1>
                <motion.p
                  className="text-slate-600 dark:text-slate-300 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {currentConfig.subtitle}
                </motion.p>
              </motion.div>

              {/* Form Section */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Access Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 pr-12 rounded-2xl border-0 bg-white/70 dark:bg-slate-700/70 backdrop-blur-md text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:outline-none transition-all duration-300 shadow-inner font-medium"
                      required
                      placeholder={`Enter ${accessType} password`}
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-3"
                  >
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium text-center">
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-xl transition-all duration-300 ${
                    isLoading 
                      ? 'opacity-50 cursor-not-allowed bg-slate-400' 
                      : `bg-gradient-to-r ${currentConfig.buttonBg} hover:shadow-2xl hover:scale-105 active:scale-95`
                  }`}
                  whileHover={!isLoading ? { y: -2 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      <span>Access Portal</span>
                    </div>
                  )}
                </motion.button>
              </motion.form>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-blue-400/5 to-purple-400/5 rounded-full blur-2xl"></div>
            </div>
          </motion.div>


        </motion.div>
      </div>
    </div>
  );
};