import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Layout } from '../components/common/Layout';
import { 
  Users,
  MapPin,
  Package,
  Image,
  ArrowLeft
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

const ParticipantStallsPage = () => {
  const [participantStalls, setParticipantStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  useEffect(() => {
    fetchParticipantStalls();
  }, []);

  const fetchParticipantStalls = async () => {
    try {
      setLoading(true);
      const stallsSnapshot = await getDocs(collection(db, 'stalls'));
      const stalls = stallsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Stall[];
      
      const participants = stalls.filter(stall => stall.type === 'participant');
      setParticipantStalls(participants);
    } catch (err) {
      console.error('Error fetching participant stalls:', err);
      setError('Failed to fetch participant stalls');
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
      const maxColumn = Math.max(...participantStalls.map(s => {
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
        title="Participant Stalls"
        subtitle="Loading participant information..."
        showMarquee={true}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading participant stalls...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Participant Stalls"
        subtitle="Error loading data"
        showMarquee={true}
      >
        <div className="text-center py-8">
          <div className="text-red-600 text-lg">{error}</div>
          <button 
            onClick={fetchParticipantStalls}
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
      title="Participant Stalls"
      subtitle="Discover the artisans and their products at our exhibition"
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
              <Users className="w-8 h-8 text-blue-600" />
              Participant Stalls
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {participantStalls.length} stalls
            </div>
          </div>
        </div>

        {/* Participant Stalls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {participantStalls.map((stall) => (
            <div
              key={stall.id}
              className="bg-white dark:bg-dark-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedStall(stall)}
            >
              {/* Stall Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Stall {stall.stallNumber}</h3>
                    <p className="text-blue-100 text-sm">#{extractStallNumber(stall.stallNumber)}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              {/* Stall Content */}
              <div className="p-4 space-y-3">
                {/* Stall Name */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {stall.name || 'Unnamed Stall'}
                  </h4>
                </div>

                {/* Location */}
                {stall.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{stall.location.state}</p>
                      <p>{stall.location.district}, {stall.location.block}</p>
                    </div>
                  </div>
                )}

                {/* Category */}
                {stall.category && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stall.category}
                    </span>
                  </div>
                )}

                {/* Products Preview */}
                {stall.products && stall.products.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Products:</p>
                    <div className="flex flex-wrap gap-1">
                      {stall.products.slice(0, 3).map((product, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs"
                        >
                          {product}
                        </span>
                      ))}
                      {stall.products.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                          +{stall.products.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Images Preview */}
                {stall.images && stall.images.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Image className="w-4 h-4" />
                    <span>{stall.images.length} image{stall.images.length > 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Description Preview */}
                {stall.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {stall.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {participantStalls.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Participant Stalls Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Participant stalls information will appear here once they are configured.
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
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Stall {selectedStall.stallNumber}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedStall.name || 'Unnamed Stall'}
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

                  {/* Category */}
                  {selectedStall.category && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Product Category
                      </h3>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {selectedStall.category}
                      </p>
                    </div>
                  )}

                  {/* Products */}
                  {selectedStall.products && selectedStall.products.length > 0 && (
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

export default ParticipantStallsPage; 