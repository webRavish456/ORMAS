import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Layout } from '../components/common/Layout';
import { 
  Settings,
  MapPin,
  Users,
  ArrowLeft,
  Wrench,
  Building2
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
  utilityType?: 'restroom' | 'food' | 'information' | 'security' | 'medical' | 'storage' | 'other';
  capacity?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
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

const getUtilityColor = (utilityType?: string) => {
  switch (utilityType) {
    case 'restroom': return 'from-blue-500 to-blue-600';
    case 'food': return 'from-orange-500 to-orange-600';
    case 'information': return 'from-green-500 to-green-600';
    case 'security': return 'from-red-500 to-red-600';
    case 'medical': return 'from-pink-500 to-pink-600';
    case 'storage': return 'from-gray-500 to-gray-600';
    default: return 'from-purple-500 to-purple-600';
  }
};

const UtilityStallsPage = () => {
  const [utilityStalls, setUtilityStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  useEffect(() => {
    fetchUtilityStalls();
  }, []);

  const fetchUtilityStalls = async () => {
    try {
      setLoading(true);
      const stallsSnapshot = await getDocs(collection(db, 'stalls'));
      const stalls = stallsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Stall[];
      
      const utilities = stalls.filter(stall => stall.type === 'utility');
      setUtilityStalls(utilities);
    } catch (err) {
      console.error('Error fetching utility stalls:', err);
      setError('Failed to fetch utility stalls');
    } finally {
      setLoading(false);
    }
  };

  const extractStallNumber = (stallNumber: string): number => {
    const match = stallNumber.match(/^([A-Z])(\d+)$/);
    if (match) {
      const letter = match[1];
      const columnNumber = parseInt(match[2]);
      const rowValue = letter.charCodeAt(0) - 65;
      const maxColumn = Math.max(...utilityStalls.map(s => {
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
        title="Utility Stalls"
        subtitle="Loading facility information..."
        showMarquee={true}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading utility stalls...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Utility Stalls"
        subtitle="Error loading data"
        showMarquee={true}
      >
        <div className="text-center py-8">
          <div className="text-red-600 text-lg">{error}</div>
          <button 
            onClick={fetchUtilityStalls}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Utility Stalls"
      subtitle="Find essential facilities and services at our exhibition"
      showMarquee={true}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back to Map Button */}
        <Link 
          to="/map" 
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exhibition Map
        </Link>

        {/* Stats */}
        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy-800 dark:text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-600" />
              Utility Stalls
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {utilityStalls.length} stalls
            </div>
          </div>
        </div>

        {/* Utility Stalls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilityStalls.map((stall) => (
            <div
              key={stall.id}
              className="bg-white dark:bg-dark-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedStall(stall)}
            >
              {/* Stall Header */}
              <div className={`bg-gradient-to-r ${getUtilityColor(stall.utilityType)} text-white p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Stall {stall.stallNumber}</h3>
                    <p className="text-white/80 text-sm">#{extractStallNumber(stall.stallNumber)}</p>
                  </div>
                  <div className="text-2xl">
                    {getUtilityIcon(stall.utilityType)}
                  </div>
                </div>
              </div>

              {/* Stall Content */}
              <div className="p-4 space-y-3">
                {/* Stall Name */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {stall.name || 'Unnamed Utility'}
                  </h4>
                </div>

                {/* Utility Type */}
                {stall.utilityType && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {stall.utilityType}
                    </span>
                  </div>
                )}

                {/* Capacity */}
                {stall.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Capacity: {stall.capacity} people
                    </span>
                  </div>
                )}

                {/* Description Preview */}
                {stall.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {stall.description}
                  </p>
                )}

                {/* Notes Preview */}
                {stall.notes && (
                  <p className="text-xs text-gray-500 italic line-clamp-1">
                    {stall.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {utilityStalls.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Utility Stalls Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Utility stalls information will appear here once they are configured.
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
                    <div className={`w-12 h-12 bg-gradient-to-r ${getUtilityColor(selectedStall.utilityType)} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {getUtilityIcon(selectedStall.utilityType)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Stall {selectedStall.stallNumber}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedStall.name || 'Unnamed Utility'}
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

                  {/* Utility Type */}
                  {selectedStall.utilityType && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Utility Type
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getUtilityIcon(selectedStall.utilityType)}</span>
                        <p className="text-lg text-gray-900 dark:text-white capitalize">
                          {selectedStall.utilityType}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Capacity */}
                  {selectedStall.capacity && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Capacity
                      </h3>
                      <p className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {selectedStall.capacity} people
                      </p>
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

                  {/* Notes */}
                  {selectedStall.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Notes
                      </h3>
                      <p className="text-gray-900 dark:text-white leading-relaxed italic">
                        {selectedStall.notes}
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

export default UtilityStallsPage; 