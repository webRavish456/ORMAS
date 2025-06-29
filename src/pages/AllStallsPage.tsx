import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Layout } from '../components/common/Layout';
import { 
  Users,
  MapPin,
  Package,
  Image,
  ArrowLeft,
  Settings,
  Building2,
  ChevronDown,
  Eye,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stall {
  id: string;
  row: number;
  column: number;
  stallNumber: string;
  type: 'participant' | 'utility';
  name?: string;
  description?: string;
  category?: string;
  utilityType?: 'restroom' | 'food' | 'information' | 'security' | 'medical' | 'storage' | 'other';
  capacity?: number;
  notes?: string;
  location?: {
    state: string;
    district: string;
    block: string;
  };
  products?: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Filters {
  stallType: string;
  state: string;
  district: string;
  category: string;
  search: string;
}

const getUtilityIcon = (utilityType?: string) => {
  switch (utilityType) {
    case 'restroom': return '🚻';
    case 'food': return '🍽️';
    case 'information': return 'ℹ️';
    case 'security': return '🛡️';
    case 'medical': return '🏥';
    case 'storage': return '📦';
    default: return '⚙️';
  }
};

const AllStallsPage = () => {
  const [allStalls, setAllStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [filters, setFilters] = useState<Filters>({
    stallType: '',
    state: '',
    district: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchAllStalls();
  }, []);

  const fetchAllStalls = async () => {
    try {
      setLoading(true);
      const stallsSnapshot = await getDocs(collection(db, 'stalls'));
      const stalls = stallsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Stall[];
      
      setAllStalls(stalls);
    } catch (err) {
      console.error('Error fetching stalls:', err);
      setError('Failed to fetch stalls');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const states = [...new Set(allStalls.map(stall => stall.location?.state).filter(Boolean))];
    const districts = [...new Set(allStalls.map(stall => stall.location?.district).filter(Boolean))];
    const categories = [...new Set(allStalls.map(stall => stall.category).filter(Boolean))];
    
    return {
      states,
      districts,
      categories
    };
  }, [allStalls]);

  // Filter stalls based on selected filters
  const filteredStalls = useMemo(() => {
    return allStalls.filter(stall => {
      if (filters.stallType && stall.type !== filters.stallType) return false;
      if (filters.state && stall.location?.state !== filters.state) return false;
      if (filters.district && stall.location?.district !== filters.district) return false;
      if (filters.category && stall.category !== filters.category) return false;
      
      // Search functionality - search through name, category, and products
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const nameMatch = stall.name?.toLowerCase().includes(searchTerm) || false;
        const categoryMatch = stall.category?.toLowerCase().includes(searchTerm) || false;
        const productMatch = stall.products?.some(product => 
          product.toLowerCase().includes(searchTerm)
        ) || false;
        
        if (!nameMatch && !categoryMatch && !productMatch) return false;
      }
      
      return true;
    });
  }, [allStalls, filters]);

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      stallType: '',
      state: '',
      district: '',
      category: '',
      search: ''
    });
  };

  const extractStallNumber = (stallNumber: string): number => {
    const match = stallNumber.match(/^([A-Z])(\d+)$/);
    if (match) {
      const letter = match[1];
      const columnNumber = parseInt(match[2]);
      const rowValue = letter.charCodeAt(0) - 65;
      const maxColumn = Math.max(...allStalls.map(s => {
        const colMatch = s.stallNumber.match(/^[A-Z](\d+)$/);
        return colMatch ? parseInt(colMatch[1]) : 0;
      }));
      const columnsPerRow = maxColumn || 10;
      return rowValue * columnsPerRow + columnNumber;
    }
    return 0;
  };

  if (loading) {
    return (
      <Layout
        title="All Stalls"
        subtitle="Loading stall information..."
        showMarquee={true}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading stalls...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="All Stalls"
        subtitle="Error loading data"
        showMarquee={true}
      >
        <div className="text-center py-8">
          <div className="text-red-600 text-lg">{error}</div>
          <button 
            onClick={fetchAllStalls}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="All Stalls"
      subtitle="Discover all stalls and facilities at our exhibition"
      showMarquee={true}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back to Map Button */}
        <Link 
          to="/map" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exhibition Map
        </Link>

        {/* Stats */}
        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy-800 dark:text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              All Stalls
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredStalls.length} of {allStalls.length} stalls
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Products & Categories
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by product name, category, or stall name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stall Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stall Type
              </label>
              <div className="relative">
                <select
                  value={filters.stallType}
                  onChange={(e) => handleFilterChange('stallType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="participant">Participant Stalls</option>
                  <option value="utility">Utility Stalls</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State
              </label>
              <div className="relative">
                <select
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All States</option>
                  {filterOptions.states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                District
              </label>
              <div className="relative">
                <select
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Districts</option>
                  {filterOptions.districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Category
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Stalls Table */}
        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stall Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category/Utility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStalls.map((stall) => (
                  <tr key={stall.id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Stall {stall.stallNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{extractStallNumber(stall.stallNumber)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {stall.name || (stall.type === 'participant' ? 'Unnamed Stall' : 'Unnamed Utility')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stall.type === 'participant' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {stall.type === 'participant' ? (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            Participant
                          </>
                        ) : (
                          <>
                            <Settings className="w-3 h-3 mr-1" />
                            Utility
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stall.location ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>{stall.location.state}</div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {stall.location.district}, {stall.location.block}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stall.type === 'participant' ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {stall.category || 'No category'}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {stall.utilityType ? (
                            <span className="flex items-center">
                              <span className="mr-1">{getUtilityIcon(stall.utilityType)}</span>
                              {stall.utilityType}
                            </span>
                          ) : (
                            'No type specified'
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stall.type === 'participant' && stall.products && stall.products.length > 0 ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {stall.products.slice(0, 2).join(', ')}
                          {stall.products.length > 2 && ` +${stall.products.length - 2} more`}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {stall.type === 'participant' ? 'No products' : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedStall(stall)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredStalls.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Stalls Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {Object.values(filters).some(f => f !== '') 
                ? 'Try adjusting your filters to see more results.'
                : 'Stall information will appear here once they are configured.'
              }
            </p>
          </div>
        )}

        {/* Detailed Modal */}
        {selectedStall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${
                      selectedStall.type === 'participant' 
                        ? 'bg-blue-500' 
                        : 'bg-purple-500'
                    }`}>
                      {selectedStall.type === 'participant' ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        <Settings className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Stall {selectedStall.stallNumber}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedStall.name || (selectedStall.type === 'participant' ? 'Unnamed Stall' : 'Unnamed Utility')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStall(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Position
                      </h3>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Row {String.fromCharCode(65 + selectedStall.row)}, Column {selectedStall.column + 1}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Sequential Number
                      </h3>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        #{extractStallNumber(selectedStall.stallNumber)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {selectedStall.location && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Location
                      </h3>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {selectedStall.location.state}, {selectedStall.location.district}, {selectedStall.location.block}
                      </p>
                    </div>
                  )}

                  {/* Category or Utility Type */}
                  {selectedStall.type === 'participant' ? (
                    selectedStall.category && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Product Category
                        </h3>
                        <p className="text-lg text-gray-900 dark:text-white">
                          {selectedStall.category}
                        </p>
                      </div>
                    )
                  ) : (
                    selectedStall.utilityType && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Utility Type
                        </h3>
                        <p className="text-lg text-gray-900 dark:text-white capitalize">
                          {selectedStall.utilityType}
                        </p>
                      </div>
                    )
                  )}

                  {/* Products (only for participant stalls) */}
                  {selectedStall.type === 'participant' && selectedStall.products && selectedStall.products.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Products
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStall.products.map((product, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {selectedStall.images && selectedStall.images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Product Images
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {selectedStall.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedStall.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Description
                      </h3>
                      <p className="text-gray-900 dark:text-white leading-relaxed">
                        {selectedStall.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setSelectedStall(null)}
                    className="px-6 py-2 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllStallsPage; 