'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminStats {
  totalSpots: number;
  occupiedSpots: number;
  occupancyRate: number;
  pendingRobotJobs: number;
  activeOrders: number;
  orders: Array<{
    id: string;
    cropType: string;
    quantityKg: number;
    status: string;
    quotedHarvest: string | null;
    buyerName: string;
  }>;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirmId, setShowCancelConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard/orders');
    }
  }, [session, router]);

  const { data: stats, isLoading, refetch } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const handleTriggerOptimizer = async () => {
    try {
      const algorithmUrl = process.env.NEXT_PUBLIC_ALGORITHM_URL || '';
      await fetch('/api/admin/optimize', { method: 'POST' });
      refetch();
    } catch (error) {
      console.error('Optimizer trigger failed:', error);
    }
  };

  const handleCancelOrder = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel order');
      refetch();
    } catch (err) {
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingId(null);
      setShowCancelConfirmId(null);
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Facility overview and management</p>
        </div>
        <button onClick={handleTriggerOptimizer} className="btn-primary">
          🔄 Run Optimizer
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
        </div>
      )}

      {stats && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger">
            <div className="bento-card p-6">
              <div className="text-xs text-gray-400 mb-1">Occupancy Rate</div>
              <div className="text-3xl font-bold gradient-text">
                {stats.occupancyRate.toFixed(1)}%
              </div>
              <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
            </div>
            <div className="bento-card p-6">
              <div className="text-xs text-gray-400 mb-1">Occupied Spots</div>
              <div className="text-3xl font-bold">{stats.occupiedSpots.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">of {stats.totalSpots.toLocaleString()}</div>
            </div>
            <div className="bento-card p-6">
              <div className="text-xs text-gray-400 mb-1">Pending Robot Jobs</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.pendingRobotJobs}</div>
            </div>
            <div className="bento-card p-6">
              <div className="text-xs text-gray-400 mb-1">Active Orders</div>
              <div className="text-3xl font-bold text-blue-400">{stats.activeOrders}</div>
            </div>
          </div>

          {/* Active orders table */}
          <div className="bento-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800/50">
              <h3 className="font-semibold">Active Orders</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Buyer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Crop</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Quantity</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Harvest Date</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-3 text-sm">{order.buyerName}</td>
                    <td className="px-6 py-3 text-sm">
                      {order.cropType === 'LETTUCE' ? '🥬' : '🍅'} {order.cropType.toLowerCase()}
                    </td>
                    <td className="px-6 py-3 text-sm">{order.quantityKg} kg</td>
                    <td className="px-6 py-3">
                      <span className={`badge ${
                        order.status === 'GROWING' ? 'badge-green' :
                        order.status === 'CONFIRMED' ? 'badge-blue' :
                        'badge-yellow'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">
                      {order.quotedHarvest
                        ? new Date(order.quotedHarvest).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {showCancelConfirmId === order.id ? (
                        <div className="flex gap-2 justify-end items-center">
                          <span className="text-xs text-red-400">Sure?</span>
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => setShowCancelConfirmId(null)}
                            disabled={cancellingId === order.id}
                            className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowCancelConfirmId(order.id)}
                          disabled={cancellingId === order.id}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {cancellingId === order.id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {stats.orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No active orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
