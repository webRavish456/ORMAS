import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  Users, 
  Wrench, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Building2,
  Settings,
  Shirt,
  Palette,
  Leaf,
  UtensilsCrossed,
  Sofa,
  Scissors,
  Briefcase,
  Gem
} from 'lucide-react';

import rawIndiaData from '../../data/india_state_district_block.json';
import { processIndiaData, getStates, getDistricts, getBlocks } from '../../utils/indiaDataProcessor';



interface Stall {
  id: string;
  row: number;
  column: number;
  stallNumber: string;
  type?: 'participant' | 'utility'; // Optional initially
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
  createdAt: Date | string;
  updatedAt: Date | string;
}


const STALL_CATEGORIES = [
  'Handloom',
  'Handicraft', 
  'Minor Forest Products (MFP)',
  'Food & Spices',
  'Home Furnishing',
  'Woolen Knit Wear',
  'Leather Products',
  'Jewellery'
];

// Category color mapping for participant stalls
const CATEGORY_COLORS: Record<string, string> = {
  Handloom: 'bg-indigo-500',
  Handicraft: 'bg-yellow-500',
  'Minor Forest Products (MFP)': 'bg-green-600',
  'Food & Spices': 'bg-red-500',
  'Home Furnishing': 'bg-pink-500',
  'Woolen Knit Wear': 'bg-blue-400',
  'Leather Products': 'bg-amber-700',
  Jewellery: 'bg-rose-500',
};

// Category to icon mapping
const CATEGORY_ICONS: Record<string, any> = {
  Handloom: Shirt,
  Handicraft: Palette,
  'Minor Forest Products (MFP)': Leaf,
  'Food & Spices': UtensilsCrossed,
  'Home Furnishing': Sofa,
  'Woolen Knit Wear': Scissors,
  'Leather Products': Briefcase,
  Jewellery: Gem,
};

// Process India data for cascading dropdowns
const processedIndiaData = processIndiaData(rawIndiaData);

// Utility to deeply clean an object
function deepCleanObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepCleanObject);
  } else if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (
        value !== undefined &&
        value !== null &&
        !(typeof value === 'string' && value.trim() === '')
      ) {
        cleaned[key] = deepCleanObject(value);
      }
    });
    return cleaned;
  }
  return obj;
}

export const ExhibitionStallManager = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [stallsCreated, setStallsCreated] = useState(false);
  
  // Simple form fields - only rows and columns
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);
  const [totalStalls, setTotalStalls] = useState(0);

  // Stats start at zero and update after assignment
  const [stats, setStats] = useState({
    total: 0,
    participant: 0,
    utility: 0,
  });

  const [typeSelectionStall, setTypeSelectionStall] = useState<Stall | null>(null);

  useEffect(() => {
    calculateStalls();
  }, [rows, columns]);

  useEffect(() => {
    checkExistingStalls();
  }, []);

  const checkExistingStalls = async () => {
    try {
      const stallsSnapshot = await getDocs(collection(db, 'stalls'));
      if (!stallsSnapshot.empty) {
        const existingStalls = stallsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Stall[];
        setStalls(existingStalls);
        setStallsCreated(true);
        
        // Extract rows and columns from existing stalls
        const maxRow = Math.max(...existingStalls.map(s => s.row));
        const maxColumn = Math.max(...existingStalls.map(s => s.column));
        setRows(maxRow + 1); // +1 because row index starts from 0
        setColumns(maxColumn + 1); // +1 because column index starts from 0
        
        // Update statistics
        const participantCount = existingStalls.filter(s => s.type === 'participant').length;
        const utilityCount = existingStalls.filter(s => s.type === 'utility').length;
        
        setStats({
          total: existingStalls.length,
          participant: participantCount,
          utility: utilityCount
        });
      }
    } catch (err) {
      console.error('Error checking existing stalls:', err);
    }
  };

  const calculateStalls = () => {
    const total = rows * columns;
    setTotalStalls(total);
  };



  const handleCreateStalls = async () => {
    let initialStalls: Omit<Stall, 'id'>[] = [];
    try {
      setLoading(true);
      setError(null);
  
      // Delete existing stalls from Firestore
      const existingStalls = await getDocs(collection(db, 'stalls'));
      const deletePromises = existingStalls.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
  
      // Create new stalls (all gray, no type/category assigned yet)
      const total = rows * columns;
      initialStalls = [];
  
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const stallNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
          const stall: any = {
            row,
            column: col,
            stallNumber,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          // Do not include 'type' field if undefined
          initialStalls.push(stall);
        }
      }
  
      // Save to Firebase
      const stallDocs = await Promise.all(
        initialStalls.map(stall => addDoc(collection(db, 'stalls'), stall))
      );
  
      const stallsWithIds = stallDocs.map((doc, index) => ({
        id: doc.id,
        ...initialStalls[index],
      }));
  
      // Update local state
      setStalls(stallsWithIds);
      setStallsCreated(true);
  
      // Set stats: only total, participant and utility are 0 initially
      setStats({
        total: stallsWithIds.length,
        participant: 0,
        utility: 0
      });
  
    } catch (err) {
      console.error('Error creating stalls:', err, rows, columns, initialStalls);
      setError('Failed to create stalls');
    } finally {
      setLoading(false);
    }
  };
  


  const getStallAtPosition = (row: number, column: number): Stall | undefined => {
    return stalls.find(stall => stall.row === row && stall.column === column);
  };

  const getStallColor = (stall: Stall): string => {
    // If no type, show gray (initial state)
    if (!stall.type) return 'bg-gray-400';
    
    switch (stall.type) {
      case 'participant': 
        // Use category color if available, otherwise blue
        return stall.category && CATEGORY_COLORS[stall.category] 
          ? CATEGORY_COLORS[stall.category] 
          : 'bg-blue-500';
      case 'utility': 
        return 'bg-purple-600'; // Gray for utility stalls
      default: 
        return 'bg-gray-400';
    }
  };

  const getStallIcon = (stall: Stall) => {
    if (stall.type === 'participant' && stall.category && CATEGORY_ICONS[stall.category]) {
      const Icon = CATEGORY_ICONS[stall.category];
      return <Icon className="w-5 h-5 mb-1" />;
    }
    return null;
  };

  const handleStallClick = (stall: Stall) => {
    // If stall has no type (initial gray state), show type selection popup
    if (!stall.type) {
      setTypeSelectionStall(stall);
      setSelectedStall(null);
      setEditingStall(null);
    } else {
      // If stall has a type, show stall details for editing
      setSelectedStall(stall);
      setEditingStall(null);
      setTypeSelectionStall(null);
    }
  };

  const handleTypeSelection = async (stall: Stall, type: 'participant' | 'utility') => {
    try {
      const updatedStall = { ...stall, type };
      await updateDoc(doc(db, 'stalls', stall.id), { type });
      
      setStalls(prev => {
        const newStalls = prev.map(s => s.id === stall.id ? updatedStall : s);
        
        // Update stats based on new stalls array
        const participantCount = newStalls.filter(s => s.type === 'participant').length;
        const utilityCount = newStalls.filter(s => s.type === 'utility').length;
        
        setStats({
          total: newStalls.length,
          participant: participantCount,
          utility: utilityCount
        });
        
        return newStalls;
      });
      
      setTypeSelectionStall(null);
    } catch (err) {
      console.error('Error updating stall type:', err);
      setError('Failed to update stall type');
    }
  };

  const handleEditStall = (stall: Stall) => {
    setEditingStall({ ...stall });
    setSelectedStall(null);
    setSelectedImages([]);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedImages(fileArray);
    }
  };

  const testFirestoreConnection = async () => {
    try {
      console.log('Testing Firestore connection...');
      const testDoc = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: new Date().toISOString()
      });
      console.log('Test document created:', testDoc.id);
      await deleteDoc(doc(db, 'test', testDoc.id));
      console.log('Test document deleted');
      return true;
    } catch (err) {
      console.error('Firestore test failed:', err);
      return false;
    }
  };

  const handleSaveStall = async () => {
    if (!editingStall) return;

    try {
      // Test Firestore connection first
      const connectionOk = await testFirestoreConnection();
      if (!connectionOk) {
        setError('Firestore connection failed');
        return;
      }

      // Convert selected images to base64
      const imagePromises = selectedImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);

      // Prepare update object, convert Date to string, remove undefined fields
      const updatedStall: any = {
        ...editingStall,
        images: imageUrls,
        updatedAt: new Date().toISOString(),
      };
      // Handle createdAt field - convert to string if it's a Date
      if (updatedStall.createdAt instanceof Date) {
        updatedStall.createdAt = updatedStall.createdAt.toISOString();
      } else if (typeof updatedStall.createdAt === 'string') {
        updatedStall.createdAt = updatedStall.createdAt;
      } else {
        updatedStall.createdAt = new Date().toISOString();
      }

      if (!editingStall.id) {
        setError('Stall ID missing!');
        return;
      }

      // Deep clean the object
      const cleanedStall = deepCleanObject(updatedStall);
      console.log('Updating stall with data:', cleanedStall);

      await updateDoc(doc(db, 'stalls', editingStall.id), cleanedStall);
      
      setStalls(prev => prev.map(stall => 
        stall.id === editingStall.id ? { ...cleanedStall, id: editingStall.id } : stall
      ));
      
      setEditingStall(null);
      setSelectedImages([]);
    } catch (err) {
      setError('Failed to update stall');
      console.error('Error updating stall:', err, editingStall);
    }
  };

  const handleCancelEdit = () => {
    setEditingStall(null);
    setSelectedImages([]);
  };

  const handleResetStalls = async () => {
    if (window.confirm('Are you sure you want to reset all stalls? This will delete all existing stall data and allow you to create a new matrix.')) {
      try {
        setLoading(true);
        // Delete all existing stalls
        const existingStalls = await getDocs(collection(db, 'stalls'));
        const deletePromises = existingStalls.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Reset state
        setStalls([]);
        setStallsCreated(false);
        setStats({ total: 0, participant: 0, utility: 0 });
        setSelectedStall(null);
        setEditingStall(null);
      } catch (err) {
        console.error('Error resetting stalls:', err);
        setError('Failed to reset stalls');
      } finally {
        setLoading(false);
      }
    }
  };

  const extractStallNumber = (stallNumber: string): number => {
    // Extract the letter and number from stall number (e.g., A1, B1, etc.)
    const match = stallNumber.match(/^([A-Z])(\d+)$/);
    if (match) {
      const letter = match[1];
      const columnNumber = parseInt(match[2]);
      // Calculate the sequential number based on letter (row) and column
      const rowValue = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
      // Use the actual column count from state
      return rowValue * columns + columnNumber; // A1=1, A2=2, B1=columns+1, B2=columns+2, etc.
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-navy-800">Exhibition Stall Manager</h2>
        {stallsCreated && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Stalls configured • {stats.total} total stalls
            </div>
            <button
              onClick={handleResetStalls}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
              title="Reset all stalls"
            >
              Reset Matrix
            </button>
          </div>
        )}
      </div>

      {/* Create Form - Only show if stalls haven't been created */}
      {!stallsCreated && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Configure Stall Matrix</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Row:</label>
              <input
                type="number"
                min="0"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column:</label>
              <input
                type="number"
                min="0"
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleCreateStalls}
              className="flex items-center gap-2 bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700"
            >
              <Plus className="w-4 h-4" />
              Create Stall Matrix
            </button>
          </div>
        </div>
      )}

      {/* Statistics - Show always */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-navy-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Stalls</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.participant}</div>
          <div className="text-sm text-gray-600">Participant</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.utility}</div>
          <div className="text-sm text-gray-600">Utility</div>
        </div>
      </div>

      {/* Stall Matrix - Show only if stalls have been created */}
      {stallsCreated && stalls.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Stall Matrix ({rows}×{columns} = {rows * columns} Stalls)</h3>
          
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Column Headers */}
              <div className="flex">
                <div className="w-12 h-8 flex items-center justify-center text-xs font-medium text-gray-500"></div>
                {Array.from({ length: columns }, (_, col) => (
                  <div key={col} className="w-16 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {col + 1}
                  </div>
                ))}
              </div>

              {/* Stall Grid */}
              {Array.from({ length: rows }, (_, row) => (
                <div key={row} className="flex">
                  {/* Row Header */}
                  <div className="w-12 h-16 flex items-center justify-center text-xs font-medium text-gray-500">
                    {String.fromCharCode(65 + row)}
                  </div>
                  
                  {/* Stalls */}
                  {Array.from({ length: columns }, (_, col) => {
                    const stall = getStallAtPosition(row, col);
                    if (!stall) return <div key={col} className="w-16 h-16 border border-gray-200" />;

                    return (
                      <div
                        key={col}
                        onClick={() => handleStallClick(stall)}
                        className={`
                          w-16 h-16 border border-gray-300 cursor-pointer
                          flex flex-col items-center justify-center
                          ${getStallColor(stall)} text-white
                          hover:opacity-80 transition-opacity
                        `}
                      >
                        <div className="text-xs font-medium">{stall.stallNumber}</div>
                        {getStallIcon(stall)}
                        
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
        </div>
      )}

      {/* Stall Details Panel */}
      {selectedStall && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Stall Details - {selectedStall.stallNumber}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditStall(selectedStall)}
                className="text-navy-600 hover:text-navy-700"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedStall(null)}
                className="text-gray-600 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stall Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="text-sm text-gray-900 capitalize">{selectedStall.type}</p>
            </div>

            {/* Stall Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Stall Number</label>
              <div className="text-sm text-gray-900">
                <div className="font-medium">{extractStallNumber(selectedStall.stallNumber)}</div>
              </div>
            </div>

            {/* For Participant Type */}
            {selectedStall.type === 'participant' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stall Number</label>
                  <p className="text-sm text-gray-900">{selectedStall.stallNumber}</p>
                </div>

                {selectedStall.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name of Stall</label>
                    <p className="text-sm text-gray-900">{selectedStall.name}</p>
                  </div>
                )}

                {selectedStall.location && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Stall Location</label>
                    <p className="text-sm text-gray-900">
                      State: {selectedStall.location.state}, District: {selectedStall.location.district}, Block: {selectedStall.location.block}
                    </p>
                  </div>
                )}

                {selectedStall.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Category</label>
                    <p className="text-sm text-gray-900">{selectedStall.category}</p>
                  </div>
                )}

                {selectedStall.products && selectedStall.products.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Products</label>
                    <ul className="text-sm text-gray-900 list-disc list-inside">
                      {selectedStall.products.map((product: string, i: number) => (
                        <li key={i}>{product}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStall.images && selectedStall.images.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Product Images</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStall.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt={`Product ${i}`} className="w-24 h-24 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* For Utility Type */}
            {selectedStall.type === 'utility' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stall Number</label>
                  <p className="text-sm text-gray-900">{selectedStall.stallNumber}</p>
                </div>

                {selectedStall.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name of Stall</label>
                    <p className="text-sm text-gray-900">{selectedStall.name}</p>
                  </div>
                )}

                {selectedStall.utilityType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Utility Type</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedStall.utilityType}</p>
                  </div>
                )}

                {selectedStall.description && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                    <p className="text-sm text-gray-900">{selectedStall.description}</p>
                  </div>
                )}

                {selectedStall.images && selectedStall.images.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Stall Images</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStall.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt={`Utility ${i}`} className="w-24 h-24 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Stall Form */}
      {editingStall && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit Stall - {editingStall.stallNumber}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveStall}
                className="text-green-600 hover:text-green-700"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name of Stall</label>
              <input
                type="text"
                value={editingStall.name || ''}
                onChange={(e) => setEditingStall({ ...editingStall, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Enter stall name (e.g., XYZ entries)"
              />
            </div>

            {/* Stall Number - Readonly */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stall Number</label>
              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50">
                <div className="font-medium">{extractStallNumber(editingStall.stallNumber)}</div>
              </div>
            </div>

            {editingStall.type === 'participant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                <select
                  value={editingStall.category || ''}
                  onChange={(e) => setEditingStall({ ...editingStall, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Select Category</option>
                  {STALL_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}


            {editingStall.type === 'participant' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={editingStall.location?.state || ''}
                    onChange={(e) => setEditingStall({ 
                      ...editingStall, 
                      location: { 
                        state: e.target.value,
                        district: '',
                        block: ''
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Select State</option>
                    {getStates(processedIndiaData).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select
                    value={editingStall.location?.district || ''}
                    onChange={(e) => setEditingStall({ 
                      ...editingStall, 
                      location: { 
                        state: editingStall.location?.state || '',
                        district: e.target.value,
                        block: ''
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    disabled={!editingStall.location?.state}
                  >
                    <option value="">Select District</option>
                    {editingStall.location?.state && getDistricts(processedIndiaData, editingStall.location.state).length > 0 ? (
                      getDistricts(processedIndiaData, editingStall.location.state).map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))
                    ) : editingStall.location?.state ? (
                      <option value="" disabled>No districts available for {editingStall.location.state}</option>
                    ) : null}
                  </select>
                  {editingStall.location?.state && getDistricts(processedIndiaData, editingStall.location.state).length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Districts for {editingStall.location.state} are not available in the current data.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                  <select
                    value={editingStall.location?.block || ''}
                    onChange={(e) => setEditingStall({ 
                      ...editingStall, 
                      location: { 
                        state: editingStall.location?.state || '',
                        district: editingStall.location?.district || '',
                        block: e.target.value
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    disabled={!editingStall.location?.district}
                  >
                    <option value="">Select Block</option>
                    {editingStall.location?.district && editingStall.location?.state && getBlocks(processedIndiaData, editingStall.location.state, editingStall.location.district).length > 0 ? (
                      getBlocks(processedIndiaData, editingStall.location.state, editingStall.location.district).map(block => (
                        <option key={block} value={block}>{block}</option>
                      ))
                    ) : editingStall.location?.district ? (
                      <option value="" disabled>No blocks available for {editingStall.location.district}</option>
                    ) : null}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                  <input
                    type="text"
                    value={editingStall.products?.join(', ') || ''}
                    onChange={(e) => setEditingStall({ 
                      ...editingStall, 
                      products: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Enter products separated by commas"
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingStall.type === 'participant' ? 'Product Description' : 'Short Description'}
              </label>
              <textarea
                value={editingStall.description || ''}
                onChange={(e) => setEditingStall({ ...editingStall, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={3}
                placeholder={editingStall.type === 'participant' ? "Enter product description" : "Enter short description (e.g., banks, fire equipments, etc.)"}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Multiple Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-navy-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Click to select multiple images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </label>
              </div>
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected Images ({selectedImages.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index}`} 
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate w-20">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Type Selection Popup */}
      {typeSelectionStall && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Select Stall Type - {typeSelectionStall.stallNumber}</h3>
            <button
              onClick={() => setTypeSelectionStall(null)}
              className="text-gray-600 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTypeSelection(typeSelectionStall, 'participant')}
              className="p-4 border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-blue-600">Participant</div>
                <div className="text-sm text-gray-600">For product stalls</div>
              </div>
            </button>
            
            <button
              onClick={() => handleTypeSelection(typeSelectionStall, 'utility')}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold text-gray-600">Utility</div>
                <div className="text-sm text-gray-600">For services</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};
