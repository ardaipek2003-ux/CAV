'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

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
    HARVESTED: { class: 'badge-green', label: 'Harvested' },
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

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    refetchInterval: 30_000, // 30 seconds
  });

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-400 mt-1">Track all your crop orders and delivery dates</p>
        </div>
        <Link href="/dashboard/order/new" className="btn-primary">
          + New Order
        </Link>
      </div>

      {isLoading && (
        <div className="bento-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      )}

      {error && (
        <div className="bento-card p-8 text-center">
          <p className="text-red-400">Failed to load orders. Please try again.</p>
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="bento-card p-12 text-center">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-6">Place your first order to start growing!</p>
          <Link href="/dashboard/order/new" className="btn-primary">
            Place an Order
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="bento-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Crop</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Quantity</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Spots</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Est. Delivery</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Ordered</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="stagger">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cropIcon(order.cropType)}</span>
                      <span className="font-medium capitalize">{order.cropType.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{order.quantityKg} kg</td>
                  <td className="px-6 py-4 text-gray-300">{order.spotsNeeded}</td>
                  <td className="px-6 py-4">{statusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(order.actualHarvest || order.quotedHarvest)}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
                    >
                      View →
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
