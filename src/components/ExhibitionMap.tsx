import React, { useState, useEffect } from 'react';
import { Users, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getExhibitionLayout, type Stall } from '../services/exhibitionService';
import { categories as PRODUCT_CATEGORIES } from '../services/productService';
import { Shirt, Palette, Leaf, UtensilsCrossed, Sofa, Scissors, Briefcase, Gem } from 'lucide-react';

interface ExhibitionMapProps {
  compact?: boolean; // For navbar display
  showStats?: boolean;
  onStallClick?: (stall: Stall) => void;
}

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

export const ExhibitionMap: React.FC<ExhibitionMapProps> = ({ 
  compact = false, 
  showStats = false,
  onStallClick 
}) => {
  const [layout, setLayout] = useState<{
    rows: number;
    columns: number;
    stalls: Stall[];
    stats: { total: number; participant: number; utility: number };
  }>({ rows: 0, columns: 0, stalls: [], stats: { total: 0, participant: 0, utility: 0 } });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const layoutData = await getExhibitionLayout();
        setLayout(layoutData);
      } catch (error) {
        console.error('Error fetching exhibition layout:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, []);

  const getStallAtPosition = (row: number, column: number): Stall | undefined => {
    return layout.stalls.find(stall => stall.row === row && stall.column === column);
  };

  const getStallColor = (stall: Stall): string => {
    if (!stall || !stall.type) return 'bg-gray-400';
    switch (stall.type) {
      case 'participant':
        return stall.category && CATEGORY_COLORS[stall.category]
          ? CATEGORY_COLORS[stall.category]
          : 'bg-blue-500';
      case 'utility':
        return 'bg-purple-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getStallIcon = (stall: Stall) => {
    if (stall && stall.type === 'participant' && stall.category && CATEGORY_ICONS[stall.category]) {
      const Icon = CATEGORY_ICONS[stall.category];
      return <Icon className="w-5 h-5 mb-1" />;
    }
   
    return null;
  };

  // Get unique blocks from stalls
  const uniqueBlocks = Array.from(new Set(layout.stalls.map(s => s.location?.block).filter(Boolean)));

  // Helper to check if a stall matches the filter
  const isFiltered = (stall: Stall | undefined) => {
    if (!stall) return false;
    let match = true;
    if (selectedCategory) match = match && stall.category === selectedCategory;
    if (selectedBlock) match = match && stall.location?.block === selectedBlock;
    return match;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-500">Loading exhibition map...</div>
      </div>
    );
  }

  if (layout.rows === 0 || layout.columns === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-500">No exhibition layout configured</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics - Only show if requested */}
      {showStats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center w-full">
              <div className="font-bold text-navy-600 text-base md:text-xl">{layout.stats.total}</div>
              <div className="text-gray-600 text-xs md:text-base">Total Stalls</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center w-full">
              <div className="font-bold text-blue-600 text-base md:text-xl">{layout.stats.participant}</div>
              <div className="text-gray-600 text-xs md:text-base">Participant</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center w-full">
              <div className="font-bold text-purple-600 text-base md:text-xl">{layout.stats.utility}</div>
              <div className="text-gray-600 text-xs md:text-base">Utility</div>
            </div>
            <div className="flex justify-center w-full">
              <button
                onClick={() => navigate('/stalls')}
                className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors flex items-center w-fit justify-center gap-2 px-4 py-2"
              >
                <span className="text-sm md:text-base">Click on me</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Filters and Search */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={selectedBlock}
          onChange={e => setSelectedBlock(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Cities</option>
          {uniqueBlocks.map(block => (
            <option key={block} value={block}>{block}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSelectedCategory('');
            setSelectedBlock('');
          }}
          className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Exhibition Map Grid */}
      <div className={`overflow-auto max-w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 ${compact ? 'max-h-32 sm:max-h-48' : 'max-h-96 sm:max-h-[32rem] md:max-h-[40rem]'}`}>
        <div className="inline-block min-w-full">
          {/* Column Headers */}
          <div className="flex" style={{ minWidth: compact ? `${(layout.columns + 1) * 32}px` : `${(layout.columns + 1) * 64}px` }}>
            <div className={`${compact ? 'w-6 h-6' : 'w-12 h-8'} flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0`}></div>
            {Array.from({ length: layout.columns }, (_, col) => (
              <div key={col} className={`${compact ? 'w-8 h-6' : 'w-16 h-8'} flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0`}>
                {col + 1}
              </div>
            ))}
          </div>

          {/* Stall Grid */}
          {Array.from({ length: layout.rows }, (_, row) => (
            <div key={row} className="flex">
              <div className="w-12 h-16 flex items-center justify-center text-xs font-medium text-gray-500">
                {String.fromCharCode(65 + row)}
              </div>
              {Array.from({ length: layout.columns }, (_, col) => {
                const stall = getStallAtPosition(row, col);
                const stallNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
                // Only show the stall if it matches the filter
                const matches = stall && isFiltered(stall);
                if (!stall || !matches) {
                  // Render gray/empty box if no stall or doesn't match filter
                  return (
                    <div
                      key={col}
                      className="w-16 h-16 border border-gray-300 flex flex-col items-center justify-center bg-gray-400 text-white opacity-40 cursor-default"
                    >
                      <div className="text-xs font-medium">{stallNumber}</div>
                    </div>
                  );
                }
                return (
                  <div
                    key={col}
                    className={`w-16 h-16 border border-gray-300 cursor-pointer flex flex-col items-center justify-center ${getStallColor(stall)} text-white hover:opacity-80 transition-opacity`}
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
   
    </div>
  );
}; 