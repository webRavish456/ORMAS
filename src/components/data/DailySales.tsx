import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts';
import { getSalesData } from '../../services/salesService';
import { getProducts, categories as PRODUCT_CATEGORIES, getProductsByExhibition } from '../../services/productService';
import { getExhibitionLayout, getExhibitionLayoutByExhibition } from '../../services/exhibitionService';
import { getFoods, getFoodsByExhibition } from '../../services/foodService';
import { useExhibition } from '../../contexts/ExhibitionContext';

interface SalesData {
  date: string;
  totalSales: number;
}

export const DailySales = () => {
  const { selectedExhibition } = useExhibition();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; count: number }[]>([]);
  const [stallData, setStallData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [foodData, setFoodData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [stallCategoryData, setStallCategoryData] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    fetchSalesData();

    // Fetch products and count per category
    getProductsByExhibition(selectedExhibition).then(products => {
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
    getExhibitionLayoutByExhibition(selectedExhibition).then(layout => {
      const stallChartData = [
        { name: 'Participant Stalls', value: layout.stats.participant, color: '#3b82f6' },
        { name: 'Utility Stalls', value: layout.stats.utility, color: '#8b5cf6' }
      ];
      setStallData(stallChartData);
    });

    // Fetch food data for vegetarian vs non-vegetarian pie chart
    getFoodsByExhibition(selectedExhibition).then(foods => {
      const vegetarianCount = foods.filter(food => food.isVegetarian).length;
      const nonVegetarianCount = foods.filter(food => !food.isVegetarian).length;
      const foodChartData = [
        { name: 'Vegetarian', value: vegetarianCount, color: '#10b981' },
        { name: 'Non-Vegetarian', value: nonVegetarianCount, color: '#ef4444' }
      ];
      setFoodData(foodChartData);
    });

    // Fetch category-wise stall data
    getExhibitionLayoutByExhibition(selectedExhibition).then(layout => {
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
  }, [selectedExhibition]);

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
      {salesData.length > 0 ? (
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
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-lg font-medium">No sales data available</p>
            <p className="text-sm">Sales data will appear here once available</p>
          </div>
        </div>
      )}
    </div>

      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
      <div className="mb-2 mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Category-wise Product Count</h3>
        {categoryData.some(item => item.count > 0) ? (
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
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-lg font-medium">No products available</p>
              <p className="text-sm">Product data will appear here once available</p>
            </div>
          </div>
        )}
      </div>
       </div>
  
        {/* Stall Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Stall Distribution</h3>
          {stallData.some(item => item.value > 0) ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🏪</div>
                <p className="text-lg font-medium">No stalls available</p>
                <p className="text-sm">Stall data will appear here once available</p>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Food Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Food Distribution</h3>
          {foodData.some(item => item.value > 0) ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-lg font-medium">No food items available</p>
                <p className="text-sm">Food data will appear here once available</p>
              </div>
            </div>
          )}
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
                angle={-20} 
                textAnchor="end" 
                interval={0} 
                height={80} 
                tick={{ fontSize: 12, fill: '#555' }} 
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#555' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6">
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🏪</div>
              <p className="text-lg font-medium">No participant stalls available</p>
              <p className="text-sm">Participant stall data will appear here once available</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};
