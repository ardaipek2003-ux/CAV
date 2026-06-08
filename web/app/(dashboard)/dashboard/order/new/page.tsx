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

export default function NewOrderPage() {
  const router = useRouter();
  const [cropType, setCropType] = useState<CropType>('LETTUCE');
  const [quantityKg, setQuantityKg] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const cropInfo = {
    LETTUCE: {
      icon: '🥬',
      name: 'Lettuce',
      baseline: '30 days',
      fastest: '~27 days (Row 1)',
      yieldPerSpot: '0.3 kg',
    },
    TOMATO: {
      icon: '🍅',
      name: 'Tomato',
      baseline: '60 days',
      fastest: '~54 days (Row 1)',
      yieldPerSpot: '0.5 kg',
    },
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

      if (!res.ok) {
        setError(data.error || 'Failed to get quote');
        return;
      }

      setQuote(data);
    } catch {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!quote) return;
    setConfirming(true);
    setError('');

    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: quote.orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to confirm order');
        return;
      }

      router.push(`/dashboard/orders/${quote.orderId}`);
    } catch {
      setError('Failed to confirm. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const formatDeliveryDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Place New Order</h1>
        <p className="text-gray-400 mt-1">
          Choose your crop and quantity — we&apos;ll calculate the fastest delivery
        </p>
      </div>

      {/* Crop selection */}
      <div className="bento-card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-4">Select Crop Type</label>
        <div className="grid grid-cols-2 gap-4">
          {(['LETTUCE', 'TOMATO'] as CropType[]).map((crop) => {
            const ci = cropInfo[crop];
            const selected = cropType === crop;
            return (
              <button
                key={crop}
                type="button"
                onClick={() => { setCropType(crop); setQuote(null); }}
                className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                  selected
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <div className="text-3xl mb-2">{ci.icon}</div>
                <div className="font-semibold text-lg">{ci.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Baseline: {ci.baseline} · Fastest: {ci.fastest}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity input */}
      <form onSubmit={handleGetQuote} className="bento-card p-6 mb-6">
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1.5">
          Quantity (kg)
        </label>
        <div className="flex gap-4">
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
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Quoting...
              </span>
            ) : (
              'Get Quote'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {quantityKg && (
            <>
              Estimated spots needed: {Math.ceil(parseFloat(quantityKg || '0') / parseFloat(info.yieldPerSpot))}
            </>
          )}
        </p>
        {loading && (
          <p className="text-sm text-yellow-500 mt-3 animate-pulse">
            Calculating optimal layout... This may take a few minutes for very large orders.
          </p>
        )}
      </form>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Quote result */}
      {quote && (
        <div className="bento-card p-6 glow-green fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <h3 className="font-semibold text-lg">Delivery Quote Ready</h3>
              <p className="text-sm text-gray-400">Review and confirm your order</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Estimated Delivery</div>
              <div className="text-lg font-semibold text-green-400">
                {formatDeliveryDate(quote.deliveryDate)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Crop & Quantity</div>
              <div className="text-lg font-semibold">
                {info.icon} {quantityKg} kg {info.name}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Spots Allocated</div>
              <div className="text-lg font-semibold">{quote.spotsNeeded} spots</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Modules Used</div>
              <div className="text-lg font-semibold">
                {quote.modulesUsed} modules
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="btn-primary flex-1 py-3 text-center disabled:opacity-50"
            >
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
            <button
              onClick={() => setQuote(null)}
              className="btn-secondary py-3 px-6"
            >
              Change Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
