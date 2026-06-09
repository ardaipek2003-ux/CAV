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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeMsg, setOptimizeMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const [cancellingId, setCancellingId] = useState<string|null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string|null>(null);

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') router.push('/dashboard/orders');
  }, [session, router]);

  const { data: stats, isLoading, refetch } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => { const res = await fetch('/api/admin/stats'); if (!res.ok) throw new Error('Failed'); return res.json(); },
    refetchInterval: 30_000,
  });

  const handleOptimize = async () => {
    setIsOptimizing(true); setOptimizeMsg(null);
    try {
      const res = await fetch('/api/admin/optimize', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOptimizeMsg({ type: 'success', text: data.message || 'Optimizer completed.' });
      refetch();
    } catch { setOptimizeMsg({ type: 'error', text: 'Optimizer trigger failed.' }); }
    finally { setIsOptimizing(false); setTimeout(() => setOptimizeMsg(null), 6000); }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      refetch();
    } catch { alert('Failed to cancel.'); }
    finally { setCancellingId(null); setConfirmCancel(null); }
  };

  if (session?.user?.role !== 'ADMIN') return null;

  return (
    <div className="fade-in space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="label mb-1" style={{ color: '#8A8A8A' }}>Administration</p>
          <h1 className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 700 }}>Admin Panel</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={handleOptimize} disabled={isOptimizing}
            className="btn-primary disabled:opacity-50 min-w-[160px]">
            {isOptimizing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Running...
              </span>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-4.32"/></svg>
                Run Optimizer
              </>
            )}
          </button>
          {optimizeMsg && (
            <div className="text-xs px-3 py-1.5 rounded-lg"
                 style={{ background: optimizeMsg.type === 'success' ? '#EDF5EA' : '#FEF2F2', color: optimizeMsg.type === 'success' ? '#1A3A2A' : '#991B1B', border: `1px solid ${optimizeMsg.type === 'success' ? '#C6E2C0' : '#FECACA'}` }}>
              {optimizeMsg.text}
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="card-flat p-10 text-center text-sm" style={{ color: '#8A8A8A' }}>Loading...</div>
      )}

      {stats && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            <div className="stat-card">
              <div className="label mb-2" style={{ color: '#8A8A8A' }}>Occupancy</div>
              <div className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>
                {stats.occupancyRate.toFixed(1)}%
              </div>
              <div className="progress-bar mt-3">
                <div className="progress-fill progress-fill-green" style={{ width: `${stats.occupancyRate}%` }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="label mb-2" style={{ color: '#8A8A8A' }}>Occupied Spots</div>
              <div className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>
                {stats.occupiedSpots.toLocaleString()}
              </div>
              <div className="text-xs mt-1" style={{ color: '#8A8A8A' }}>of {stats.totalSpots.toLocaleString()}</div>
            </div>
            <div className="stat-card" style={{ borderTop: '2px solid #92400E' }}>
              <div className="label mb-2" style={{ color: '#92400E' }}>Robot Jobs</div>
              <div className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>
                {stats.pendingRobotJobs}
              </div>
            </div>
            <div className="stat-card" style={{ borderTop: '2px solid #1A3A2A' }}>
              <div className="label mb-2" style={{ color: '#1A3A2A' }}>Active Orders</div>
              <div className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>
                {stats.activeOrders}
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div className="card-flat overflow-hidden">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#0A0A0A' }}>Active Orders</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Buyer</th><th>Crop</th><th>Quantity</th>
                  <th>Status</th><th>Harvest</th><th></th>
                </tr>
              </thead>
              <tbody>
                {stats.orders.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: '#8A8A8A' }}>No active orders</td></tr>
                )}
                {stats.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium" style={{ color: '#0A0A0A' }}>{order.buyerName}</td>
                    <td className="capitalize" style={{ color: '#5A5A5A' }}>{order.cropType.toLowerCase()}</td>
                    <td style={{ color: '#5A5A5A' }}>{order.quantityKg} kg</td>
                    <td>
                      <span className={`badge ${order.status === 'GROWING' ? 'badge-green' : order.status === 'CONFIRMED' ? 'badge-blue' : 'badge-yellow'}`}>
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                    <td style={{ color: '#8A8A8A' }}>
                      {order.quotedHarvest ? new Date(order.quotedHarvest).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {confirmCancel === order.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: '#991B1B' }}>Sure?</span>
                          <button onClick={() => handleCancel(order.id)} disabled={cancellingId === order.id}
                            className="text-xs font-bold" style={{ color: '#991B1B' }}>Yes</button>
                          <button onClick={() => setConfirmCancel(null)}
                            className="text-xs" style={{ color: '#5A5A5A' }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmCancel(order.id)} disabled={!!cancellingId}
                          className="text-xs font-medium" style={{ color: '#DC2626' }}>
                          {cancellingId === order.id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
