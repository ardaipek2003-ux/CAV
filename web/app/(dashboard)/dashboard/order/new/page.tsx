'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CropType = 'LETTUCE' | 'TOMATO';

interface QuoteResponse {
  orderId: string;
  deliveryDate: string;
  spotsNeeded: number;
  modulesUsed: number;
}

const cropConfig = {
  LETTUCE: { label: 'Lettuce',  yieldPerSpot: 0.3, fastest: '~27 days', color: '#1A3A2A', bgColor: '#EDF5EA' },
  TOMATO:  { label: 'Tomato',   yieldPerSpot: 0.5, fastest: '~54 days', color: '#991B1B', bgColor: '#FEF2F2' },
};

export default function NewOrderPage() {
  const router = useRouter();
  const [cropType, setCropType] = useState<CropType>('LETTUCE');
  const [quantityKg, setQuantityKg] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const cfg = cropConfig[cropType];

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setQuote(null); setLoading(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropType, quantityKg: parseFloat(quantityKg) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to get quote'); return; }
      setQuote(data);
    } catch { setError('Failed to connect to the server.'); }
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!quote) return;
    setConfirming(true); setError('');
    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: quote.orderId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to confirm'); return; }
      router.push(`/dashboard/orders/${quote.orderId}`);
    } catch { setError('Failed to confirm.'); }
    finally { setConfirming(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 600 }}>
      <div className="pt-2 mb-8">
        <p className="label mb-1" style={{ color: '#8A8A8A' }}>New Order</p>
        <h1 className="heading-display text-3xl" style={{ color: '#0A0A0A', fontWeight: 700 }}>
          Place an Order
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#8A8A8A' }}>
          Select your crop and quantity — we&apos;ll find the fastest delivery date.
        </p>
      </div>

      {/* Step 1: Crop */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="label" style={{ color: '#8A8A8A' }}>Step 1</span>
          <div className="h-px flex-1" style={{ background: 'rgba(10,10,10,0.06)' }} />
        </div>
        <p className="text-sm font-medium mb-3" style={{ color: '#0A0A0A' }}>Choose a crop</p>
        <div className="grid grid-cols-2 gap-3">
          {(['LETTUCE', 'TOMATO'] as CropType[]).map((crop) => {
            const c = cropConfig[crop];
            const selected = cropType === crop;
            return (
              <button key={crop} type="button" onClick={() => { setCropType(crop); setQuote(null); }}
                className="text-left p-5 rounded-xl transition-all"
                style={{
                  background: selected ? c.bgColor : '#FFFFFF',
                  border: `1px solid ${selected ? c.color + '30' : 'rgba(10,10,10,0.08)'}`,
                  outline: selected ? `2px solid ${c.color}20` : 'none',
                }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                     style={{ background: selected ? c.bgColor : '#F3F2EE' }}>
                  {crop === 'LETTUCE' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selected ? c.color : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
                      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
                      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selected ? c.color : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="13" rx="7" ry="8"/><path d="M12 5V3"/>
                      <path d="M10 5.5C10 5.5 11 2 12 2s2 3.5 2 3.5"/>
                    </svg>
                  )}
                </div>
                <div className="font-semibold text-sm" style={{ color: selected ? c.color : '#0A0A0A' }}>{c.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#8A8A8A' }}>
                  Fastest: {c.fastest}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Quantity */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="label" style={{ color: '#8A8A8A' }}>Step 2</span>
          <div className="h-px flex-1" style={{ background: 'rgba(10,10,10,0.06)' }} />
        </div>
        <form onSubmit={handleGetQuote}>
          <p className="text-sm font-medium mb-3" style={{ color: '#0A0A0A' }}>Enter quantity (kg)</p>
          <div className="flex gap-3">
            <input type="number" step="0.1" min="0.1" value={quantityKg}
              onChange={(e) => { setQuantityKg(e.target.value); setQuote(null); }}
              className="input-field flex-1" placeholder={`e.g. 10  (≈ ${cfg.yieldPerSpot} kg / spot)`} required />
            <button type="submit" disabled={loading || !quantityKg}
              className="btn-green px-6 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Calculating...
                </span>
              ) : 'Get Quote'}
            </button>
          </div>
          {loading && (
            <p className="text-xs mt-2" style={{ color: '#8A8A8A' }}>
              This may take a moment for large orders...
            </p>
          )}
        </form>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
             style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {/* Quote result */}
      {quote && (
        <div className="fade-in rounded-xl p-6" style={{ background: '#EDF5EA', border: '1px solid #C6E2C0' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
                 style={{ background: '#1A3A2A' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: '#1A3A2A' }}>Quote ready</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Estimated Delivery', value: new Date(quote.deliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
              { label: 'Quantity', value: `${quantityKg} kg ${cfg.label}` },
              { label: 'Spots Allocated', value: `${quote.spotsNeeded}` },
              { label: 'Modules Used', value: `${quote.modulesUsed}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: '#FFFFFF', border: '1px solid rgba(26,58,42,0.1)' }}>
                <div className="label mb-1" style={{ color: '#5A8A6A' }}>{label}</div>
                <div className="font-semibold text-sm" style={{ color: '#0A0A0A' }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleConfirm} disabled={confirming}
              className="btn-green flex-1 py-2.5 disabled:opacity-50">
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
            <button onClick={() => setQuote(null)} className="btn-outline py-2.5 px-5">
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
