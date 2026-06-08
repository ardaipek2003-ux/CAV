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

const CropIcon = ({ crop }: { crop: string }) => (
  crop === 'LETTUCE' ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 6.5c0 0-3-1.5-5.5-1.5S6.5 6.5 6.5 6.5"/><ellipse cx="12" cy="13" rx="7" ry="8"/><path d="M12 5V3"/><path d="M10 5.5C10 5.5 11 2 12 2s2 3.5 2 3.5"/></svg>
  )
);

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

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

  const displayOrders = activeTab === 'ACTIVE' ? activeOrders : activeTab === 'COMPLETED' ? completedOrders : orders;

  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">My Orders</h1>
          <p className="text-slate-500 mt-1 text-sm">Track all your crop orders and delivery dates</p>
        </div>
        <Link href="/dashboard/order/new" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
          New Order
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bento-card p-6 border-t-2 border-t-slate-700/50">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Total Orders</div>
          <div className="text-2xl font-bold text-slate-200">{orders?.length || 0}</div>
        </div>
        <div className="bento-card p-6 border-t-2 border-t-emerald-500/30">
          <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">Active Growing</div>
          <div className="text-2xl font-bold text-slate-200">{activeOrders.length}</div>
        </div>
        <div className="bento-card p-6 border-t-2 border-t-violet-500/30">
          <div className="text-violet-400 text-xs font-medium uppercase tracking-wider mb-2">Total Volume</div>
          <div className="text-2xl font-bold text-slate-200">{totalVolume.toLocaleString()} <span className="text-base text-slate-500 font-normal">kg</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#111827] p-1 rounded-lg w-fit border border-white/[0.04]">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-xs font-semibold rounded-md transition-all tracking-wide ${
              activeTab === tab
                ? 'bg-white/[0.06] text-slate-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="bento-card p-12 text-center">
          <div className="animate-spin w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="bento-card p-8 text-center">
          <p className="text-red-400 text-sm">Failed to load orders. Please try again.</p>
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="bento-card p-16 text-center border-dashed border-2 border-white/[0.04] bg-transparent">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/[0.1] flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">Place your first order to start growing fresh produce.</p>
          <Link href="/dashboard/order/new" className="btn-primary px-8 py-3">
            Place Your First Order
          </Link>
        </div>
      )}

      {displayOrders && displayOrders.length > 0 && (
        <div className="bento-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04] bg-[#111827]/50">
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Crop</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Quantity</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Est. Delivery</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Ordered</th>
                <th className="text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="stagger">
              {displayOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#111827] border border-white/[0.06] flex items-center justify-center">
                        <CropIcon crop={order.cropType} />
                      </div>
                      <span className="font-medium capitalize text-slate-300 text-sm">{order.cropType.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-300 text-sm">{order.quantityKg} kg</div>
                    <div className="text-xs text-slate-600 mt-0.5">{order.spotsNeeded} spots</div>
                  </td>
                  <td className="px-6 py-4">{statusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(order.actualHarvest || order.quotedHarvest)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-white/[0.04] text-xs font-medium text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 transition-all border border-white/[0.04]"
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
