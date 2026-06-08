'use client';

import { useQuery } from '@tanstack/react-query';

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

  return (
    <div className="bento-card p-6 border border-gray-800/50 bg-gray-900/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Module {moduleNumber} Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          ✕
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center p-4">
          Failed to load module data.
        </div>
      )}

      {spots && spots.length === 0 && (
        <div className="text-gray-400 text-center p-4">
          This module is currently completely empty.
        </div>
      )}

      {spots && spots.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {spots.map((spot) => {
            const isUserOrder = orderId && spot.orderId === orderId;
            return (
              <div
                key={spot.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isUserOrder
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-gray-800/50 border-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-900 rounded-md font-mono text-sm border border-gray-700">
                    <span className="text-gray-500 text-[10px]">R{spot.rowNumber}</span>
                    <span>S{spot.spotNumber}</span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {spot.status === 'EMPTY' ? 'Empty Spot' : spot.cropType}
                    </div>
                    {spot.status !== 'EMPTY' && (
                      <div className="text-xs text-gray-400 mt-1">
                        {spot.status}
                        {isUserOrder && ' • Your order'}
                      </div>
                    )}
                  </div>
                </div>
                {spot.daysRemaining !== null && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {spot.daysRemaining}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      Days Left
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
