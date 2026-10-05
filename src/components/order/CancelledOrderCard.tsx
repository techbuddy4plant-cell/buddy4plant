import React from 'react';
import { Order } from '../../types';

export const isOrderCancelled = (o?: Order | null) => !!o && (o.orderStatus === 'Cancelled' || o.orderStatus === 'Refunded');

/** What a cancelled order shows everywhere: no tracking, no actions - just that it is cancelled. */
export const CancelledOrderCard: React.FC<{ order: Order; navigate: (path: string) => void }> = ({ order, navigate }) => {
  const when = [...(order.statusHistory || [])].reverse().find((h) => h.status === 'Cancelled')?.timestamp || order.updatedAt;
  const paidOnline = order.paymentMethod === 'razorpay' && (order.paymentStatus === 'paid' || order.paymentStatus === 'refunded');
  const money = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  return (
    <div className="bg-white border border-[#E5E2D9] rounded-3xl p-6 sm:p-10 text-center font-sans">
      <div className="w-14 h-14 mx-auto rounded-full bg-[#FDF1F1] border border-[#F3CFCF] flex items-center justify-center text-[#B42318] text-xl">
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-4">Order cancelled</h1>
      <p className="text-sm text-[#5A5A5A] mt-1.5">
        Order <strong className="text-[#1A1A1A] font-mono">#{order.orderNumber}</strong>
        {when ? ` · cancelled on ${new Date(when).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
      </p>

      <div className="mt-6 text-left rounded-2xl bg-[#FAF7F1] border border-[#EEE9DE] p-4 sm:p-5 space-y-3 text-sm">
        {order.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 opacity-75">
            <img src={it.image} alt="" className="w-11 h-11 rounded-xl object-cover bg-white border border-[#EEE9DE] grayscale" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate">{it.name}</p>
              <p className="text-xs text-[#7A7A7A]">Qty {it.quantity}</p>
            </div>
            <p className="text-[13px] font-semibold">{money(it.price * it.quantity)}</p>
          </div>
        ))}
        <div className="flex justify-between pt-3 border-t border-[#E5E0D4] text-[13px]">
          <span className="text-[#5A5A5A]">Order total</span>
          <span className="font-bold">{money(order.total)}</span>
        </div>
        {order.cancelReason && (
          <div className="pt-3 border-t border-[#E5E0D4] text-[13px]">
            <span className="text-[#7A7A7A]">Reason: </span>
            {order.cancelReason}
          </div>
        )}
      </div>

      <p className="mt-5 text-[13px] text-[#5A5A5A] max-w-md mx-auto leading-relaxed">
        {order.paymentStatus === 'refunded'
          ? `${money(order.total)} has been refunded to the payment method you used.`
          : paidOnline
          ? `Our team will refund ${money(order.total)} to the payment method you used.`
          : 'Nothing was charged for this order.'}{' '}
        This order will not be shipped.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2.5 text-sm">
        <button onClick={() => navigate('/plants')} className="px-6 py-3 rounded-full bg-[#13301B] text-white font-semibold">
          Continue shopping
        </button>
        <a
          href={`https://wa.me/918004881668?text=${encodeURIComponent(`Hi Buddy4Plant, I need help with my cancelled order #${order.orderNumber}`)}`}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-full border border-[#D9D3C5] font-semibold text-[#1A1A1A]"
        >
          Need help?
        </a>
      </div>
    </div>
  );
};
