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
  const map: Record<string, string> = {
    PENDING: 'badge-yellow',
    CONFIRMED: 'badge-blue',
    GROWING: 'badge-green',
    HARVESTED: 'badge-green',
    DELIVERED: 'badge-gray',
    NEEDS_ATTENTION: 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status.toLowerCase().replace('_', ' ')}</span>;
}

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Tab = 'ALL' | 'ACTIVE' | 'COMPLETED';

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('ALL');

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const active    = orders?.filter(o => ['GROWING','CONFIRMED','PENDING'].includes(o.status)) || [];
  const completed = orders?.filter(o => ['HARVESTED','DELIVERED'].includes(o.status)) || [];
  const totalKg   = orders?.reduce((a,o) => a + o.quantityKg, 0) || 0;
  const display   = tab === 'ACTIVE' ? active : tab === 'COMPLETED' ? completed : orders;

  return (
    <div className="fade-in space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="label mb-1" style={{ color: '#8A8A8A' }}>Orders</p>
          <h1 className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 700 }}>My Orders</h1>
        </div>
        <Link href="/dashboard/order/new" className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
          New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger">
        <div className="stat-card">
          <div className="label mb-2" style={{ color: '#8A8A8A' }}>Total</div>
          <div className="heading-display text-4xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>{orders?.length || 0}</div>
        </div>
        <div className="stat-card" style={{ borderTop: '2px solid #1A3A2A' }}>
          <div className="label mb-2" style={{ color: '#1A3A2A' }}>Growing</div>
          <div className="heading-display text-4xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>{active.length}</div>
        </div>
        <div className="stat-card">
          <div className="label mb-2" style={{ color: '#8A8A8A' }}>Volume</div>
          <div className="heading-display text-4xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>
            {totalKg.toLocaleString()}<span className="text-xl" style={{ color: '#8A8A8A', fontWeight: 400 }}>kg</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#F3F2EE', border: '1px solid rgba(10,10,10,0.07)' }}>
        {(['ALL','ACTIVE','COMPLETED'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all"
            style={{
              background: tab === t ? '#FFFFFF' : 'transparent',
              color: tab === t ? '#0A0A0A' : '#8A8A8A',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading && (
        <div className="card-flat p-10 text-center text-sm" style={{ color: '#8A8A8A' }}>Loading...</div>
      )}

      {!isLoading && orders && orders.length === 0 && (
        <div className="card-flat p-16 text-center" style={{ borderStyle: 'dashed', borderColor: 'rgba(10,10,10,0.1)' }}>
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#F3F2EE' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A3A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
            </svg>
          </div>
          <h3 className="font-semibold mb-2" style={{ color: '#0A0A0A' }}>No orders yet</h3>
          <p className="text-sm mb-6" style={{ color: '#8A8A8A' }}>Place your first order to start growing.</p>
          <Link href="/dashboard/order/new" className="btn-primary">Place First Order</Link>
        </div>
      )}

      {display && display.length > 0 && (
        <div className="card-flat overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Est. Delivery</th>
                <th>Ordered</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="stagger">
              {display.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                           style={{ background: '#F3F2EE' }}>
                        {order.cropType === 'LETTUCE' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A3A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="13" rx="7" ry="8"/><path d="M12 5V3"/></svg>
                        )}
                      </div>
                      <span className="font-medium capitalize" style={{ color: '#0A0A0A' }}>
                        {order.cropType.toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium" style={{ color: '#2A2A2A' }}>{order.quantityKg} kg</div>
                    <div className="text-xs mt-0.5" style={{ color: '#8A8A8A' }}>{order.spotsNeeded} spots</div>
                  </td>
                  <td>{statusBadge(order.status)}</td>
                  <td style={{ color: '#5A5A5A' }}>{fmt(order.actualHarvest || order.quotedHarvest)}</td>
                  <td style={{ color: '#8A8A8A' }}>{fmt(order.createdAt)}</td>
                  <td>
                    <Link href={`/dashboard/orders/${order.id}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-md transition-all"
                      style={{ background: '#F3F2EE', color: '#2A2A2A' }}>
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
