import React, { useState } from 'react';
import { Layout } from '../components/common/Layout';
import { ExhibitionMap } from '../components/ExhibitionMap';
import { X, MapPin, Users, Settings, Package } from 'lucide-react';
import type { Stall } from '../services/exhibitionService';
import ExhibitionSelector from '../components/common/ExhibitionSelector';

const ExhibitionMapPage = () => {
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  const handleStallClick = (stall: Stall) => {
    setSelectedStall(stall);
  };

  const closeStallDetails = () => {
    setSelectedStall(null);
  };

  return (
    <Layout
      title="Exhibition Map"
      subtitle="Navigate through the exhibition stalls and discover participants"
      showMarquee={true}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6">
          <ExhibitionMap 
            compact={false} 
            showStats={true} 
            onStallClick={handleStallClick}
          />
        </div>

        {selectedStall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedStall.type === 'participant' ? 'bg-blue-500' : 'bg-purple-500'
                    } text-white`}>
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
                      <p className="text-gray-600 dark:text-gray-400 capitalize">
                        {selectedStall.type} Stall
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeStallDetails}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
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
                        Type
                      </h3>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {selectedStall.type}
                      </p>
                    </div>
                  </div>

                  {selectedStall.type === 'participant' && (
                    <>
                      {selectedStall.name && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Stall Name
                          </h3>
                          <p className="text-lg text-gray-900 dark:text-white">
                            {selectedStall.name}
                          </p>
                        </div>
                      )}

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
                    </>
                  )}

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

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={closeStallDetails}
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

export default ExhibitionMapPage; 