import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  Check,
  Calendar,
  MessageCircle,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { updateOrderStatus, updateOrderTracking } from '../../services/orderService';
import { PlantImage } from '../../utils/imageFallback';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Comprehensive Live Tracking Edit Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>('Pending');
  const [deliveryCourier, setDeliveryCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  const statusOptions: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const courierOptions = [
    'BlueDart Express Eco',
    'Delhivery Botanical Express',
    'DTDC Green Air',
    'Ekart Logistics',
    'Shadowfax Hyperlocal',
    'India Post Speed Post',
    'Blr Local Botanical Delivery Van',
  ];

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus, `Status transitioned to ${newStatus} by Admin`);
      onRefresh();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const openTrackingModal = (ord: Order) => {
    setTrackingModalOrder(ord);
    setEditStatus(ord.orderStatus);
    setDeliveryCourier(ord.deliveryCourier || 'BlueDart Express Eco');
    setTrackingNumber(ord.trackingNumber || `B4P-EXP-${ord.orderNumber.replace(/[^0-9]/g, '')}`);
    setCurrentLocation(ord.currentLocation || 'Bengaluru Regional Botanical Sorting Center');
    setEstimatedDeliveryDate(
      ord.estimatedDeliveryDate ||
        new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
    );
    setCustomNote('');
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(
        trackingModalOrder.id,
        editStatus,
        customNote || `Tracking updated: Courier ${deliveryCourier}, AWB: ${trackingNumber}`,
        trackingNumber,
        deliveryCourier,
        currentLocation
      );
      setTrackingModalOrder(null);
      onRefresh();
      if (selectedOrder && selectedOrder.id === trackingModalOrder.id) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: editStatus,
          deliveryCourier,
          trackingNumber,
          currentLocation,
        });
      }
    } catch (err) {
      console.error('Error saving tracking:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search) ||
      o.customerName.toLowerCase().includes(search) ||
      o.customerEmail.toLowerCase().includes(search) ||
      o.customerPhone.includes(search) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search));

    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Live Engine Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Live Orders & Logistics Hub</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#2D4A27]/10 text-[#2D4A27] text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-[#5A5A5A] font-light mt-0.5">
            Monitor real-time customer orders, edit courier tracking, and update live milestone statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 bg-white border border-[#E5E2D9] hover:border-[#2D4A27] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            Refresh Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-[#E5E2D9] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order ID, customer name, phone, email or AWB number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#2D4A27]"
          />
          <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-[#E5E2D9] text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
        >
          <option value="all">All Fulfillment Statuses ({orders.length})</option>
          {statusOptions.map((st) => (
            <option key={st} value={st}>
              {st} ({orders.filter((o) => o.orderStatus === st).length})
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5E2D9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F2EB] text-[#5A5A5A] font-semibold border-b border-[#E5E2D9] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Items / Plants</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4">Courier & AWB</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2D9] text-[#1A1A1A]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#7A7A7A]">
                    No customer orders found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FDFCF9] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.orderNumber}</span>
                        {Date.now() - ord.createdAt < 3600000 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="New live order (<1 hr)" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#1A1A1A] block">{ord.customerName}</span>
                      <span className="text-[11px] text-[#7A7A7A] block">{ord.customerPhone}</span>
                      <span className="text-[10px] text-[#7A7A7A]">
                        {ord.shippingAddress.city}, {ord.shippingAddress.state}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#5A5A5A]">
                      <span className="block font-medium">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-[#7A7A7A]">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {ord.items.slice(0, 2).map((itm, i) => (
                          <PlantImage
                            key={i}
                            src={itm.image}
                            alt={itm.name}
                            className="w-7 h-7 object-cover border border-[#E5E2D9]"
                          />
                        ))}
                        {ord.items.length > 2 && (
                          <span className="text-[10px] text-[#7A7A7A] font-bold">+{ord.items.length - 2}</span>
                        )}
                        <span className="text-[11px] text-[#5A5A5A] ml-1">{ord.items.length} plants</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-[#2D4A27]/10 text-[#2D4A27]'
                            : 'bg-[#F5F2EB] text-[#8B5E3C]'
                        }`}
                      >
                        {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className="bg-white border border-[#E5E2D9] px-2 py-1 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px]">
                        <span className="font-semibold text-[#1A1A1A] block">{ord.deliveryCourier || 'Not Assigned'}</span>
                        <span className="font-mono text-[#7A7A7A] text-[10px]">
                          {ord.trackingNumber || 'No AWB'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openTrackingModal(ord)}
                          className="p-1.5 text-[#5A5A5A] hover:text-[#2D4A27] hover:bg-[#2D4A27]/5 border border-transparent hover:border-[#2D4A27]/20"
                          title="Edit Courier, AWB & Live Tracking"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 text-[#5A5A5A] hover:text-[#2D4A27] hover:bg-[#2D4A27]/5 border border-transparent hover:border-[#2D4A27]/20"
                          title="View Full Live Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Courier & Tracking Editor Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs"
            onClick={() => setTrackingModalOrder(null)}
          />

          <div className="relative bg-white border border-[#E5E2D9] max-w-lg w-full p-6 sm:p-8 z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#2D4A27]/10 text-[#2D4A27]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">Update Live Tracking</h3>
                  <span className="text-xs font-mono text-[#7A7A7A]">{trackingModalOrder.orderNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="p-1.5 text-[#7A7A7A] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1 uppercase tracking-wider text-[10px]">
                  Fulfillment Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                  className="w-full p-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#2D4A27]"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1 uppercase tracking-wider text-[10px]">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    list="couriers-list"
                    value={deliveryCourier}
                    onChange={(e) => setDeliveryCourier(e.target.value)}
                    placeholder="e.g. BlueDart Express"
                    className="w-full p-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                  <datalist id="couriers-list">
                    {courierOptions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1 uppercase tracking-wider text-[10px]">
                    AWB Tracking Number
                  </label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. VB-EXP-9842"
                    className="w-full p-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1 uppercase tracking-wider text-[10px]">
                  Current Transit Hub / Location
                </label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="e.g. Bengaluru Central Botanical Hub / Indiranagar Delivery Van"
                  className="w-full p-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1 uppercase tracking-wider text-[10px]">
                  Custom Status / Care Note for Customer
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Living specimen packed in ventilated moisture-lock crate."
                  className="w-full p-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 border border-[#E5E2D9] text-[#5A5A5A] hover:text-[#1A1A1A] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5"
                >
                  {isUpdating ? 'Saving Live...' : 'Publish Tracking Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative bg-white border border-[#E5E2D9] max-w-2xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#7A7A7A]">Order Reference</span>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-2xl text-[#1A1A1A]">{selectedOrder.orderNumber}</h3>
                  <span className="px-2 py-0.5 bg-[#2D4A27] text-white text-[10px] font-bold uppercase">
                    {selectedOrder.orderStatus}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openTrackingModal(selectedOrder)}
                  className="px-3 py-1.5 bg-[#2D4A27] text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Edit Tracking
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#F5F2EB] hover:bg-[#E5E2D9] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-[#7A7A7A] hover:text-[#1A1A1A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F5F2EB] p-4 border border-[#E5E2D9]">
              <div>
                <span className="font-bold text-[#1A1A1A] block mb-1">Customer Contact</span>
                <p className="text-[#1A1A1A] font-semibold">{selectedOrder.customerName}</p>
                <p className="text-[#5A5A5A]">{selectedOrder.customerEmail}</p>
                <p className="text-[#5A5A5A] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-[#2D4A27]" />
                  {selectedOrder.customerPhone}
                  <a
                    href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-[10px] text-[#2D4A27] font-bold underline flex items-center gap-0.5"
                  >
                    WhatsApp <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] block mb-1">Delivery Destination</span>
                <p className="text-[#1A1A1A]">{selectedOrder.shippingAddress.street}</p>
                {selectedOrder.shippingAddress.landmark && (
                  <p className="text-[#5A5A5A]">{selectedOrder.shippingAddress.landmark}</p>
                )}
                <p className="text-[#1A1A1A]">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Courier & AWB Tracker Section */}
            <div className="p-4 bg-white border border-[#E5E2D9] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7A7A7A]">Live Logistics Assignment</span>
                <p className="font-bold text-[#1A1A1A] text-sm mt-0.5">
                  {selectedOrder.deliveryCourier || 'No courier assigned yet'}
                </p>
                <span className="font-mono text-[11px] text-[#2D4A27] block">
                  AWB: {selectedOrder.trackingNumber || 'Pending AWB allocation'}
                </span>
                <p className="text-[11px] text-[#7A7A7A] mt-1">
                  Hub: <strong>{selectedOrder.currentLocation || 'Bengaluru Nursery Hub'}</strong>
                </p>
              </div>

              <a
                href={`/track-order?id=${encodeURIComponent(selectedOrder.orderNumber)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border border-[#2D4A27] text-[#2D4A27] hover:bg-[#2D4A27] hover:text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                Customer Tracking View <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A] mb-2">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-[#E5E2D9] border border-[#E5E2D9] overflow-hidden">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <PlantImage
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover border border-[#E5E2D9]"
                      />
                      <div>
                        <span className="font-semibold text-[#1A1A1A]">{item.name}</span>
                        <span className="text-[11px] text-[#7A7A7A] block font-mono">{item.sku}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#1A1A1A]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-[#7A7A7A] block font-light">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#F5F2EB] p-4 border border-[#E5E2D9] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5A5A5A]">
                <span>Items Subtotal:</span>
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#2D4A27]">
                  <span>Discount Applied ({selectedOrder.couponCode || 'PROMO'}):</span>
                  <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5A5A5A]">
                <span>Botanical Moisture-Lock Packaging & Shipping:</span>
                <span>
                  {selectedOrder.shippingCharge === 0 ? 'FREE' : `₹${selectedOrder.shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-[#5A5A5A]">
                <span>GST (18% included):</span>
                <span>₹{selectedOrder.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-2 border-t border-[#E5E2D9]">
                <span>Grand Total:</span>
                <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="pt-2">
                <span className="font-bold text-xs text-[#1A1A1A] block mb-2">Live Timeline Audit History</span>
                <div className="space-y-2 bg-[#FDFCF9] p-3 border border-[#E5E2D9] text-xs">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start justify-between border-b border-[#E5E2D9]/50 pb-1.5 last:border-0 last:pb-0">
                      <div>
                        <span className="font-bold text-[#1A1A1A]">{h.status}</span>
                        {h.note && <p className="text-[11px] text-[#5A5A5A]">{h.note}</p>}
                        {h.location && (
                          <span className="text-[10px] text-[#2D4A27] flex items-center gap-1">
                            <i className="fa-solid fa-location-dot text-emerald-700" />
                            {h.location}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#7A7A7A]">
                        {new Date(h.timestamp).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
