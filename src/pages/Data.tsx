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
import { getProducts, categories as PRODUCT_CATEGORIES } from '../services/productService';
import { getExhibitionLayout } from '../services/exhibitionService';
import { getFoods } from '../services/foodService';


export const Data = () => {
  const { isAdmin, isDataUser, setIsDataUser, logout } = useTheme();
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(isAdmin || isDataUser);
  const [activeTab, setActiveTab] = useState('sales');
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState<{ category: string; count: number }[]>([]);
  const [stallData, setStallData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [foodData, setFoodData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [stallCategoryData, setStallCategoryData] = useState<{ category: string; count: number }[]>([]);

  // Set data user state when locally authenticated (if not already admin)
  useEffect(() => {
    if (localIsAuthenticated && !isAdmin) {
      setIsDataUser(true);
    }
  }, [localIsAuthenticated, setIsDataUser, isAdmin]);

  useEffect(() => {
    // Fetch products and count per category
    getProducts().then(products => {
      const counts: Record<string, number> = {};
      PRODUCT_CATEGORIES.forEach(cat => { counts[cat] = 0; });
      products.forEach(product => {
        if (counts[product.category] !== undefined) {
          counts[product.category] += 1;
        }
      });
      setCategoryData(PRODUCT_CATEGORIES.map(cat => ({ category: cat, count: counts[cat] })));
    });

    // Fetch stall data for pie chart
    getExhibitionLayout().then(layout => {
      const stallChartData = [
        { name: 'Participant Stalls', value: layout.stats.participant, color: '#3b82f6' },
        { name: 'Utility Stalls', value: layout.stats.utility, color: '#8b5cf6' }
      ];
      setStallData(stallChartData);
    });

    // Fetch food data for vegetarian vs non-vegetarian pie chart
    getFoods().then(foods => {
      const vegetarianCount = foods.filter(food => food.isVegetarian).length;
      const nonVegetarianCount = foods.filter(food => !food.isVegetarian).length;
      const foodChartData = [
        { name: 'Vegetarian', value: vegetarianCount, color: '#10b981' },
        { name: 'Non-Vegetarian', value: nonVegetarianCount, color: '#ef4444' }
      ];
      setFoodData(foodChartData);
    });

    // Fetch category-wise stall data
    getExhibitionLayout().then(layout => {
      console.log('All stalls data:', layout.stalls);
      
      const categoryCounts: Record<string, number> = {};
      let participantStallsCount = 0;
      let stallsWithCategoryCount = 0;
      
      layout.stalls.forEach(stall => {
        console.log('Stall:', stall.stallNumber, 'Type:', stall.type, 'Category:', stall.category);
        
        if (stall.type === 'participant') {
          participantStallsCount++;
          if (stall.category) {
            stallsWithCategoryCount++;
            categoryCounts[stall.category] = (categoryCounts[stall.category] || 0) + 1;
          }
        }
      });

      console.log('Participant stalls count:', participantStallsCount);
      console.log('Stalls with category count:', stallsWithCategoryCount);
      console.log('Category counts:', categoryCounts);

      // Convert to chart data format and sort by count
      const stallCategoryChartData = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          count
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

      console.log('Final chart data:', stallCategoryChartData);
      setStallCategoryData(stallCategoryChartData);
    });
  }, []);

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            tabs={tabs}
          />
        </motion.div>

     
   
      </div>
    </Layout>
  );
};
