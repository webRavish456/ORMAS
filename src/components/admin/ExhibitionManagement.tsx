import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

interface Exhibition {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export const ExhibitionManagement = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'exhibitions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const exhibitionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Exhibition));
      
      
      setExhibitions(exhibitionData);
    } catch (err) {
      console.error('Error fetching exhibitions:', err);
      setError('Failed to fetch exhibitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    // Check if name already exists (case insensitive)
    const existingExhibition = exhibitions.find(
      ex => ex.name.toLowerCase() === formData.name.toLowerCase() && ex.id !== editingId
    );
    
    if (existingExhibition) {
      setError('An exhibition with this name already exists');
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Update existing exhibition
        const exhibitionRef = doc(db, 'exhibitions', editingId);
        await updateDoc(exhibitionRef, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          updatedAt: new Date()
        });
      } else {
        // Add new exhibition
        await addDoc(collection(db, 'exhibitions'), {
          name: formData.name.trim(),
          description: formData.description.trim(),
          createdAt: new Date()
        });
      }
      
      resetForm();
      fetchExhibitions();
    } catch (err) {
      console.error('Error saving exhibition:', err);
      setError('Failed to save exhibition');
    }
  };

  const handleEdit = (exhibition: Exhibition) => {
    setFormData({
      name: exhibition.name,
      description: exhibition.description || ''
    });
    setEditingId(exhibition.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exhibition?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'exhibitions', id));
      fetchExhibitions();
    } catch (err) {
      console.error('Error deleting exhibition:', err);
      setError('Failed to delete exhibition');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Exhibition Management
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Exhibition
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-6 border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-medium mb-4">
            {editingId ? 'Edit Exhibition' : 'Add New Exhibition'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exhibition Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder="e.g., ORMAS, General Exhibition"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder="Brief description of the exhibition"
                rows={3}
              />
            </div>
            

            
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Save'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exhibitions List */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            All Exhibitions ({exhibitions.length})
          </h3>
        </div>
        
        {exhibitions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No exhibitions found. Add your first exhibition above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {exhibitions.map((exhibition) => (
              <div key={exhibition.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                                         <div className="flex items-center gap-3 mb-2">
                       <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                         {exhibition.name}
                       </h4>
                     </div>
                    
                                         <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                       {exhibition.description && (
                         <p><span className="font-medium">Description:</span> {exhibition.description}</p>
                       )}
                       <p><span className="font-medium">Created:</span> {exhibition.createdAt.toLocaleDateString()}</p>
                     </div>
                  </div>
                  
                                     <div className="flex items-center gap-2">
                     <button
                       onClick={() => handleEdit(exhibition)}
                       className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                     
                     <button
                       onClick={() => handleDelete(exhibition.id)}
                       className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 