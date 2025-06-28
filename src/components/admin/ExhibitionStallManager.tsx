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
  Settings
} from 'lucide-react';

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

export const ExhibitionStallManager = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [stallsCreated, setStallsCreated] = useState(false);
  
  // Simple form fields
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);
  const [participantStalls, setParticipantStalls] = useState(0);
  const [utilityStalls, setUtilityStalls] = useState(0);
  const [lastEdited, setLastEdited] = useState("participant");
  const [totalStalls, setTotalStalls] = useState(0);


  const [stats, setStats] = useState({
    total: 0,
    participant: 0,
    utility: 0,
  });

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
    const participants = Math.floor(total * 0.8);
    const utilities = total - participants;
    
    setParticipantStalls(participants);
    setUtilityStalls(utilities);
  };


  useEffect(() => {
    if (lastEdited === "participant") {
      setUtilityStalls(totalStalls - participantStalls);
    } else if (lastEdited === "utility") {
      setParticipantStalls(totalStalls - utilityStalls);
    }
  }, [rows, columns, participantStalls, utilityStalls]);



  const handleCreateStalls = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Delete existing stalls from Firestore
      const existingStalls = await getDocs(collection(db, 'stalls'));
      const deletePromises = existingStalls.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
  
      // Create new stalls
      const total = rows * columns;
      const participants = participantStalls;
      const initialStalls: Omit<Stall, 'id'>[] = [];
  
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const stallNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
          const stallIndex = row * columns + col;
  
          initialStalls.push({
            row,
            column: col,
            stallNumber,
            type: stallIndex < participants ? 'participant' : 'utility',
            createdAt: new Date(),
            updatedAt: new Date()
          });
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
  
      // Update statistics
      const participantCount = stallsWithIds.filter(s => s.type === 'participant').length;
      const utilityCount = stallsWithIds.filter(s => s.type === 'utility').length;
  
      console.log("participantCount", participantCount);
      console.log("utilityCount", utilityCount);
      console.log("stallsWithIds", stallsWithIds);
  
      setStats({
        total: stallsWithIds.length,
        participant: participantCount,
        utility: utilityCount
      });
  
    } catch (err) {
      console.error('Error creating stalls:', err);
      setError('Failed to create stalls');
    } finally {
      setLoading(false);
    }
  };
  
  console.log("stats", stats);
  console.log("stalls", stalls);

  const getStallAtPosition = (row: number, column: number): Stall | undefined => {
    return stalls.find(stall => stall.row === row && stall.column === column);
  };

  const getStallColor = (stall: Stall): string => {
    switch (stall.type) {
      case 'participant': return 'bg-blue-500';
      case 'utility': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const getStallIcon = (stall: Stall) => {
    if (stall.type === 'utility') return <Settings className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  const handleStallClick = (stall: Stall) => {
    setSelectedStall(stall);
    setEditingStall(null);
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

  const handleSaveStall = async () => {
    if (!editingStall) return;

    try {
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

      const updatedStall = {
        ...editingStall,
        images: imageUrls,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'stalls', editingStall.id), updatedStall);
      
      setStalls(prev => prev.map(stall => 
        stall.id === editingStall.id ? updatedStall : stall
      ));
      
      setEditingStall(null);
      setSelectedImages([]);
    } catch (err) {
      setError('Failed to update stall');
      console.error('Error updating stall:', err);
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
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column:</label>
              <input
                type="number"
                min="0"
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Participants Stalls:</label>
          <input
            type="number"
            min="0"
            max={totalStalls}
            value={participantStalls}
            onChange={(e) => {
              setLastEdited("participant");
              setParticipantStalls(Math.min(parseInt(e.target.value) || 0, totalStalls));
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
            
          
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Utility Stalls:</label>
          <input
            type="number"
            min="0"
            max={totalStalls}
            value={utilityStalls}
            onChange={(e) => {
              setLastEdited("utility");
              setUtilityStalls(Math.min(parseInt(e.target.value) || 0, totalStalls));
            }}
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
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Participant Stall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Utility Stall</span>
            </div>
          </div>
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
                  <input
                    type="text"
                    value={editingStall.location?.state || ''}
                    onChange={(e) => setEditingStall({ 
                      ...editingStall, 
                      location: { 
                        state: e.target.value,
                        district: editingStall.location?.district || '',
                        block: editingStall.location?.block || ''
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={editingStall.location?.district || ''}
                    onChange={(e) => setEditingStall({ 
                      ...editingStall, 
                      location: { 
                        state: editingStall.location?.state || '',
                        district: e.target.value,
                        block: editingStall.location?.block || ''
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Enter district"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                  <input
                    type="text"
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
                    placeholder="Enter block"
                  />
                </div>

                <div>
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};
