'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useCallback, useEffect } from 'react';
import ModuleDetail from './ModuleDetail';

interface ModuleData {
  moduleNumber: number;
  status: 'buyer' | 'other' | 'empty';
  buyerOrderIds: string[];
}

interface FacilityMapProps {
  orderId?: string;
}

export default function FacilityMap({ orderId }: FacilityMapProps) {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const { data: snapshot, isLoading } = useQuery<{ modules: ModuleData[] }>({
    queryKey: ['map-snapshot', orderId],
    queryFn: async () => {
      const url = orderId
        ? `/api/map/snapshot?orderId=${orderId}`
        : '/api/map/snapshot';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load map');
      return res.json();
    },
    refetchInterval: 60_000, // 60 seconds
  });

  const cellSize = 6;
  const gap = 1;
  const cols = 100;
  const rows = 100;
  const svgWidth = cols * (cellSize + gap);
  const svgHeight = rows * (cellSize + gap);

  const getColor = (status: string) => {
    switch (status) {
      case 'buyer': return '#60A5FA';
      case 'other': return '#34D399';
      case 'empty': return '#1E2538';
      default: return '#1E2538';
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(5, prev.scale * scaleFactor)),
      }));
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#111827]/50 rounded-xl">
        <div className="animate-spin w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Generate module data or use placeholder
  const modules: ModuleData[] = snapshot?.modules || Array.from({ length: 10000 }, (_, i) => ({
    moduleNumber: i + 1,
    status: 'empty' as const,
    buyerOrderIds: [],
  }));

  return (
    <div>
      {/* Map controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
            <span className="text-slate-500">Your plants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-slate-500">Other orders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#1E2538]" />
            <span className="text-slate-500">Empty</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            className="text-xs text-slate-500 hover:text-slate-300 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] transition-colors"
          >
            Reset View
          </button>
          <span className="text-xs text-slate-600">{Math.round(transform.scale * 100)}%</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-[#0A0D14] border border-white/[0.04]"
        style={{ height: 400, cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'center center',
            transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
          }}
          className="w-full h-full"
        >
          {modules.map((mod) => {
            const idx = mod.moduleNumber - 1;
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const x = col * (cellSize + gap);
            const y = row * (cellSize + gap);

            return (
              <rect
                key={mod.moduleNumber}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={getColor(mod.status)}
                rx={1}
                className="cursor-pointer hover:brightness-150 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule(mod.moduleNumber);
                }}
              >
                <title>Module {mod.moduleNumber}</title>
              </rect>
            );
          })}
        </svg>
      </div>

      {/* Module detail panel */}
      {selectedModule && (
        <div className="mt-4 fade-in">
          <ModuleDetail
            moduleNumber={selectedModule}
            orderId={orderId}
            onClose={() => setSelectedModule(null)}
          />
        </div>
      )}
    </div>
  );
}
