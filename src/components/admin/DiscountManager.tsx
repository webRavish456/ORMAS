import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { useExhibition } from '../../contexts/ExhibitionContext';
import ExhibitionSelector from '../common/ExhibitionSelector';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface Discount {
  id: string;
  category: string;
  percentage: number;
  code: string;
  stallRange: string;
}

const CATEGORIES = [
  'Handloom',
  'Handicraft',
  'Minor Forest Products (MFP)',
  'Food & Spices',
  'Home Furnishing',
  'Woolen Knit Wear',
  'Leather Products',
  'Jewellery'
];

export const DiscountManager = () => {
  const { selectedExhibition } = useExhibition();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDiscount, setNewDiscount] = useState({
    category: '',
    percentage: '',
    stallRange: ''
  });

  const [editForm, setEditForm] = useState({
    category: '',
    percentage: '',
    stallRange: ''
  });

  useEffect(() => {
    fetchDiscounts();
  }, [selectedExhibition]);

  const fetchDiscounts = async () => {
    const snapshot = await getDocs(collection(db, `exhibitions/${selectedExhibition}/discounts`));
    setDiscounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Discount[]);
  };

  const validateStallRange = (range: string) => {
    const rangeFormat = /^\d+-\d+$/;
    const commaFormat = /^\d+(,\d+)*$/;
    return rangeFormat.test(range) || commaFormat.test(range);
  };

  const generateDiscountCode = (percentage: number) => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORMAS-${random}-${percentage}`;
  };

  const handleAdd = async () => {
    if (
      newDiscount.category &&
      newDiscount.percentage &&
      newDiscount.stallRange &&
      validateStallRange(newDiscount.stallRange)
    ) {
      const percentage = Number(newDiscount.percentage);
      const code = generateDiscountCode(percentage);
      const docRef = await addDoc(collection(db, `exhibitions/${selectedExhibition}/discounts`), {
        category: newDiscount.category,
        percentage,
        code,
        stallRange: newDiscount.stallRange
      });
      setDiscounts([...discounts, {
        id: docRef.id,
        category: newDiscount.category,
        percentage,
        code,
        stallRange: newDiscount.stallRange
      }]);
      setNewDiscount({ category: '', percentage: '', stallRange: '' });
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingId(discount.id);
    setEditForm({
      category: discount.category,
      percentage: discount.percentage.toString(),
      stallRange: discount.stallRange
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (
      editForm.category &&
      editForm.percentage &&
      editForm.stallRange &&
      validateStallRange(editForm.stallRange)
    ) {
      const percentage = Number(editForm.percentage);
      const code = generateDiscountCode(percentage);
      await updateDoc(doc(db, `exhibitions/${selectedExhibition}/discounts`, id), {
        category: editForm.category,
        percentage,
        code,
        stallRange: editForm.stallRange
      });
      setDiscounts(discounts.map(discount =>
        discount.id === id ? {
          ...discount,
          category: editForm.category,
          percentage,
          code,
          stallRange: editForm.stallRange
        } : discount
      ));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, `exhibitions/${selectedExhibition}/discounts`, id));
    setDiscounts(discounts.filter(discount => discount.id !== id));
  };

  return (
    <div>
      <ExhibitionSelector />
      <h2 className="text-xl font-semibold mb-4">Manage Discounts</h2>
      
      <div className="grid gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={newDiscount.category}
            onChange={(e) => setNewDiscount({ ...newDiscount, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
          <input
            type="number"
            min="1"
            max="100"
            placeholder="Enter percentage (1-100)"
            value={newDiscount.percentage}
            onChange={(e) => setNewDiscount({ ...newDiscount, percentage: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stall Range</label>
          <input
            type="text"
            placeholder="Format: 1-10 or 1,3,5,7"
            value={newDiscount.stallRange}
            onChange={(e) => setNewDiscount({ ...newDiscount, stallRange: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter either a range (e.g., 1-10) or specific stalls (e.g., 1,3,5,7)
          </p>
        </div>

        <button
          onClick={handleAdd}
          disabled={!validateStallRange(newDiscount.stallRange)}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Discount
        </button>
      </div>

      <div className="grid gap-4">
        {discounts.map(discount => (
          <div key={discount.id} className="flex items-start justify-between p-4 border rounded-lg">
            {editingId === discount.id ? (
              <div className="flex-1 grid gap-4">
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.percentage}
                  onChange={(e) => setEditForm({ ...editForm, percentage: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Percentage"
                />
                <input
                  type="text"
                  value={editForm.stallRange}
                  onChange={(e) => setEditForm({ ...editForm, stallRange: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Stall range"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(discount.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    disabled={!validateStallRange(editForm.stallRange)}
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold">{discount.category}</h3>
                    <span className="text-green-600">{discount.percentage}% OFF</span>
                  </div>
                  <p className="text-gray-600">Code: {discount.code}</p>
                  <p className="text-sm text-gray-500">Stalls: {discount.stallRange}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(discount)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(discount.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
