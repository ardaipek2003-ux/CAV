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
    <div className="bento-card p-8 border border-white/[0.05] shadow-2xl relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
            Module {moduleNumber} Layout
          </h3>
          <p className="text-xs text-slate-500 mt-1">Physical map of crop slots (5 rows × 9 spots)</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] p-2 rounded-lg transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center p-8 border border-red-500/[0.1] rounded-xl bg-red-500/[0.03] text-sm">
          Failed to load module layout.
        </div>
      )}

      {spots && (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Visual Grid */}
          <div className="flex-1">
            <div className="bg-[#0A0D14] p-6 rounded-2xl border border-white/[0.04] inline-block w-full overflow-x-auto">
              <div className="min-w-max">
                <div className="flex flex-col gap-2">
                  {grid.map((row, rIndex) => (
                    <div key={`row-${rIndex}`} className="flex gap-2 items-center">
                      <div className="w-6 text-xs text-slate-600 font-mono font-medium text-right pr-2 select-none">
                        R{rIndex + 1}
                      </div>
                      {row.map((spot, sIndex) => {
                        if (!spot) {
                          // Placeholder if no spot data exists for some reason
                          return <div key={`empty-${rIndex}-${sIndex}`} className="w-10 h-10 rounded border border-dashed border-white/[0.06]" />;
                        }

                        const isUserOrder = orderId && spot.orderId === orderId;
                        const isEmpty = spot.status === 'EMPTY';
                        
                        let bgClass = "bg-white/[0.03] border-white/[0.06]";
                        if (!isEmpty) {
                          bgClass = isUserOrder 
                            ? "bg-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.4)] border-blue-400" 
                            : "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.25)] border-emerald-400";
                        }

                        return (
                          <div
                            key={spot.id}
                            onMouseEnter={() => setHoveredSpot(spot)}
                            onMouseLeave={() => setHoveredSpot(null)}
                            className={`w-10 h-10 rounded-md border transition-all cursor-pointer relative group flex items-center justify-center ${bgClass} hover:scale-110 hover:z-10`}
                          >
                            {!isEmpty && (
                              <span className="text-[10px] font-mono text-white/80">{spot.cropType === 'LETTUCE' ? 'L' : 'T'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  
                  {/* Column Headers */}
                  <div className="flex gap-2 items-center mt-1 ml-6">
                    {Array.from({length: 9}).map((_, i) => (
                      <div key={`col-${i}`} className="w-10 text-center text-xs text-slate-600 font-mono select-none">
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
                <div className="w-3.5 h-3.5 rounded border border-blue-400 bg-blue-500" />
                <span className="text-xs text-slate-500">Your Plants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded border border-emerald-400 bg-emerald-500" />
                <span className="text-xs text-slate-500">Other Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded border border-white/[0.06] bg-white/[0.03]" />
                <span className="text-xs text-slate-500">Empty Spot</span>
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-64 flex flex-col gap-4">
            <div className="text-xs font-semibold text-slate-400 border-b border-white/[0.04] pb-2 uppercase tracking-wider">
              Spot Inspector
            </div>
            {hoveredSpot ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {hoveredSpot.status === 'EMPTY' ? (
                      <div className="w-8 h-8 rounded bg-white/[0.04] border border-white/[0.06]" />
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={hoveredSpot.cropType === 'LETTUCE' ? '#34D399' : '#F87171'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/></svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-base text-slate-200">
                      Row {hoveredSpot.rowNumber}, Spot {hoveredSpot.spotNumber}
                    </div>
                    <div className="text-sm text-slate-500 capitalize">
                      {hoveredSpot.status === 'EMPTY' ? 'Empty' : hoveredSpot.cropType?.toLowerCase()}
                    </div>
                  </div>
                </div>
                
                {hoveredSpot.status !== 'EMPTY' && (
                  <div className="bg-[#111827] p-4 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</div>
                    <div className="font-medium text-slate-200 mb-3 flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${hoveredSpot.status === 'GROWING' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                      {hoveredSpot.status}
                    </div>
                    
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Estimated Harvest In</div>
                    <div className="font-bold text-xl text-emerald-400">
                      {hoveredSpot.daysRemaining} <span className="text-sm font-normal text-slate-500">days</span>
                    </div>

                    {orderId && hoveredSpot.orderId === orderId && (
                      <div className="mt-4 text-[10px] font-semibold text-blue-400 bg-blue-500/[0.06] py-1.5 px-3 rounded-lg border border-blue-500/[0.1] text-center uppercase tracking-wider">
                        Part of your order
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 p-6 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p className="text-xs">Hover over any spot to inspect.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
