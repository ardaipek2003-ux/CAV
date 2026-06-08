'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

interface Order {
  id: string;
  cropType: string;
  quantityKg: number;
  spotsNeeded: number;
  status: string;
  quotedHarvest: string | null;
  actualHarvest: string | null;
  createdAt: string;
}

function statusBadge(status: string) {
  const map: Record<string, { class: string; label: string }> = {
    PENDING: { class: 'badge-yellow', label: 'Pending' },
    CONFIRMED: { class: 'badge-blue', label: 'Confirmed' },
    GROWING: { class: 'badge-green', label: 'Growing' },
    HARVESTED: { class: 'badge-purple', label: 'Harvested' },
    DELIVERED: { class: 'badge-gray', label: 'Delivered' },
    NEEDS_ATTENTION: { class: 'badge-red', label: 'Needs Attention' },
  };
  const s = map[status] || { class: 'badge-gray', label: status };
  return <span className={`badge ${s.class}`}>{s.label}</span>;
}

function cropIcon(crop: string) {
  return crop === 'LETTUCE' ? '🥬' : '🍅';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type TabType = 'ALL' | 'ACTIVE' | 'COMPLETED';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const activeOrders = orders?.filter(o => o.status === 'GROWING' || o.status === 'CONFIRMED' || o.status === 'PENDING') || [];
  const completedOrders = orders?.filter(o => o.status === 'HARVESTED' || o.status === 'DELIVERED') || [];
  
  const totalVolume = orders?.reduce((acc, order) => acc + order.quantityKg, 0) || 0;

  const displayOrders = activeTab === 'ACTIVE' 
    ? activeOrders 
    : activeTab === 'COMPLETED' 
    ? completedOrders 
    : orders;

  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-400 mt-1">Track all your crop orders and delivery dates</p>
        </div>
        <Link href="/dashboard/order/new" className="btn-primary">
          + New Order
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card p-6 flex flex-col justify-center border-t-4 border-t-gray-700">
          <div className="text-gray-400 text-sm mb-1 font-medium">Total Orders</div>
          <div className="text-3xl font-bold">{orders?.length || 0}</div>
        </div>
        <div className="bento-card p-6 flex flex-col justify-center border-t-4 border-t-[#00E59B]">
          <div className="text-[#00E59B] text-sm mb-1 font-medium">Active Growing</div>
          <div className="text-3xl font-bold text-white">{activeOrders.length}</div>
        </div>
        <div className="bento-card p-6 flex flex-col justify-center border-t-4 border-t-purple-500">
          <div className="text-purple-400 text-sm mb-1 font-medium">Total Volume Ordered</div>
          <div className="text-3xl font-bold text-white">{totalVolume.toLocaleString()} <span className="text-lg text-gray-500 font-normal">kg</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-xl w-fit border border-gray-800/50">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="bento-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#00E59B] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      )}

      {error && (
        <div className="bento-card p-8 text-center">
          <p className="text-red-400">Failed to load orders. Please try again.</p>
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="bento-card p-16 text-center border-dashed border-2 border-gray-800 bg-transparent">
          <div className="text-6xl mb-6">🌱</div>
          <h3 className="text-2xl font-bold mb-3">No orders yet</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">You haven&apos;t placed any orders yet. Place your first order to start growing fresh produce today!</p>
          <Link href="/dashboard/order/new" className="btn-primary px-8 py-3">
            Place Your First Order
          </Link>
        </div>
      )}

      {displayOrders && displayOrders.length > 0 && (
        <div className="bento-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/80 bg-gray-900/30">
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Crop</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Quantity</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Est. Delivery</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Ordered</th>
                <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="stagger">
              {displayOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-800/30 hover:bg-gray-800/40 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xl shadow-inner">
                        {cropIcon(order.cropType)}
                      </div>
                      <span className="font-semibold capitalize text-gray-200">{order.cropType.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-medium text-gray-300">{order.quantityKg} kg</div>
                    <div className="text-xs text-gray-500 mt-0.5">{order.spotsNeeded} spots</div>
                  </td>
                  <td className="px-6 py-5">{statusBadge(order.status)}</td>
                  <td className="px-6 py-5">
                    <div className="font-medium text-gray-300">
                      {formatDate(order.actualHarvest || order.quotedHarvest)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all opacity-80 group-hover:opacity-100"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
