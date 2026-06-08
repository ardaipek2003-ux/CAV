'use client';

import dynamic from 'next/dynamic';

const FacilityMap = dynamic(() => import('@/components/FacilityMap'), { ssr: false });

export default function MapPage() {
  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Facility Map</h1>
        <p className="text-gray-400 mt-1">
          Live view of all 10,000 modules across the facility
        </p>
      </div>
      <div className="bento-card p-6">
        <FacilityMap />
      </div>
    </div>
  );
}
