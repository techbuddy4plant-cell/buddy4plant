import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  Download,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Clock,
  ExternalLink,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { subscribeToOrder } from '../../services/orderService';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { PlantImage } from '../../utils/imageFallback';

interface OrderSuccessProps {
  orderNumber: string;
  navigate: (path: string) => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderNumber, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const { settings } = useStoreSettings();

  useEffect(() => {
    // Real-time listener for this order!
    const unsubscribe = subscribeToOrder(orderNumber, (liveOrder) => {
      setOrder(liveOrder);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [orderNumber]);

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const deliveryEstDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const steps: { label: OrderStatus; desc: string }[] = [
    { label: 'Pending', desc: 'Order Placed' },
    { label: 'Confirmed', desc: 'Plant Inspected' },
    { label: 'Packed', desc: 'Moisture-Locked' },
    { label: 'Shipped', desc: 'In Eco Transit' },
    { label: 'Out for Delivery', desc: 'With Courier' },
    { label: 'Delivered', desc: 'Delivered' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const idx = steps.findIndex((s) => s.label === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E2D9] overflow-hidden p-6 sm:p-10 text-center">
          {/* Green Check Icon */}
          <div className="w-16 h-16 bg-[#2D4A27]/10 text-[#2D4A27] flex items-center justify-center mx-auto mb-5 border border-[#2D4A27]/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em] bg-[#2D4A27]/10 px-3 py-1">
              Order Confirmed & Placed
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#2D4A27] bg-[#2D4A27]/5 px-2.5 py-1 border border-[#2D4A27]/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live Real-Time Sync
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A] mt-4">
            Thank you for bringing green home!
          </h1>

          <p className="text-xs text-[#5A5A5A] mt-2 max-w-md mx-auto leading-relaxed font-light">
            We have received your order <strong className="text-[#1A1A1A] font-bold">{orderNumber}</strong>. Our botanists are preparing your living plants for secure, climate-buffered transit.
          </p>

          {/* Embedded Real-Time Live Tracker Card */}
          <div className="mt-8 bg-[#F5F2EB] p-5 sm:p-6 border border-[#E5E2D9] text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E2D9]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] tracking-wider block">Live Delivery Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-serif font-bold text-lg text-[#1A1A1A]">
                    {order ? order.orderStatus : 'Confirmed'}
                  </span>
                  <span className="text-xs bg-[#2D4A27] text-white px-2 py-0.5 font-mono">
                    {order ? order.orderNumber : orderNumber}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] tracking-wider block">Estimated Doorstep Arrival</span>
                <span className="font-bold text-xs text-[#2D4A27] flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2D4A27]" />
                  {order?.estimatedDeliveryDate || deliveryEstDate}
                </span>
              </div>
            </div>

            {/* Step Milestones Progress Bar */}
            <div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.label}
                      className={`p-2.5 text-center flex flex-col items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-white border-2 border-[#2D4A27] shadow-xs'
                          : isCompleted
                          ? 'bg-white border border-[#2D4A27]/40'
                          : 'bg-white/50 border border-[#E5E2D9] opacity-40'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold mb-1.5 ${
                          isCompleted ? 'bg-[#2D4A27] text-white' : 'bg-[#E5E2D9] text-[#7A7A7A]'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span className="text-[11px] font-bold text-[#1A1A1A] leading-tight">{step.label}</span>
                      <span className="text-[9px] text-[#7A7A7A] font-light mt-0.5 leading-tight">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier & Location Detail */}
            {order && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-white p-3.5 border border-[#E5E2D9]">
                  <span className="text-[#7A7A7A] block mb-1 text-[10px] uppercase font-bold tracking-wider">
                    Courier & AWB Tracking
                  </span>
                  <p className="font-bold text-[#1A1A1A]">{order.deliveryCourier || 'BlueDart Express Eco'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[11px] text-[#2D4A27] bg-[#2D4A27]/10 px-2 py-0.5">
                      {order.trackingNumber || `VB-EXP-${order.orderNumber.slice(-4)}`}
                    </span>
                    <button
                      onClick={() => handleCopyAWB(order.trackingNumber || `VB-EXP-${order.orderNumber.slice(-4)}`)}
                      className="text-[#7A7A7A] hover:text-[#1A1A1A] p-0.5"
                      title="Copy AWB Tracking Number"
                    >
                      {copiedAWB ? <Check className="w-3.5 h-3.5 text-[#2D4A27]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#7A7A7A] mt-1.5 font-light">
                    Current Location: <strong className="text-[#1A1A1A]">{order.currentLocation || 'Bengaluru Central Botanical Hub'}</strong>
                  </p>
                </div>

                <div className="bg-white p-3.5 border border-[#E5E2D9]">
                  <span className="text-[#7A7A7A] block mb-1 text-[10px] uppercase font-bold tracking-wider">
                    Shipping Address
                  </span>
                  <p className="font-bold text-[#1A1A1A]">{order.shippingAddress.fullName}</p>
                  <p className="text-[#5A5A5A] text-[11px] mt-0.5">{order.shippingAddress.street}</p>
                  <p className="text-[#5A5A5A] text-[11px]">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              </div>
            )}

            {/* Ordered Plant Items */}
            {order && order.items && (
              <div className="pt-3 border-t border-[#E5E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A] tracking-wider block mb-2">
                  Shipment Items ({order.items.length})
                </span>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2.5 border border-[#E5E2D9] text-xs">
                      <div className="flex items-center gap-3">
                        <PlantImage
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover border border-[#E5E2D9]"
                        />
                        <div>
                          <span className="font-semibold text-[#1A1A1A] block">{item.name}</span>
                          <span className="text-[10px] text-[#7A7A7A]">Qty: {item.quantity} | SKU: {item.sku}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#1A1A1A]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-wider">
            <button
              onClick={() => navigate(`/track-order?id=${encodeURIComponent(orderNumber)}`)}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Truck className="w-4 h-4" />
              Full Live Tracking Page
            </button>

            <button
              onClick={handlePrintInvoice}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#F5F2EB] hover:bg-[#E5E2D9] text-[#1A1A1A] border border-[#E5E2D9] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print / Save Invoice
            </button>

            <button
              onClick={() => navigate('/plants')}
              className="w-full sm:w-auto px-6 py-3.5 border border-[#E5E2D9] text-[#1A1A1A] hover:border-[#2D4A27] transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
