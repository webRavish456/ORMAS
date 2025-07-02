import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Settings,
  MapPin,
  Package,
  Image
} from 'lucide-react';
import * as XLSX from 'xlsx';

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

export const UtilityStalls = () => {
  const [utilityStalls, setUtilityStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    fetchUtilityStalls();
  }, []);

  const fetchUtilityStalls = async () => {
    try {
      setLoading(true);
      const stallsSnapshot = await getDocs(collection(db, 'stalls'));
      const stalls = stallsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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

  const handleEditStall = (stall: Stall) => {
    setEditingStall({ ...stall });
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
      let imageUrls = editingStall.images || [];

      // Convert selected images to base64 if new images are selected
      if (selectedImages.length > 0) {
        const imagePromises = selectedImages.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
        });
        imageUrls = await Promise.all(imagePromises);
      }

      const updatedStall = {
        ...editingStall,
        images: imageUrls,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'stalls', editingStall.id), updatedStall);
      
      setUtilityStalls(prev => prev.map(stall => 
        stall.id === editingStall.id ? updatedStall : stall
      ));
      
      setEditingStall(null);
      setSelectedImages([]);
    } catch (err) {
      setError('Failed to update stall');
      console.error('Error updating stall:', err);
    }
  };

  const handleDeleteStall = async (stallId: string) => {
    if (window.confirm('Are you sure you want to delete this utility stall?')) {
      try {
        await deleteDoc(doc(db, 'stalls', stallId));
        setUtilityStalls(prev => prev.filter(stall => stall.id !== stallId));
      } catch (err) {
        setError('Failed to delete stall');
        console.error('Error deleting stall:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingStall(null);
    setSelectedImages([]);
  };

  const extractStallNumber = (stallNumber: string): number => {
    // Extract the letter and number from stall number (e.g., A1, B1, etc.)
    const match = stallNumber.match(/^([A-Z])(\d+)$/);
    if (match) {
      const letter = match[1];
      const columnNumber = parseInt(match[2]);
      // Calculate the sequential number based on letter (row) and column
      const rowValue = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
      // We need to determine the column count from the stall data
      // For now, we'll use a reasonable default or calculate from existing stalls
      const maxColumn = Math.max(...utilityStalls.map(s => {
        const colMatch = s.stallNumber.match(/^[A-Z](\d+)$/);
        return colMatch ? parseInt(colMatch[1]) : 0;
      }));
      const columnsPerRow = maxColumn || 10; // Default to 10 if no data
      return rowValue * columnsPerRow + columnNumber;
    }
    return 0;
  };

  const exportToExcel = () => {
    // Prepare data for export
    const data = utilityStalls.map(stall => ({
      'Stall No': stall.stallNumber,
      'Name': stall.name || '',
      'Description': stall.description || '',
      'Created At': typeof stall.createdAt === 'string' ? stall.createdAt : stall.createdAt?.toISOString?.() || '',
      'Updated At': typeof stall.updatedAt === 'string' ? stall.updatedAt : stall.updatedAt?.toISOString?.() || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UtilityStalls');
    XLSX.writeFile(wb, 'utility_stalls.xlsx');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading utility stalls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-navy-800">Utility Stalls</h2>
        <div className="text-sm text-gray-600">
          Total: {utilityStalls.length} stalls
        </div>
        <button
          onClick={exportToExcel}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          Export to Excel
        </button>
      </div>

      {/* Utility Stalls Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stall No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stall Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {utilityStalls.map((stall) => (
                <tr key={stall.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {extractStallNumber(stall.stallNumber)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stall.stallNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {stall.name || 'Unnamed Utility'}
                        </div>
                        {stall.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {stall.description.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {stall.description ? (
                      <div className="text-sm text-gray-900">
                        {stall.description.length > 100 
                          ? `${stall.description.substring(0, 100)}...` 
                          : stall.description
                        }
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No description</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stall.images && stall.images.length > 0 ? (
                      <div className="flex items-center">
                        <Image className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {stall.images.length} images
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No images</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditStall(stall)}
                        className="text-navy-600 hover:text-navy-900"
                        title="Edit stall"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStall(stall.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete stall"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Utility Stall - {editingStall.stallNumber}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveStall}
                  className="text-green-600 hover:text-green-700"
                  title="Save changes"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-600 hover:text-gray-700"
                  title="Cancel"
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
                  placeholder="Enter utility stall name"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea
                  value={editingStall.description || ''}
                  onChange={(e) => setEditingStall({ ...editingStall, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={3}
                  placeholder="Enter short description (e.g., banks, fire equipments, etc.)"
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
                    <p className="text-sm text-gray-600 mb-2">New Images ({selectedImages.length}):</p>
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
                {editingStall.images && editingStall.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Existing Images ({editingStall.images.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {editingStall.images.map((img, index) => (
                        <img key={index} src={img} alt={`Existing ${index}`} className="w-20 h-20 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
