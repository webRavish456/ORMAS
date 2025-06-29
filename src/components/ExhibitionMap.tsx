import React, { useState, useEffect } from 'react';
import { Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getExhibitionLayout, type Stall } from '../services/exhibitionService';

interface ExhibitionMapProps {
  compact?: boolean; // For navbar display
  showStats?: boolean;
  onStallClick?: (stall: Stall) => void;
}

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
    switch (stall.type) {
      case 'participant': return compact ? 'bg-blue-500' : 'bg-blue-500 hover:bg-blue-600';
      case 'utility': return compact ? 'bg-purple-500' : 'bg-purple-500 hover:bg-purple-600';
      default: return compact ? 'bg-blue-500' : 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getStallIcon = (stall: Stall) => {
    if (stall.type === 'utility') return <Settings className={compact ? "w-2 h-2" : "w-4 h-4"} />;
    return <Users className={compact ? "w-2 h-2" : "w-4 h-4"} />;
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
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-navy-600">{layout.stats.total}</div>
            <div className="text-sm text-gray-600">Total Stalls</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{layout.stats.participant}</div>
            <div className="text-sm text-gray-600">Participant</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{layout.stats.utility}</div>
            <div className="text-sm text-gray-600">Utility</div>
          </div>
        </div>
      )}

      {/* Header boxes */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Link 
          to="/participant-stalls"
          className={`px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded text-center ${compact ? 'text-xs' : 'text-sm'} hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer`}
        >
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            Participant stalls ({layout.stats.participant})
          </span>
        </Link>
        <Link 
          to="/utility-stalls"
          className={`px-2 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded text-center ${compact ? 'text-xs' : 'text-sm'} hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer`}
        >
          <span className="text-orange-700 dark:text-orange-300 font-medium">
            Utility stalls ({layout.stats.utility})
          </span>
        </Link>
      </div>

      {/* Exhibition Map Grid */}
      <div className={`overflow-auto max-w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 ${compact ? 'max-h-32 sm:max-h-48' : 'max-h-48 sm:max-h-64 md:max-h-80'}`}>
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
            <div key={row} className="flex" style={{ minWidth: compact ? `${(layout.columns + 1) * 32}px` : `${(layout.columns + 1) * 64}px` }}>
              {/* Row Header */}
              <div className={`${compact ? 'w-6 h-8' : 'w-12 h-16'} flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0`}>
                {String.fromCharCode(65 + row)}
              </div>
              
              {/* Stalls */}
              {Array.from({ length: layout.columns }, (_, col) => {
                const stall = getStallAtPosition(row, col);
                if (!stall) {
                  return (
                    <div 
                      key={col} 
                      className={`${compact ? 'w-8 h-8' : 'w-16 h-16'} border border-gray-200 dark:border-gray-700 flex-shrink-0`} 
                    />
                  );
                }

                return (
                  <div
                    key={col}
                    onClick={() => onStallClick?.(stall)}
                    className={`
                      ${compact ? 'w-8 h-8' : 'w-16 h-16'} 
                      border border-gray-300 dark:border-gray-600 cursor-pointer
                      flex flex-col items-center justify-center
                      ${getStallColor(stall)} text-white
                      transition-all duration-200
                      ${!compact && 'hover:scale-105 hover:shadow-lg'}
                      flex-shrink-0
                    `}
                    title={`${stall.stallNumber} - ${stall.type} stall${stall.name ? ` (${stall.name})` : ''}`}
                  >
                    <div className={`${compact ? 'text-xs' : 'text-xs'} font-medium`}>
                      {stall.stallNumber}
                    </div>
                    {!compact && getStallIcon(stall)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
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
  );
}; 