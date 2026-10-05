import React, { useState } from 'react';
import { Order } from '../../types';
import { cancelOrder } from '../../services/orderService';
import { cancelOnShiprocket } from '../../services/shiprocketService';
import { useBackClose } from '../../hooks/useBackClose';

/** Orders can be cancelled by the customer until they are packed. */
export const canCancelOrder = (o?: Order | null) => !!o && ['Pending', 'Confirmed', 'Processing'].includes(o.orderStatus);

const REASONS = [
  'Ordered by mistake',
  'Want to change the items or quantity',
  'Want to change the delivery address or phone number',
  'Delivery is taking too long',
  'Found a better price elsewhere',
  'No longer needed',
  'Other',
];

type Step = 'reason' | 'confirm' | 'done';

export const CancelOrderModal: React.FC<{
  order: Order;
  onClose: () => void;
  onCancelled?: () => void;
}> = ({ order, onClose, onCancelled }) => {
  const [step, setStep] = useState<Step>('reason');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useBackClose(true, onClose);

  const paidOnline = order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid';
  const needDetails = reason === 'Other';
  const canContinue = !!reason && (!needDetails || details.trim().length >= 5);
  const money = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      // stop the shipment first; once the courier has the parcel it cannot be cancelled online
      const sr = await cancelOnShiprocket(order);
      if (!sr.ok && /shipped/i.test(sr.error || '')) {
        setError('This order has already been shipped, so it cannot be cancelled here. Please message us on WhatsApp and we will help.');
        setBusy(false);
        return;
      }
      const full = details.trim() ? `${reason} - ${details.trim()}` : reason;
      await cancelOrder(order.id, full.slice(0, 400));
      setStep('done');
      onCancelled?.();
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Cancel order">
      <div className="absolute inset-0 bg-[#0F1710]/65" onClick={busy ? undefined : onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto font-sans text-[#1A1A1A]">
        {/* header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#EEE9DE] rounded-t-3xl">
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight">{step === 'done' ? 'Order cancelled' : 'Cancel order'}</h3>
            <p className="text-xs text-[#7A7A7A] font-mono mt-0.5">#{order.orderNumber}</p>
          </div>
          {!busy && (
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full hover:bg-[#F4F0E8] flex items-center justify-center text-[#5A5A5A]">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="px-5 sm:px-7 py-5 space-y-5 text-sm">
          {step !== 'done' && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#7A7A7A]">
              <span className={step === 'reason' ? 'text-[#13301B]' : ''}>1. Reason</span>
              <span className="h-px flex-1 bg-[#E5E0D4]" />
              <span className={step === 'confirm' ? 'text-[#13301B]' : ''}>2. Confirm</span>
            </div>
          )}

          {/* items */}
          {step !== 'done' && (
            <div className="rounded-2xl bg-[#FAF7F1] border border-[#EEE9DE] p-3.5 space-y-2.5">
              {order.items.slice(0, 3).map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={it.image} alt="" className="w-11 h-11 rounded-xl object-cover bg-white border border-[#EEE9DE]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold truncate">{it.name}</p>
                    <p className="text-xs text-[#7A7A7A]">Qty {it.quantity}</p>
                  </div>
                  <p className="text-[13px] font-semibold">{money(it.price * it.quantity)}</p>
                </div>
              ))}
              {order.items.length > 3 && <p className="text-xs text-[#7A7A7A]">+ {order.items.length - 3} more item(s)</p>}
              <div className="flex justify-between pt-2.5 border-t border-[#E5E0D4] text-[13px]">
                <span className="text-[#5A5A5A]">Order total ({paidOnline ? 'paid online' : 'Cash on Delivery'})</span>
                <span className="font-bold">{money(order.total)}</span>
              </div>
            </div>
          )}

          {step === 'reason' && (
            <>
              <fieldset className="space-y-2">
                <legend className="font-semibold mb-2">Why are you cancelling? *</legend>
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-colors ${
                      reason === r ? 'border-[#13301B] bg-[#F1F6EF]' : 'border-[#E5E0D4] hover:border-[#BDB6A6]'
                    }`}
                  >
                    <input type="radio" name="cancel-reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[#13301B] w-4 h-4" />
                    <span className="text-[13px]">{r}</span>
                  </label>
                ))}
              </fieldset>
              <label className="block">
                <span className="font-semibold block mb-1.5">
                  {needDetails ? 'Please tell us more *' : 'Anything else we should know? (optional)'}
                </span>
                <textarea
                  rows={3}
                  value={details}
                  maxLength={300}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add a short note"
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E5E0D4] text-[13px] outline-none focus:border-[#13301B]"
                />
              </label>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-1">
                <button onClick={onClose} className="px-5 py-3 rounded-full border border-[#D9D3C5] font-semibold">
                  Keep my order
                </button>
                <button
                  disabled={!canContinue}
                  onClick={() => setStep('confirm')}
                  className="px-6 py-3 rounded-full bg-[#13301B] text-white font-semibold disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="rounded-2xl border border-[#EEE9DE] p-4 space-y-3 text-[13px]">
                <div>
                  <p className="text-xs text-[#7A7A7A]">Reason</p>
                  <p className="font-semibold">{reason}</p>
                  {details.trim() && <p className="text-[#5A5A5A] mt-0.5">{details.trim()}</p>}
                </div>
                <div className="pt-3 border-t border-[#EEE9DE]">
                  <p className="text-xs text-[#7A7A7A]">Refund</p>
                  {paidOnline ? (
                    <p>
                      <span className="font-semibold">{money(order.total)}</span> will be refunded by our team to the payment method you used. You will get a
                      message once it is done.
                    </p>
                  ) : (
                    <p>This is a Cash on Delivery order, so nothing has been charged and there is nothing to refund.</p>
                  )}
                </div>
              </div>
              <p className="text-[13px] text-[#8A2A2A] bg-[#FDF1F1] border border-[#F3CFCF] rounded-xl px-3.5 py-3">
                Cancelling cannot be undone. To get these items you would need to place a new order.
              </p>
              {error && <p className="text-[13px] font-semibold text-[#B42318]">{error}</p>}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2.5 pt-1">
                <button disabled={busy} onClick={() => setStep('reason')} className="px-5 py-3 rounded-full border border-[#D9D3C5] font-semibold disabled:opacity-50">
                  Back
                </button>
                <button disabled={busy} onClick={submit} className="px-6 py-3 rounded-full bg-[#B42318] hover:bg-[#912018] text-white font-semibold disabled:opacity-60">
                  {busy ? 'Cancelling...' : 'Cancel this order'}
                </button>
              </div>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F1F6EF] flex items-center justify-center text-[#13301B] text-xl">
                <i className="fa-solid fa-check" aria-hidden="true" />
              </div>
              <p className="font-serif font-bold text-xl">Your order has been cancelled</p>
              <p className="text-[13px] text-[#5A5A5A] max-w-sm mx-auto leading-relaxed">
                {paidOnline
                  ? `Our team will refund ${money(order.total)} to the payment method you used and message you once it is done.`
                  : 'Nothing was charged for this Cash on Delivery order.'}
              </p>
              <button onClick={onClose} className="mt-2 px-7 py-3 rounded-full bg-[#13301B] text-white font-semibold">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
