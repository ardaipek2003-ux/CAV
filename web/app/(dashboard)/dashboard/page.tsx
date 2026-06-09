'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface Order {
  id: string;
  cropType: string;
  quantityKg: number;
  status: string;
  quotedHarvest: string | null;
  actualHarvest: string | null;
}

export default function DashboardHome() {
  const { data: session } = useSession();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const activeOrders = orders?.filter(o =>
    ['GROWING', 'CONFIRMED', 'PENDING'].includes(o.status)
  ) || [];

  const upcomingHarvests = activeOrders
    .map(o => o.actualHarvest || o.quotedHarvest)
    .filter((d): d is string => d !== null)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  const nextHarvest = upcomingHarvests[0] ?? null;

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="fade-in space-y-8">
      
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="label mb-1" style={{ color: '#8A8A8A' }}>{greetingTime()}</p>
          <h1 className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 700 }}>
            {session?.user?.name || 'Welcome back'}
          </h1>
        </div>
        <Link href="/dashboard/order/new" className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
          </svg>
          New Order
        </Link>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        
        {/* Active Orders */}
        <div className="stat-card flex flex-col gap-1">
          <div className="label mb-3" style={{ color: '#8A8A8A' }}>Active Orders</div>
          <div className="heading-display text-5xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>
            {isLoading ? '—' : activeOrders.length}
          </div>
          <div className="text-sm mt-1" style={{ color: '#8A8A8A' }}>
            {activeOrders.filter(o => o.status === 'GROWING').length} growing now
          </div>
        </div>

        {/* Next Harvest */}
        <div className="stat-card flex flex-col gap-1">
          <div className="label mb-3" style={{ color: '#8A8A8A' }}>Next Harvest</div>
          <div className="text-xl font-bold" style={{ color: '#1A3A2A', letterSpacing: '-0.02em' }}>
            {isLoading ? '—' : (
              nextHarvest
                ? nextHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'No active crops'
            )}
          </div>
          {nextHarvest && (
            <div className="text-sm mt-1" style={{ color: '#8A8A8A' }}>
              {Math.max(0, Math.ceil((nextHarvest.getTime() - Date.now()) / 86_400_000))} days remaining
            </div>
          )}
        </div>

        {/* Facility Map link */}
        <Link href="/dashboard/map" className="stat-card flex flex-col gap-1 group transition-all hover:shadow-md cursor-pointer"
              style={{ borderColor: 'rgba(10,10,10,0.08)' }}>
          <div className="label mb-3" style={{ color: '#8A8A8A' }}>Facility</div>
          <div className="text-lg font-bold" style={{ color: '#0A0A0A', letterSpacing: '-0.02em' }}>
            Live Map →
          </div>
          <div className="text-sm mt-1" style={{ color: '#8A8A8A' }}>
            10,000 modules tracked
          </div>
        </Link>
      </div>

      {/* ─── Recent Orders ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#0A0A0A', letterSpacing: '-0.02em' }}>Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm font-medium" style={{ color: '#5A5A5A' }}>
            View all →
          </Link>
        </div>

        {isLoading && (
          <div className="card-flat p-8 text-center" style={{ color: '#8A8A8A', fontSize: '0.875rem' }}>
            Loading orders...
          </div>
        )}

        {!isLoading && orders && orders.length === 0 && (
          <div className="card-flat p-12 text-center border-dashed" style={{ borderStyle: 'dashed' }}>
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                 style={{ background: '#F3F2EE' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A3A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1" style={{ color: '#0A0A0A' }}>No orders yet</h3>
            <p className="text-sm mb-6" style={{ color: '#8A8A8A' }}>Place your first order to start growing.</p>
            <Link href="/dashboard/order/new" className="btn-primary">Place First Order</Link>
          </div>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <div className="card-flat overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Est. Delivery</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center"
                             style={{ background: '#F3F2EE' }}>
                          {order.cropType === 'LETTUCE' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A3A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <ellipse cx="12" cy="13" rx="7" ry="8"/><path d="M12 5V3"/>
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-sm capitalize" style={{ color: '#2A2A2A' }}>
                          {order.cropType.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#5A5A5A' }}>{order.quantityKg} kg</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'GROWING' ? 'badge-green' :
                        order.status === 'CONFIRMED' ? 'badge-blue' :
                        order.status === 'PENDING' ? 'badge-yellow' :
                        order.status === 'DELIVERED' ? 'badge-gray' : 'badge-gray'
                      }`}>
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                    <td style={{ color: '#5A5A5A' }}>
                      {(order.actualHarvest || order.quotedHarvest)
                        ? new Date(order.actualHarvest || order.quotedHarvest!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td>
                      <Link href={`/dashboard/orders/${order.id}`}
                        className="text-xs font-medium" style={{ color: '#5A5A5A' }}>
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin link */}
      {session?.user?.role === 'ADMIN' && (
        <div className="card-flat p-6 flex items-center justify-between">
          <div>
            <div className="label mb-1" style={{ color: '#8A8A8A' }}>Administration</div>
            <div className="font-semibold" style={{ color: '#0A0A0A' }}>Admin Panel</div>
            <div className="text-sm mt-0.5" style={{ color: '#8A8A8A' }}>Facility oversight, optimizer tools</div>
          </div>
          <Link href="/admin" className="btn-outline text-sm">Open →</Link>
        </div>
      )}
    </div>
  );
}
