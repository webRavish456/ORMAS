import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Tabs } from '../components/common/Tabs';
import { DailySales } from '../components/data/DailySales';
import { ExhibitionConfig } from '../components/data/ExhibitionConfig';
import { ParticipantRegistration } from '../components/data/ParticipantRegistration';
import { RegistrationViewer } from '../components/data/RegistrationViewer';
import { PasswordGate } from '../components/admin/PasswordGate';
import { useTheme } from '../contexts/ThemeContext';
import { TrendingUp, Settings, UserPlus, Users } from 'lucide-react';

export const Data = () => {
  const { isAdmin, isDataUser, setIsDataUser, logout } = useTheme();
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(isAdmin || isDataUser);
  const [activeTab, setActiveTab] = useState('sales');
  const navigate = useNavigate();

  // Set data user state when locally authenticated (if not already admin)
  useEffect(() => {
    if (localIsAuthenticated && !isAdmin) {
      setIsDataUser(true);
    }
  }, [localIsAuthenticated, setIsDataUser, isAdmin]);

  const handleAuthenticate = () => {
    setLocalIsAuthenticated(true);
    if (!isAdmin) {
      setIsDataUser(true);
    }
  };

  const handleLogout = () => {
    setLocalIsAuthenticated(false);
    logout();
    navigate('/'); // Redirect to home page
  };

  const tabs = [
    {
      id: 'sales',
      label: 'Daily Sales',
      icon: TrendingUp,
      component: DailySales,
    },
    {
      id: 'config',
      label: 'Exhibition Config',
      icon: Settings,
      component: ExhibitionConfig,
    },
    {
      id: 'registration',
      label: 'Participant Registration',
      icon: UserPlus,
      component: ParticipantRegistration,
    },
    {
      id: 'viewers',
      label: 'Registration Viewer',
      icon: Users,
      component: RegistrationViewer,
    },
  ];

  if (!localIsAuthenticated) {
    return <PasswordGate onAuthenticate={handleAuthenticate} accessType="data" />;
  }

  return (
    <Layout 
      title="Data Analytics"
      subtitle="View comprehensive analytics and manage exhibition data"
      backgroundGradient="from-indigo-50 to-blue-50 dark:from-dark-900 dark:to-dark-800"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-700"
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
              <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Data Analytics Dashboard
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/administrator"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Data Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </motion.div>
      </div>
    </Layout>
  );
};
