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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') router.push('/dashboard/orders');
  }, [session, router]);

  const { data: stats, isLoading, refetch } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => { const res = await fetch('/api/admin/stats'); if (!res.ok) throw new Error('Failed'); return res.json(); },
    refetchInterval: 30_000,
  });

  const handleTriggerOptimizer = async () => {
    setIsOptimizing(true); setOptimizeMessage(null);
    try {
      const res = await fetch('/api/admin/optimize', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOptimizeMessage({ type: 'success', text: data.message || 'Optimizer completed successfully.' });
      refetch();
    } catch { setOptimizeMessage({ type: 'error', text: 'Optimizer trigger failed.' }); }
    finally { setIsOptimizing(false); setTimeout(() => setOptimizeMessage(null), 5000); }
  };

  const handleCancelOrder = async (id: string) => {
    setCancellingId(id);
    try { const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed'); refetch(); }
    catch { alert('Failed to cancel.'); }
    finally { setCancellingId(null); setShowCancelConfirmId(null); }
  };

  if (session?.user?.role !== 'ADMIN') return null;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">Admin Panel</h1>
          <p className="text-slate-500 mt-1 text-sm">Facility overview and management</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleTriggerOptimizer} 
            disabled={isOptimizing}
            className="btn-primary disabled:opacity-50 min-w-[160px] flex justify-center items-center gap-2"
          >
            {isOptimizing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Running...
              </span>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Run Optimizer
              </>
            )}
          </button>
          {optimizeMessage && (
            <div className={`text-sm px-3 py-1.5 rounded-lg ${
              optimizeMessage.type === 'success' ? 'bg-emerald-500/[0.06] text-emerald-400 border border-emerald-500/[0.12]' : 'bg-red-500/[0.06] text-red-400 border border-red-500/[0.12]'
            }`}>
              {optimizeMessage.text}
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger">
            <div className="bento-card p-6">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Occupancy Rate</div>
              <div className="text-2xl font-bold text-gradient">{stats.occupancyRate.toFixed(1)}%</div>
              <div className="mt-3 w-full bg-[#111827] rounded-full h-1.5">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${stats.occupancyRate}%` }} />
              </div>
            </div>
            <div className="bento-card p-6">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Occupied Spots</div>
              <div className="text-2xl font-bold text-slate-200">{stats.occupiedSpots.toLocaleString()}</div>
              <div className="text-xs text-slate-600 mt-1">of {stats.totalSpots.toLocaleString()}</div>
            </div>
            <div className="bento-card p-6">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Pending Robot Jobs</div>
              <div className="text-2xl font-bold text-amber-400">{stats.pendingRobotJobs}</div>
            </div>
            <div className="bento-card p-6">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Orders</div>
              <div className="text-2xl font-bold text-violet-400">{stats.activeOrders}</div>
            </div>
          </div>

          <div className="bento-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04]">
              <h3 className="text-sm font-semibold text-slate-300">Active Orders</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04] bg-[#111827]/50">
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Buyer</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Crop</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Quantity</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Harvest</th>
                  <th className="text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-300">{order.buyerName}</td>
                    <td className="px-6 py-3 text-sm text-slate-400 capitalize">{order.cropType.toLowerCase()}</td>
                    <td className="px-6 py-3 text-sm text-slate-400">{order.quantityKg} kg</td>
                    <td className="px-6 py-3">
                      <span className={`badge ${order.status === 'GROWING' ? 'badge-green' : order.status === 'CONFIRMED' ? 'badge-blue' : 'badge-yellow'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {order.quotedHarvest ? new Date(order.quotedHarvest).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {showCancelConfirmId === order.id ? (
                        <div className="flex gap-2 justify-end items-center">
                          <span className="text-xs text-red-400">Sure?</span>
                          <button onClick={() => handleCancelOrder(order.id)} disabled={cancellingId === order.id} className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50">Yes</button>
                          <button onClick={() => setShowCancelConfirmId(null)} disabled={cancellingId === order.id} className="text-xs text-slate-400 hover:text-white disabled:opacity-50">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowCancelConfirmId(order.id)} disabled={cancellingId === order.id} className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors disabled:opacity-50">
                          {cancellingId === order.id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {stats.orders.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">No active orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
