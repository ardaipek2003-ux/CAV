'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

interface Plant {
  id: string;
  cropType: string;
  status: string;
  plantedAt: string;
  expectedHarvest: string;
  spot: {
    moduleNumber: number;
    rowNumber: number;
    spotNumber: number;
  } | null;
}

interface OrderDetail {
  id: string;
  cropType: string;
  quantityKg: number;
  spotsNeeded: number;
  status: string;
  quotedHarvest: string | null;
  actualHarvest: string | null;
  confirmedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  plants: Plant[];
}

function statusBadge(status: string) {
  const map: Record<string, { class: string; label: string }> = {
    PENDING: { class: 'badge-yellow', label: 'Pending' },
    CONFIRMED: { class: 'badge-blue', label: 'Confirmed' },
    GROWING: { class: 'badge-green', label: 'Growing' },
    HARVESTED: { class: 'badge-green', label: 'Harvested' },
    DELIVERED: { class: 'badge-gray', label: 'Delivered' },
    NEEDS_ATTENTION: { class: 'badge-red', label: 'Needs Attention' },
    PLANTED: { class: 'badge-green', label: 'Planted' },
    IN_TRANSIT: { class: 'badge-yellow', label: 'In Transit' },
  };
  const s = map[status] || { class: 'badge-gray', label: status };
  return <span className={`badge ${s.class}`}>{s.label}</span>;
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

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: order, isLoading, error, refetch } = useQuery<OrderDetail>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    },
    refetchInterval: 15_000,
  });

  if (isLoading) {
    return (
      <div className="fade-in">
        <div className="bento-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#00E59B] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fade-in">
        <div className="bento-card p-12 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Order not found</h3>
          <p className="text-gray-400 mb-6">This order doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/dashboard/orders" className="btn-primary">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const progress = order.plants.length > 0
    ? Math.round((order.plants.filter(p => p.status === 'HARVESTED').length / order.plants.length) * 100)
    : 0;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel order');
      router.push('/dashboard/orders');
    } catch (err) {
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });
      if (!res.ok) throw new Error('Failed to confirm order');
      await refetch();
    } catch (err) {
      alert('Failed to confirm order. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/orders" className="text-sm text-gray-400 hover:text-white transition-colors mb-2 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {order.cropType === 'LETTUCE' ? '🥬' : '🍅'}
            <span className="capitalize">{order.cropType.toLowerCase()}</span> Order
            {statusBadge(order.status)}
          </h1>
        </div>
        {order.status === 'PENDING' && (
          <div className="flex gap-3 items-center">
            <button 
              onClick={handleConfirm} 
              disabled={confirming || cancelling}
              className="btn-primary disabled:opacity-50 transition-all"
            >
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
            {showCancelConfirm ? (
              <div className="flex gap-2 items-center bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
                <span className="text-sm text-red-400">Sure?</span>
                <button 
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-sm font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  Yes, cancel
                </button>
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-50"
                >
                  No
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowCancelConfirm(true)} 
                disabled={cancelling || confirming}
                className="btn-secondary text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 disabled:opacity-50 transition-all"
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bento-card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quantity</div>
          <div className="text-2xl font-bold">{order.quantityKg} kg</div>
        </div>
        <div className="bento-card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Spots Allocated</div>
          <div className="text-2xl font-bold">{order.spotsNeeded}</div>
        </div>
        <div className="bento-card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Delivery</div>
          <div className="text-2xl font-bold text-[#00E59B]">{formatDate(order.actualHarvest || order.quotedHarvest)}</div>
        </div>
        <div className="bento-card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Growth Progress</div>
          <div className="text-2xl font-bold">{progress}%</div>
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00E59B] to-[#008A5E] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bento-card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Timeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Ordered</div>
            <div className="font-medium">{formatDateTime(order.createdAt)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Confirmed</div>
            <div className="font-medium">{formatDateTime(order.confirmedAt)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Quoted Harvest</div>
            <div className="font-medium">{formatDate(order.quotedHarvest)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Delivered</div>
            <div className="font-medium">{formatDateTime(order.deliveredAt)}</div>
          </div>
        </div>
      </div>

      {/* Plants Table */}
      <div className="bento-card p-6">
        <h2 className="text-lg font-semibold mb-4">
          Plants ({order.plants.length})
        </h2>
        {order.plants.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">No plants assigned to this order yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Module</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Row</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Spot</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Planted</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Expected Harvest</th>
                </tr>
              </thead>
              <tbody>
                {order.plants.map((plant) => (
                  <tr key={plant.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm">{plant.spot?.moduleNumber ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm">{plant.spot?.rowNumber ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm">{plant.spot?.spotNumber ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(plant.status)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(plant.plantedAt)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(plant.expectedHarvest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
