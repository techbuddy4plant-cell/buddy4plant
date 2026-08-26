import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

export const PincodeChecker: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim().replace(/[^0-9]/g, '');
    if (clean.length !== 6) {
      setStatus('error');
      setMessage('Please enter a valid 6-digit Indian postal pincode.');
      return;
    }

    const estimatedDays = clean.startsWith('56') || clean.startsWith('40') || clean.startsWith('11') ? 2 : 4;
    const date = new Date(Date.now() + estimatedDays * 86400000);
    const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    setStatus('success');
    setMessage(`Express Botanical Delivery available by ${dateStr} for pincode ${clean}.`);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-2">
        <Truck className="w-4 h-4 text-emerald-800" />
        <span>Check Delivery Time to Your City</span>
      </div>

      <form onSubmit={checkPincode} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit Pincode (e.g. 560038)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
          <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors"
        >
          Check
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-2.5 flex items-center gap-1.5 text-emerald-800 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
          <span>{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-2.5 flex items-center gap-1.5 text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};
