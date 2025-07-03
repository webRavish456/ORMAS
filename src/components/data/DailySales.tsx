import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts';
import { getSalesData } from '../../services/salesService';
import { getProducts, categories as PRODUCT_CATEGORIES } from '../../services/productService';
import { getExhibitionLayout } from '../../services/exhibitionService';
import { getFoods } from '../../services/foodService';

interface SalesData {
  date: string;
  totalSales: number;
}

export const DailySales = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; count: number }[]>([]);
  const [stallData, setStallData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [foodData, setFoodData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [stallCategoryData, setStallCategoryData] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    fetchSalesData();

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
      const categoryCounts: Record<string, number> = {};
      layout.stalls.forEach(stall => {
        if (stall.type === 'participant' && stall.category) {
          categoryCounts[stall.category] = (categoryCounts[stall.category] || 0) + 1;
        }
      });
      const stallCategoryChartData = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      setStallCategoryData(stallCategoryChartData);
    });
  }, []);

  const fetchSalesData = async () => {
    try {
      const data = await getSalesData();
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  return (

    <>
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Daily Sales</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalSales" fill="#3182CE" />
        </BarChart>
      </ResponsiveContainer>
    </div>

      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
      <div className="mb-2 mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Category-wise Product Count</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={categoryData} margin={{ top: 16, right: 32, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 13, fill: '#555' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#555' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1">
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
       </div>
  
        {/* Stall Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Stall Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={stallData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            {stallData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Food Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Food Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={foodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {foodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            {foodData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        </div>
    

      {/* Category-wise Stall Distribution */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Category-wise Participant Stall Distribution</h3>
        {stallCategoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stallCategoryData} margin={{ top: 16, right: 32, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={80} 
                tick={{ fontSize: 12, fill: '#555' }} 
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#555' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981">
                {stallCategoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count === 3 ? '#f97316' : '#10b981'} 
                  />
                ))}
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Category Data Available
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No participant stalls with categories found. Please check:
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Stalls are assigned as 'participant' type</li>
                <li>• Participant stalls have categories assigned</li>
                <li>• Check browser console for detailed data</li>
              </ul>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {stallCategoryData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${item.count === 3 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span className={`text-sm ${item.count === 3 ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                {item.category}: {item.count} stalls
              </span>
            </div>
          ))}
        </div>
        {/* Highlight categories with exactly 3 stalls */}
        {stallCategoryData.filter(item => item.count === 3).length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">
              🎯 Categories with exactly 3 participant stalls:
            </h4>
            <div className="flex flex-wrap gap-3">
              {stallCategoryData
                .filter(item => item.count === 3)
                .map((item, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-800/30 rounded-full">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      {item.category}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      </div>

</>

  );
};
