import React, { useState, useEffect } from 'react';
import { Users, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

      {/* Header boxes */}
    

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