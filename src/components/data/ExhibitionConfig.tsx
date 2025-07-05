import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Plus, Activity, Package, DollarSign, AlertCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { useExhibition } from '../../contexts/ExhibitionContext';

interface Exhibition {
  id?: string;
  name: string;
  description?: string;
  status: 'live' | 'completed';
  totalStalls?: number;
  totalSales?: number;
  createdAt?: Date;
}

const downloadRegistrations = async (exhibitionId: string, exhibitionName: string) => {
  const q = query(
    collection(db, `exhibitions/${exhibitionId}/registrations`),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  
  // Flatten the data structure
  const flattenedData = snapshot.docs.flatMap(doc => {
    const data = doc.data();
    // Create a base record with common fields
    const baseRecord = {
      registrationId: doc.id,
      exhibitionId: exhibitionId,
      stallNumber: data.stallNumber,
      stallState: data.stallState,
      otherState: data.otherState || '',
      stallDistrict: data.stallDistrict,
      stallBlock: data.stallBlock,
      gramPanchayat: data.gramPanchayat || '',
      organizationType: data.organizationType,
      otherOrganization: data.otherOrganization || '',
      stallSponsor: data.stallSponsor,
      otherSponsor: data.otherSponsor || '',
      accommodation: data.accommodation,
      stallPhotos: (data.stallPhotos || []).join(', '),
    };

    // Create a record for each participant
    return data.participants.map((participant: any, index: number) => ({
      ...baseRecord,
      participantNumber: index + 1,
      participantName: participant.name || '',
      participantPhone: participant.phone || '',
      participantGender: participant.gender || '',
      participantPhoto: participant.profilePhoto || '',
      // Add inventory items with more details
      inventoryItems: (data.inventory || [])
        .map((item: any) => 
          `${item.productCategory}: ${item.productName} (Qty: ${item.quantity}, Value: ₹${item.value}, Photo: ${item.photo || 'N/A'})`
        )
        .join('; '),
    }));
  });

  const csv = Papa.unparse(flattenedData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${exhibitionName}_registrations.csv`);
};

const downloadSales = async (exhibitionId: string, exhibitionName: string) => {
  const q = query(
    collection(db, `exhibitions/${exhibitionId}/dailySales`),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  
  // Flatten the sales data structure
  const flattenedData = snapshot.docs.flatMap(doc => {
    const data = doc.data();
    // Create a base record with common fields
    const baseRecord = {
      saleId: doc.id,
      exhibitionId: exhibitionId,
      stallId: data.stallId,
      date: data.date,
    };

    // Create a record for each product
    return data.products.map((product: any) => ({
      ...baseRecord,
      productCategory: product.productCategory,
      productName: product.productName,
      quantitySold: product.quantitySold,
      salesValue: product.salesValue,
    }));
  });

  const csv = Papa.unparse(flattenedData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${exhibitionName}_sales.csv`);
};

export const ExhibitionConfig = () => {
  const { selectedExhibition } = useExhibition();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newExhibition, setNewExhibition] = useState<Exhibition>({
    name: '',
    description: '',
    status: 'live',
    totalStalls: 0,
    totalSales: 0
  });

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'exhibitions'), orderBy('createdAt', 'desc'));
      const exhibitionDoc = await getDocs(q);
      const exhibitionData = exhibitionDoc.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Exhibition[];
      setExhibitions(exhibitionData);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      setError('Failed to fetch exhibitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newExhibition.name.trim()) {
      setError('Exhibition name is required');
      return;
    }

    // Check if name already exists (case insensitive)
    const existingExhibition = exhibitions.find(
      ex => ex.name.toLowerCase() === newExhibition.name.toLowerCase()
    );
    
    if (existingExhibition) {
      setError('An exhibition with this name already exists');
      return;
    }

    try {
      setError(null);
      await addDoc(collection(db, 'exhibitions'), {
        name: newExhibition.name.trim(),
        description: newExhibition.description?.trim() || '',
        status: newExhibition.status,
        totalStalls: newExhibition.totalStalls,
        totalSales: newExhibition.totalSales,
        createdAt: new Date()
      });
      
      setNewExhibition({
        name: '',
        description: '',
        status: 'live',
        totalStalls: 0,
        totalSales: 0
      });
      
      fetchExhibitions();
    } catch (error) {
      console.error('Error adding exhibition:', error);
      setError('Failed to add exhibition');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading exhibitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Exhibition Form */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-navy-700 dark:text-navy-300 mb-4">
            <Plus className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Add New Exhibition</h3>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exhibition Name *
            </label>
            <input
              type="text"
              required
              value={newExhibition.name}
              onChange={(e) => setNewExhibition({ ...newExhibition, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="e.g., ORMAS, General Exhibition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newExhibition.description}
              onChange={(e) => setNewExhibition({ ...newExhibition, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="Brief description of the exhibition"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={newExhibition.status}
                onChange={(e) => setNewExhibition({ ...newExhibition, status: e.target.value as 'live' | 'completed' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Stalls</label>
              <input
                type="number"
                min="0"
                value={newExhibition.totalStalls || ''}
                onChange={(e) => setNewExhibition({ ...newExhibition, totalStalls: e.target.value === '' ? undefined : parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Sales (₹)</label>
              <input
                type="number"
                min="0"
                value={newExhibition.totalSales || ''}
                onChange={(e) => setNewExhibition({ ...newExhibition, totalSales: e.target.value === '' ? undefined : parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Exhibition
            </button>
          </div>
        </form>
      </div>

      {/* Existing Exhibitions */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Existing Exhibitions
        </h3>

        {exhibitions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No exhibitions found. Add your first exhibition above.
          </div>
        ) : (
          <div className="space-y-4">
            {exhibitions.map((exhibition) => (
              <div
                key={exhibition.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{exhibition.name}</h4>
                  {exhibition.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exhibition.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      exhibition.status === 'live' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {exhibition.status}
                    </span>
                                         <span className="flex items-center gap-1">
                       <Package className="w-4 h-4" />
                       {exhibition.totalStalls || 0} stalls
                     </span>
                                         <span className="flex items-center gap-1">
                       <DollarSign className="w-4 h-4" />
                       ₹{(exhibition.totalSales || 0).toLocaleString()}
                     </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadRegistrations(exhibition.id!, exhibition.name)}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors"
                  >
                    Download Registrations
                  </button>
                  <button
                    onClick={() => downloadSales(exhibition.id!, exhibition.name)}
                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded text-sm transition-colors"
                  >
                    Download Sales
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
