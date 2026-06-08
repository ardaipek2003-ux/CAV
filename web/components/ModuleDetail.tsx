'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

interface Spot {
  id: string;
  rowNumber: number;
  spotNumber: number;
  status: string;
  cropType: string | null;
  orderId: string | null;
  daysRemaining: number | null;
}

interface ModuleDetailProps {
  moduleNumber: number;
  orderId?: string;
  onClose: () => void;
}

export default function ModuleDetail({ moduleNumber, orderId, onClose }: ModuleDetailProps) {
  const { data: spots, isLoading, error } = useQuery<Spot[]>({
    queryKey: ['module-detail', moduleNumber],
    queryFn: async () => {
      const res = await fetch(`/api/map/module/${moduleNumber}`);
      if (!res.ok) throw new Error('Failed to fetch module details');
      return res.json();
    },
  });

  const [hoveredSpot, setHoveredSpot] = useState<Spot | null>(null);

  // Group spots into a 5x9 grid (row: 1-5, col: 1-9)
  const grid = useMemo(() => {
    const gridData: (Spot | null)[][] = Array(5).fill(null).map(() => Array(9).fill(null));
    if (spots) {
      spots.forEach((spot) => {
        // rowNumber and spotNumber are 1-indexed
        if (spot.rowNumber >= 1 && spot.rowNumber <= 5 && spot.spotNumber >= 1 && spot.spotNumber <= 9) {
          gridData[spot.rowNumber - 1][spot.spotNumber - 1] = spot;
        }
      });
    }
    return gridData;
  }, [spots]);

  return (
    <div className="bento-card p-8 border border-gray-800/50 bg-gray-900/80 shadow-2xl relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-[#00E59B]">📦</span> Module {moduleNumber} Layout
          </h3>
          <p className="text-sm text-gray-400 mt-1">Live physical map of crop slots (5 rows x 9 spots)</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-all"
        >
          ✕
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-[#00E59B] border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center p-8 border border-red-500/20 rounded-xl bg-red-500/5">
          Failed to load module layout.
        </div>
      )}

      {spots && (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Visual Grid */}
          <div className="flex-1">
            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800/60 inline-block w-full overflow-x-auto">
              <div className="min-w-max">
                <div className="flex flex-col gap-2">
                  {grid.map((row, rIndex) => (
                    <div key={`row-${rIndex}`} className="flex gap-2 items-center">
                      <div className="w-6 text-xs text-gray-500 font-mono font-medium text-right pr-2 select-none">
                        R{rIndex + 1}
                      </div>
                      {row.map((spot, sIndex) => {
                        if (!spot) {
                          // Placeholder if no spot data exists for some reason
                          return <div key={`empty-${rIndex}-${sIndex}`} className="w-10 h-10 rounded border border-dashed border-gray-800" />;
                        }

                        const isUserOrder = orderId && spot.orderId === orderId;
                        const isEmpty = spot.status === 'EMPTY';
                        
                        let bgClass = "bg-gray-800/30 border-gray-700/50";
                        if (!isEmpty) {
                          bgClass = isUserOrder 
                            ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-blue-400" 
                            : "bg-[#00E59B] shadow-[0_0_10px_rgba(0,229,155,0.3)] border-[#00ffaa]";
                        }

                        return (
                          <div
                            key={spot.id}
                            onMouseEnter={() => setHoveredSpot(spot)}
                            onMouseLeave={() => setHoveredSpot(null)}
                            className={`w-10 h-10 rounded-md border-2 transition-all cursor-pointer relative group flex items-center justify-center ${bgClass} hover:scale-110 hover:z-10`}
                          >
                            {!isEmpty && (
                              <span className="text-xs">{spot.cropType === 'LETTUCE' ? '🥬' : '🍅'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  
                  {/* Column Headers */}
                  <div className="flex gap-2 items-center mt-1 ml-6">
                    {Array.from({length: 9}).map((_, i) => (
                      <div key={`col-${i}`} className="w-10 text-center text-xs text-gray-500 font-mono select-none">
                        S{i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 justify-center md:justify-start px-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-400 bg-blue-500" />
                <span className="text-xs text-gray-400">Your Plants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-[#00ffaa] bg-[#00E59B]" />
                <span className="text-xs text-gray-400">Other Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-700/50 bg-gray-800/30" />
                <span className="text-xs text-gray-400">Empty Spot</span>
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-64 flex flex-col gap-4">
            <div className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-2">
              Spot Inspector
            </div>
            {hoveredSpot ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {hoveredSpot.status === 'EMPTY' ? '⬛' : hoveredSpot.cropType === 'LETTUCE' ? '🥬' : '🍅'}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white">
                      Row {hoveredSpot.rowNumber}, Spot {hoveredSpot.spotNumber}
                    </div>
                    <div className="text-sm text-gray-400 capitalize">
                      {hoveredSpot.status === 'EMPTY' ? 'Empty' : hoveredSpot.cropType?.toLowerCase()}
                    </div>
                  </div>
                </div>
                
                {hoveredSpot.status !== 'EMPTY' && (
                  <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="font-medium text-white mb-3 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${hoveredSpot.status === 'GROWING' ? 'bg-[#00E59B]' : 'bg-blue-500'}`} />
                      {hoveredSpot.status}
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-1">Estimated Harvest In</div>
                    <div className="font-bold text-2xl text-[#00E59B]">
                      {hoveredSpot.daysRemaining} <span className="text-sm font-normal text-gray-400">days</span>
                    </div>

                    {orderId && hoveredSpot.orderId === orderId && (
                      <div className="mt-4 text-xs font-semibold text-blue-400 bg-blue-500/10 py-1.5 px-3 rounded-lg border border-blue-500/20 text-center uppercase tracking-wider">
                        Part of your order
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 p-6 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                <p className="text-sm">Hover over any spot on the map to view detailed analytics.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
