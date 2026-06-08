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

const LettuceIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
);
const TomatoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 6.5c0 0-3-1.5-5.5-1.5S6.5 6.5 6.5 6.5"/><ellipse cx="12" cy="13" rx="7" ry="8"/><path d="M12 5V3"/><path d="M10 5.5C10 5.5 11 2 12 2s2 3.5 2 3.5"/></svg>
);

export default function NewOrderPage() {
  const router = useRouter();
  const [cropType, setCropType] = useState<CropType>('LETTUCE');
  const [quantityKg, setQuantityKg] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const cropInfo = {
    LETTUCE: { name: 'Lettuce', baseline: '30 days', fastest: '~27 days (Row 1)', yieldPerSpot: '0.3 kg', color: 'emerald' },
    TOMATO:  { name: 'Tomato',  baseline: '60 days', fastest: '~54 days (Row 1)', yieldPerSpot: '0.5 kg', color: 'red' },
  };
  const info = cropInfo[cropType];

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setQuote(null);
    setLoading(true);
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
    setConfirming(true);
    setError('');
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

  const formatDeliveryDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Place New Order</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Choose your crop and quantity — we&apos;ll calculate the fastest delivery
        </p>
      </div>

      {/* Crop selection */}
      <div className="bento-card p-6 mb-5">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Select Crop Type</label>
        <div className="grid grid-cols-2 gap-4">
          {(['LETTUCE', 'TOMATO'] as CropType[]).map((crop) => {
            const ci = cropInfo[crop];
            const selected = cropType === crop;
            const isLettuce = crop === 'LETTUCE';
            return (
              <button
                key={crop}
                type="button"
                onClick={() => { setCropType(crop); setQuote(null); }}
                className={`p-5 rounded-xl border transition-all duration-200 text-left ${
                  selected
                    ? isLettuce
                      ? 'border-emerald-500/30 bg-emerald-500/[0.05]'
                      : 'border-red-400/30 bg-red-400/[0.05]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                }`}
              >
                <div className={`mb-3 ${selected ? (isLettuce ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500'}`}>
                  {isLettuce ? <LettuceIcon /> : <TomatoIcon />}
                </div>
                <div className="font-semibold text-slate-200">{ci.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Baseline: {ci.baseline} · Fastest: {ci.fastest}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      <form onSubmit={handleGetQuote} className="bento-card p-6 mb-5">
        <label htmlFor="quantity" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Quantity (kg)
        </label>
        <div className="flex gap-3">
          <input
            id="quantity"
            type="number"
            step="0.1"
            min="0.1"
            value={quantityKg}
            onChange={(e) => { setQuantityKg(e.target.value); setQuote(null); }}
            className="input-field flex-1"
            placeholder={`e.g. 10 (1 spot ≈ ${info.yieldPerSpot})`}
            required
          />
          <button
            type="submit"
            disabled={loading || !quantityKg}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Quoting...
              </span>
            ) : 'Get Quote'}
          </button>
        </div>
        {quantityKg && (
          <p className="text-xs text-slate-600 mt-2">
            Estimated spots needed: {Math.ceil(parseFloat(quantityKg || '0') / parseFloat(info.yieldPerSpot))}
          </p>
        )}
        {loading && (
          <p className="text-sm text-amber-400/80 mt-3 animate-pulse">
            Calculating optimal layout... This may take a few minutes for very large orders.
          </p>
        )}
      </form>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-500/[0.06] border border-red-500/[0.12] text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Quote Result */}
      {quote && (
        <div className="bento-card p-6 border-emerald-500/20 fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/[0.1] border border-emerald-500/[0.15] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">Delivery Quote Ready</h3>
              <p className="text-xs text-slate-500">Review and confirm your order</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#111827] rounded-xl p-4 border border-white/[0.04]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Estimated Delivery</div>
              <div className="text-base font-semibold text-emerald-400">{formatDeliveryDate(quote.deliveryDate)}</div>
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/[0.04]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Crop & Quantity</div>
              <div className="text-base font-semibold text-slate-200">{quantityKg} kg {info.name}</div>
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/[0.04]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Spots Allocated</div>
              <div className="text-base font-semibold text-slate-200">{quote.spotsNeeded} spots</div>
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/[0.04]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Modules Used</div>
              <div className="text-base font-semibold text-slate-200">{quote.modulesUsed} modules</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleConfirm} disabled={confirming} className="btn-primary flex-1 py-3 text-center disabled:opacity-50">
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
            <button onClick={() => setQuote(null)} className="btn-secondary py-3 px-6">
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
