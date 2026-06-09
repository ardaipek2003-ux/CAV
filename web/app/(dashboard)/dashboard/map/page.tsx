'use client';

import dynamic from 'next/dynamic';

const FacilityMap = dynamic(() => import('@/components/FacilityMap'), { ssr: false });

export default function MapPage() {
  return (
    <div className="fade-in space-y-6">
      <div className="pt-2">
        <p className="label mb-1" style={{ color: '#8A8A8A' }}>Facility</p>
        <h1 className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 700 }}>
          Live Map
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8A8A8A' }}>
          Real-time view of all 10,000 modules — scroll to zoom, drag to pan
        </p>
      </div>
      <div className="card-flat p-6">
        <FacilityMap />
      </div>
    </div>
  );
}
