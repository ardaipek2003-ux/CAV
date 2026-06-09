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
  const map: Record<string, string> = {
    PENDING: 'badge-yellow', CONFIRMED: 'badge-blue',
    GROWING: 'badge-green', HARVESTED: 'badge-green',
    DELIVERED: 'badge-gray', NEEDS_ATTENTION: 'badge-red',
    PLANTED: 'badge-green', IN_TRANSIT: 'badge-yellow',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status.toLowerCase().replace('_', ' ')}</span>;
}

const fmt  = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtDT = (d: string | null) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const { data: order, isLoading, error, refetch } = useQuery<OrderDetail>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    refetchInterval: 15_000,
  });

  if (isLoading) return (
    <div className="fade-in card-flat p-10 text-center text-sm" style={{ color: '#8A8A8A' }}>Loading...</div>
  );
  if (error || !order) return (
    <div className="fade-in card-flat p-12 text-center">
      <h3 className="font-semibold mb-2" style={{ color: '#0A0A0A' }}>Order not found</h3>
      <p className="text-sm mb-5" style={{ color: '#8A8A8A' }}>This order doesn&apos;t exist or you don&apos;t have access.</p>
      <Link href="/dashboard/orders" className="btn-primary">← Back to Orders</Link>
    </div>
  );

  const progress = order.plants.length > 0
    ? Math.round((order.plants.filter(p => p.status === 'HARVESTED').length / order.plants.length) * 100)
    : 0;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      router.push('/dashboard/orders');
    } catch { alert('Failed to cancel.'); }
    finally { setCancelling(false); setShowCancel(false); }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch('/api/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });
      if (!res.ok) throw new Error('Failed');
      await refetch();
    } catch { alert('Failed to confirm.'); }
    finally { setConfirming(false); }
  };

  return (
    <div className="fade-in space-y-6">

      {/* Breadcrumb + header */}
      <div className="pt-2">
        <Link href="/dashboard/orders" className="text-xs font-medium mb-3 inline-flex items-center gap-1" style={{ color: '#8A8A8A' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          My Orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="heading-display text-3xl capitalize" style={{ color: '#0A0A0A', fontWeight: 700 }}>
                {order.cropType.toLowerCase()} Order
              </h1>
              {statusBadge(order.status)}
            </div>
            <p className="text-sm" style={{ color: '#8A8A8A' }}>ID: {order.id.slice(0,8)}…</p>
          </div>
          {order.status === 'PENDING' && (
            <div className="flex items-center gap-3">
              <button onClick={handleConfirm} disabled={confirming || cancelling} className="btn-green disabled:opacity-50">
                {confirming ? 'Confirming...' : 'Confirm'}
              </button>
              {showCancel ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                     style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <span style={{ color: '#991B1B' }}>Cancel order?</span>
                  <button onClick={handleCancel} disabled={cancelling} className="font-bold" style={{ color: '#991B1B' }}>Yes</button>
                  <button onClick={() => setShowCancel(false)} className="font-medium" style={{ color: '#5A5A5A' }}>No</button>
                </div>
              ) : (
                <button onClick={() => setShowCancel(true)} disabled={cancelling || confirming}
                  className="btn-outline text-sm disabled:opacity-50" style={{ color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)' }}>
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
        {[
          { label: 'Quantity',         value: `${order.quantityKg} kg` },
          { label: 'Spots Allocated',  value: `${order.spotsNeeded}` },
          { label: 'Est. Delivery',    value: fmt(order.actualHarvest || order.quotedHarvest), highlight: true },
          { label: 'Growth Progress',  value: `${progress}%`, progress: true },
        ].map(({ label, value, highlight, progress: isProgress }) => (
          <div key={label} className="stat-card">
            <div className="label mb-2" style={{ color: '#8A8A8A' }}>{label}</div>
            <div className="font-bold text-lg" style={{ color: highlight ? '#1A3A2A' : '#0A0A0A', letterSpacing: '-0.02em' }}>
              {value}
            </div>
            {isProgress && (
              <div className="progress-bar mt-2">
                <div className="progress-fill progress-fill-green" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="card-flat p-6">
        <h2 className="font-semibold mb-4 text-sm" style={{ color: '#0A0A0A' }}>Timeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ordered',     value: fmtDT(order.createdAt) },
            { label: 'Confirmed',   value: fmtDT(order.confirmedAt) },
            { label: 'Target',      value: fmt(order.quotedHarvest) },
            { label: 'Delivered',   value: fmtDT(order.deliveredAt) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="label mb-1" style={{ color: '#8A8A8A' }}>{label}</div>
              <div className="text-sm font-medium" style={{ color: '#2A2A2A' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plants table */}
      <div className="card-flat overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
          <h2 className="font-semibold text-sm" style={{ color: '#0A0A0A' }}>
            Plants <span style={{ color: '#8A8A8A', fontWeight: 400 }}>({order.plants.length})</span>
          </h2>
        </div>
        {order.plants.length === 0 ? (
          <div className="p-8 text-sm text-center" style={{ color: '#8A8A8A' }}>No plants assigned yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th><th>Row</th><th>Spot</th>
                <th>Status</th><th>Planted</th><th>Expected Harvest</th>
              </tr>
            </thead>
            <tbody>
              {order.plants.map((plant) => (
                <tr key={plant.id}>
                  <td className="font-mono text-sm">{plant.spot?.moduleNumber ?? '—'}</td>
                  <td className="font-mono text-sm">{plant.spot?.rowNumber ?? '—'}</td>
                  <td className="font-mono text-sm">{plant.spot?.spotNumber ?? '—'}</td>
                  <td>{statusBadge(plant.status)}</td>
                  <td style={{ color: '#8A8A8A' }}>{fmt(plant.plantedAt)}</td>
                  <td style={{ color: '#8A8A8A' }}>{fmt(plant.expectedHarvest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
