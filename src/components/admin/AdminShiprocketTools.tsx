import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { CourierOption, shiprocketAdmin } from '../../services/shiprocketService';

const rs = (n: number) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const tomorrow = () => {
  const d = new Date(Date.now() + 5.5 * 3600000 + 86400000);
  return d.toISOString().slice(0, 10);
};
const openUrl = (url: string) => window.open(url, '_blank', 'noopener');
const btn = 'px-3 py-2 text-[11px] font-semibold rounded-md border transition-colors disabled:opacity-50';
const SHIPROCKET_HOME = 'https://app.shiprocket.in/seller/home';

const waitingCourier = (o: Order) =>
  !!o.shiprocketOrderId && !o.trackingNumber && !['Cancelled', 'Refunded', 'Delivered'].includes(o.orderStatus);
const waitingPickup = (o: Order) =>
  !!o.trackingNumber && /AWB ASSIGNED/i.test(String(o.shiprocketStatus || '')) && !['Cancelled', 'Refunded', 'Delivered'].includes(o.orderStatus);

/** Top of Admin > Orders: wallet, what needs doing, problem parcels, and actions for several orders at once. */
export const ShiprocketSummary: React.FC<{ orders: Order[]; onChanged?: () => void }> = ({ orders, onChanged }) => {
  const [info, setInfo] = useState<{ wallet?: number; ndrCount?: number; ndr?: { awb: string; orderNumber: string; reason: string }[]; error?: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');

  const load = () => shiprocketAdmin('summary').then(setInfo);
  useEffect(() => {
    load();
  }, []);

  const needCourier = orders.filter(waitingCourier);
  const needPickup = orders.filter(waitingPickup);

  const bulk = async (op: 'assign' | 'pickup', list: Order[]) => {
    if (!list.length) return;
    const what = op === 'assign'
      ? `Assign Shiprocket's recommended courier to ${list.length} order(s)? The shipping cost is taken from your Shiprocket wallet.`
      : `Schedule pickup tomorrow for ${list.length} order(s)?`;
    if (!window.confirm(what)) return;
    setBusy(op);
    setNote('');
    const r = await shiprocketAdmin<{ results?: { id: string; success: boolean; error?: string }[] }>(op, { ids: list.map((o) => o.id), date: tomorrow() });
    const done = (r.results || []).filter((x) => x.success).length;
    const failed = (r.results || []).filter((x) => !x.success);
    setNote(`${done} done${failed.length ? `, ${failed.length} not done: ${failed.map((f) => `${orders.find((o) => o.id === f.id)?.orderNumber || f.id} (${f.error})`).join('; ')}` : ''}.`);
    setBusy('');
    load();
    onChanged?.();
  };

  return (
    <div className="bg-white border border-[#E5E2D9] rounded-xl p-4 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Shipping (Shiprocket)</h3>
        <a href={SHIPROCKET_HOME} target="_blank" rel="noreferrer" className="text-[#2D4A27] font-semibold underline underline-offset-2">
          Open Shiprocket (wallet recharge, KYC, weight disputes) ↗
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className={`p-3 rounded-lg border ${info?.wallet !== undefined && info.wallet < 300 ? 'border-amber-300 bg-amber-50' : 'border-[#EEE9DE] bg-[#FAF8F3]'}`}>
          <p className="text-[10px] uppercase tracking-wider text-[#7A7A7A]">Wallet</p>
          <p className="text-lg font-bold">{info ? (Number.isFinite(info.wallet) ? rs(info.wallet!) : '—') : '…'}</p>
          {info?.wallet !== undefined && info.wallet < 300 && <p className="text-amber-800">Low - recharge soon</p>}
        </div>
        <div className="p-3 rounded-lg border border-[#EEE9DE] bg-[#FAF8F3]">
          <p className="text-[10px] uppercase tracking-wider text-[#7A7A7A]">Need a courier</p>
          <p className="text-lg font-bold">{needCourier.length}</p>
        </div>
        <div className="p-3 rounded-lg border border-[#EEE9DE] bg-[#FAF8F3]">
          <p className="text-[10px] uppercase tracking-wider text-[#7A7A7A]">Need pickup</p>
          <p className="text-lg font-bold">{needPickup.length}</p>
        </div>
        <div className={`p-3 rounded-lg border ${info?.ndrCount ? 'border-rose-300 bg-rose-50' : 'border-[#EEE9DE] bg-[#FAF8F3]'}`}>
          <p className="text-[10px] uppercase tracking-wider text-[#7A7A7A]">Delivery problems</p>
          <p className="text-lg font-bold">{info ? info.ndrCount ?? 0 : '…'}</p>
        </div>
      </div>
      {!!info?.ndr?.length && (
        <ul className="text-[11px] text-rose-900 bg-rose-50 border border-rose-200 rounded-lg p-2 space-y-0.5">
          {info.ndr.map((n, i) => (
            <li key={i}>
              {n.orderNumber || 'Order'} · AWB {n.awb || '-'} · {n.reason || 'delivery attempt failed'}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={!!busy || !needCourier.length} onClick={() => bulk('assign', needCourier)} className={`${btn} bg-[#2D4A27] text-white border-[#2D4A27]`}>
          {busy === 'assign' ? 'Assigning…' : `Assign couriers to all (${needCourier.length})`}
        </button>
        <button disabled={!!busy || !needPickup.length} onClick={() => bulk('pickup', needPickup)} className={`${btn} border-[#2D4A27] text-[#2D4A27] bg-white`}>
          {busy === 'pickup' ? 'Scheduling…' : `Schedule pickup for all (${needPickup.length})`}
        </button>
      </div>
      {note && <p className="text-[#2D4A27]">{note}</p>}
      {info?.error && <p className="text-rose-700">Shiprocket: {info.error}</p>}
    </div>
  );
};

/** Inside one order: couriers & prices, assign, pickup, label / manifest / invoice. */
export const ShiprocketOrderPanel: React.FC<{ order: Order; onChanged?: () => void }> = ({ order, onChanged }) => {
  const [couriers, setCouriers] = useState<CourierOption[] | null>(null);
  const [recommended, setRecommended] = useState<number | undefined>();
  const [pick, setPick] = useState<number | null>(null);
  const [date, setDate] = useState(tomorrow());
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!order.shiprocketOrderId || ['Cancelled', 'Refunded'].includes(order.orderStatus)) return null;

  const run = async (op: string, body: Record<string, unknown> = {}) => {
    setBusy(op);
    setMsg(null);
    const r = await shiprocketAdmin<any>(op, { id: order.id, ...body });
    setBusy('');
    return r;
  };

  const loadRates = async () => {
    const r = await run('rates');
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Could not load couriers' });
    setCouriers(r.couriers);
    setRecommended(r.recommended);
    setPick(r.recommended || r.couriers?.[0]?.id || null);
  };
  const assign = async () => {
    const c = couriers?.find((x) => x.id === pick);
    if (!c) return;
    if (!window.confirm(`Assign ${c.name} for ${rs(c.rate)}? This is taken from your Shiprocket wallet.`)) return;
    const r = await run('assign', { courierId: c.id });
    setMsg(r.success ? { ok: true, text: `Courier assigned: ${r.courier} · AWB ${r.awb}` } : { ok: false, text: r.error || 'Could not assign' });
    if (r.success) {
      setCouriers(null);
      onChanged?.();
    }
  };
  const pickup = async () => {
    const r = await run('pickup', { date });
    setMsg(r.success ? { ok: true, text: `Pickup scheduled${r.pickupDate ? ` for ${r.pickupDate}` : ''}.` } : { ok: false, text: r.error || 'Could not schedule pickup' });
    if (r.success) onChanged?.();
  };
  const doc = async (op: 'label' | 'manifest' | 'invoice') => {
    const r = await run(op);
    if (r.success && r.url) openUrl(r.url);
    else setMsg({ ok: false, text: r.error || 'Not available yet' });
  };

  const hasAwb = !!order.trackingNumber;
  return (
    <div className="p-3.5 border border-[#E5E2D9] rounded-lg bg-white text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-[#1A1A1A]">Shipping steps</p>
        <a
          href={`https://app.shiprocket.in/seller/orders/details/${order.shiprocketOrderId}`}
          target="_blank"
          rel="noreferrer"
          className="text-[#2D4A27] underline underline-offset-2"
        >
          Open in Shiprocket ↗
        </a>
      </div>

      {/* 1. courier */}
      <div className="space-y-2">
        <p className="font-semibold">1. Courier {hasAwb && <span className="text-[#2D4A27]">✓ {order.deliveryCourier} · AWB {order.trackingNumber}</span>}</p>
        {!hasAwb && !couriers && (
          <button disabled={!!busy} onClick={loadRates} className={`${btn} border-[#2D4A27] text-[#2D4A27]`}>
            {busy === 'rates' ? 'Loading…' : 'See couriers & prices'}
          </button>
        )}
        {!hasAwb && couriers && (
          <div className="space-y-1.5">
            <div className="max-h-56 overflow-y-auto border border-[#EEE9DE] rounded-md divide-y divide-[#F0EBDF]">
              {couriers.map((c, i) => (
                <label key={c.id} className={`flex items-center gap-2 px-2.5 py-2 cursor-pointer ${pick === c.id ? 'bg-[#EEF3EA]' : ''}`}>
                  <input type="radio" name={`courier-${order.id}`} checked={pick === c.id} onChange={() => setPick(c.id)} />
                  <span className="flex-1">
                    <b>{c.name}</b>
                    {c.id === recommended && <span className="ml-1.5 text-[10px] bg-[#2D4A27] text-white px-1.5 py-0.5 rounded">Recommended</span>}
                    {i === 0 && <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Cheapest</span>}
                    <span className="block text-[#7A7A7A]">
                      {c.days ? `${c.days} days` : c.etd}
                      {c.rating ? ` · ★ ${c.rating.toFixed(1)}` : ''}
                      {c.surface ? ' · surface' : ' · air'}
                    </span>
                  </span>
                  <b>{rs(c.rate)}</b>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button disabled={!!busy || !pick} onClick={assign} className={`${btn} bg-[#2D4A27] text-white border-[#2D4A27]`}>
                {busy === 'assign' ? 'Assigning…' : 'Assign this courier'}
              </button>
              <button disabled={!!busy} onClick={() => setCouriers(null)} className={`${btn} border-[#E5E2D9]`}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. pickup */}
      <div className="space-y-2">
        <p className="font-semibold">
          2. Pickup {order.shiprocketPickupDate && <span className="text-[#2D4A27]">✓ {order.shiprocketPickupDate}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={date} min={tomorrow().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="px-2 py-1.5 border border-[#E5E2D9] rounded-md" disabled={!hasAwb} />
          <button disabled={!!busy || !hasAwb} onClick={pickup} className={`${btn} border-[#2D4A27] text-[#2D4A27]`}>
            {busy === 'pickup' ? 'Scheduling…' : 'Schedule pickup'}
          </button>
          {!hasAwb && <span className="text-[#8A8A8A]">Assign a courier first</span>}
        </div>
      </div>

      {/* 3. documents */}
      <div className="space-y-2">
        <p className="font-semibold">3. Print</p>
        <div className="flex flex-wrap gap-2">
          <button disabled={!!busy || !hasAwb} onClick={() => doc('label')} className={`${btn} border-[#E5E2D9]`}>{busy === 'label' ? 'Opening…' : 'Shipping label'}</button>
          <button disabled={!!busy || !hasAwb} onClick={() => doc('manifest')} className={`${btn} border-[#E5E2D9]`}>{busy === 'manifest' ? 'Opening…' : 'Manifest'}</button>
          <button disabled={!!busy} onClick={() => doc('invoice')} className={`${btn} border-[#E5E2D9]`}>{busy === 'invoice' ? 'Opening…' : 'Shiprocket invoice'}</button>
        </div>
      </div>

      {msg && <p className={msg.ok ? 'text-[#2D4A27] font-semibold' : 'text-rose-700'}>{msg.text}</p>}
      <p className="text-[10px] text-[#8A8A8A]">Returns, wallet recharge and weight disputes: use "Open in Shiprocket".</p>
    </div>
  );
};
