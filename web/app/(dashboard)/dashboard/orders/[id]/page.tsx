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
  spot: { moduleNumber: number; rowNumber: number; spotNumber: number; } | null;
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const CropIcon = ({ crop }: { crop: string }) => (
  crop === 'LETTUCE' ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 6.5c0 0-3-1.5-5.5-1.5S6.5 6.5 6.5 6.5"/><ellipse cx="12" cy="13" rx="7" ry="8"/><path d="M12 5V3"/><path d="M10 5.5C10 5.5 11 2 12 2s2 3.5 2 3.5"/></svg>
  )
);

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: order, isLoading, error, refetch } = useQuery<OrderDetail>({
    queryKey: ['order', id],
    queryFn: async () => { const res = await fetch(`/api/orders/${id}`); if (!res.ok) throw new Error('Failed'); return res.json(); },
    refetchInterval: 15_000,
  });

  if (isLoading) return (
    <div className="fade-in"><div className="bento-card p-12 text-center"><div className="animate-spin w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" /><p className="text-slate-500 text-sm">Loading order details...</p></div></div>
  );

  if (error || !order) return (
    <div className="fade-in"><div className="bento-card p-12 text-center"><div className="w-14 h-14 rounded-2xl bg-amber-500/[0.08] border border-amber-500/[0.1] flex items-center justify-center mx-auto mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="1.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><h3 className="text-lg font-semibold mb-2">Order not found</h3><p className="text-slate-500 mb-6 text-sm">This order doesn&apos;t exist or you don&apos;t have access.</p><Link href="/dashboard/orders" className="btn-primary">← Back to Orders</Link></div></div>
  );

  const progress = order.plants.length > 0 ? Math.round((order.plants.filter(p => p.status === 'HARVESTED').length / order.plants.length) * 100) : 0;

  const handleCancel = async () => { setCancelling(true); try { const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed'); router.push('/dashboard/orders'); } catch { alert('Failed to cancel.'); } finally { setCancelling(false); setShowCancelConfirm(false); } };
  const handleConfirm = async () => { setConfirming(true); try { const res = await fetch('/api/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: id }) }); if (!res.ok) throw new Error('Failed'); await refetch(); } catch { alert('Failed to confirm.'); } finally { setConfirming(false); } };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/orders" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 tracking-[-0.02em]">
            <CropIcon crop={order.cropType} />
            <span className="capitalize">{order.cropType.toLowerCase()}</span> Order
            {statusBadge(order.status)}
          </h1>
        </div>
        {order.status === 'PENDING' && (
          <div className="flex gap-3 items-center">
            <button onClick={handleConfirm} disabled={confirming || cancelling} className="btn-primary disabled:opacity-50">
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
            {showCancelConfirm ? (
              <div className="flex gap-2 items-center bg-red-500/[0.06] border border-red-500/[0.12] px-3 py-1.5 rounded-lg">
                <span className="text-xs text-red-400">Sure?</span>
                <button onClick={handleCancel} disabled={cancelling} className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50">Yes</button>
                <button onClick={() => setShowCancelConfirm(false)} disabled={cancelling} className="text-xs text-slate-400 hover:text-white disabled:opacity-50">No</button>
              </div>
            ) : (
              <button onClick={() => setShowCancelConfirm(true)} disabled={cancelling || confirming} className="btn-secondary text-red-400 border-red-500/[0.12] hover:bg-red-500/[0.06] disabled:opacity-50">
                Cancel Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bento-card p-5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Quantity</div>
          <div className="text-xl font-bold text-slate-200">{order.quantityKg} kg</div>
        </div>
        <div className="bento-card p-5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Spots Allocated</div>
          <div className="text-xl font-bold text-slate-200">{order.spotsNeeded}</div>
        </div>
        <div className="bento-card p-5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Est. Delivery</div>
          <div className="text-xl font-bold text-emerald-400">{formatDate(order.actualHarvest || order.quotedHarvest)}</div>
        </div>
        <div className="bento-card p-5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Growth Progress</div>
          <div className="text-xl font-bold text-slate-200">{progress}%</div>
          <div className="mt-2 h-1 bg-[#111827] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bento-card p-6 mb-8">
        <h2 className="text-sm font-semibold mb-4 text-slate-300">Timeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><div className="text-slate-500 text-xs mb-1">Ordered</div><div className="font-medium text-slate-300">{formatDateTime(order.createdAt)}</div></div>
          <div><div className="text-slate-500 text-xs mb-1">Confirmed</div><div className="font-medium text-slate-300">{formatDateTime(order.confirmedAt)}</div></div>
          <div><div className="text-slate-500 text-xs mb-1">Quoted Harvest</div><div className="font-medium text-slate-300">{formatDate(order.quotedHarvest)}</div></div>
          <div><div className="text-slate-500 text-xs mb-1">Delivered</div><div className="font-medium text-slate-300">{formatDateTime(order.deliveredAt)}</div></div>
        </div>
      </div>

      {/* Plants */}
      <div className="bento-card p-6">
        <h2 className="text-sm font-semibold mb-4 text-slate-300">Plants ({order.plants.length})</h2>
        {order.plants.length === 0 ? (
          <p className="text-slate-500 text-sm py-4">No plants assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.04]">
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Module</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Row</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Spot</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Planted</th>
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Expected Harvest</th>
              </tr></thead>
              <tbody>
                {order.plants.map((plant) => (
                  <tr key={plant.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-slate-400">{plant.spot?.moduleNumber ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-400">{plant.spot?.rowNumber ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-400">{plant.spot?.spotNumber ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(plant.status)}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{formatDate(plant.plantedAt)}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{formatDate(plant.expectedHarvest)}</td>
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
