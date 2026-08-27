import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  Phone,
  MessageSquare,
  AlertCircle,
  FileText,
  RotateCcw,
  Star,
  Search,
  Filter,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  ShoppingBag,
  Download,
  Info
} from 'lucide-react';
import { ProductOrder, Language } from '../types';

interface BuyerPurchasesViewProps {
  language: Language;
  orders: ProductOrder[];
  onBrowseMarketplace: () => void;
  onCancelOrder?: (orderId: string) => void;
  onContactArtisan?: (artisanName: string) => void;
  onRateProduct?: (orderId: string, productId: string, rating: number, feedback: string) => void;
}

export function BuyerPurchasesView({
  language,
  orders,
  onBrowseMarketplace,
  onCancelOrder,
  onContactArtisan,
  onRateProduct,
}: BuyerPurchasesViewProps) {
  const [filter, setFilter] = useState<'all' | 'in_transit' | 'processing' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<ProductOrder | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<ProductOrder | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [ratingModalOrder, setRatingModalOrder] = useState<ProductOrder | null>(null);
  const [userRating, setUserRating] = useState(5);
  const [userFeedback, setUserFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<ProductOrder | null>(null);

  // Groupings and counts
  const underDeliveryOrders = orders.filter((o) => o.status === 'shipped' || o.status === 'new' || o.status === 'processing');
  const inTransitCount = orders.filter((o) => o.status === 'shipped').length;
  const processingCount = orders.filter((o) => o.status === 'new' || o.status === 'processing').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredOrders = orders.filter((order) => {
    // Filter tab
    if (filter === 'in_transit' && order.status !== 'shipped') return false;
    if (filter === 'processing' && (order.status !== 'processing' && order.status !== 'new')) return false;
    if (filter === 'delivered' && order.status !== 'delivered') return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.productName.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.artisanName.toLowerCase().includes(q) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const getStatusBadge = (status: ProductOrder['status']) => {
    switch (status) {
      case 'shipped':
        return (
          <span className="px-3 py-1 rounded-full bg-[#D1EBE1] text-[#1D5C4A] text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-[#B5DEC8]">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            <span>In Transit • Under Delivery</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Artisan Packing & QA</span>
          </span>
        );
      case 'new':
        return (
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1.5 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Placed & Confirmed</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered Successfully</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const getTrackingMilestones = (order: ProductOrder) => {
    const isDelivered = order.status === 'delivered';
    const isShipped = order.status === 'shipped' || isDelivered;
    const isProcessing = order.status === 'processing' || isShipped;
    const isNew = true;

    return [
      {
        title: 'Order Confirmed',
        description: `Verified payment via ${order.paymentMethod}`,
        date: order.orderedAt ? new Date(order.orderedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Confirmed',
        completed: isNew,
        current: order.status === 'new',
      },
      {
        title: 'Crafted & Packed by Artisan',
        description: `Inspected at ${order.artisanName}'s workshop`,
        date: isProcessing ? 'Handcrafted with care' : 'In production',
        completed: isProcessing,
        current: order.status === 'processing',
      },
      {
        title: 'Handed to Courier Partner',
        description: `${order.trackingNumber || 'DTDC Express Logistics'}`,
        date: isShipped ? `Estimated by ${order.estimatedDelivery}` : 'Dispatching soon',
        completed: isShipped,
        current: order.status === 'shipped',
      },
      {
        title: 'Delivered at Doorstep',
        description: order.buyerAddress,
        date: isDelivered ? 'Handed over' : `Expected by ${order.estimatedDelivery}`,
        completed: isDelivered,
        current: isDelivered,
      },
    ];
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-28 px-3 sm:px-4 pt-2 space-y-6">
      
      {/* Top Banner / Heading */}
      <div className="bg-gradient-to-br from-[#FAF3EB] via-white to-amber-50 rounded-3xl p-5 sm:p-7 border border-amber-900/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1EBE1] text-[#1D5C4A] text-xs font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>Live Order Tracking & Purchases</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
            {language === 'hi' ? 'मेरे खरीदे गए उत्पाद व डिलीवरी' : 'My Purchases & Delivery Tracking'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {language === 'hi'
              ? 'आपके द्वारा खरीदे गए प्रामाणिक हस्तशिल्प और उनकी लाइव डिलीवरी स्थिति को यहां ट्रैक करें।'
              : 'Track the live transit status of authentic artisanal crafts you ordered directly from Indian master craftsmen.'}
          </p>
        </div>

        <button
          onClick={onBrowseMarketplace}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-transform active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse More Crafts</span>
        </button>
      </div>

      {/* 3 Quick Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-[#963E20] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-500">Total Items Purchased</div>
            <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{orders.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#B5DEC8] bg-[#F4FAF7] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D1EBE1] text-[#1D5C4A] flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1D5C4A]">Under Delivery / Active</div>
            <div className="text-2xl font-extrabold text-[#144738] mt-0.5 flex items-center gap-2">
              <span>{underDeliveryOrders.length}</span>
              {underDeliveryOrders.length > 0 && (
                <span className="text-[11px] font-semibold bg-[#1D5C4A] text-white px-2 py-0.5 rounded-full">
                  {inTransitCount} In Transit
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#963E20]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-500">Direct Artisan Impact</div>
            <div className="text-2xl font-extrabold text-[#963E20] mt-0.5">
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by product name, order #, artisan, or tracking number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#963E20] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-[#963E20] text-white shadow-2xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
            }`}
          >
            All Purchases ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('in_transit')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'in_transit'
                ? 'bg-[#1D5C4A] text-white shadow-2xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Under Delivery / In Transit ({inTransitCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'processing'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Being Prepared / Packing ({processingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'delivered'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered ({deliveredCount})</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isUnderDelivery = order.status === 'shipped' || order.status === 'processing' || order.status === 'new';

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Order Header: Order #, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-stone-100 gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-stone-500">
                      Ordered on {new Date(order.orderedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-medium">
                    Artisan Workshop:{' '}
                    <span className="font-bold text-[#963E20]">{order.artisanName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Main Product Info & Image */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 text-base sm:text-lg leading-snug">
                      {order.productName}
                    </h3>
                    <div className="text-xs text-stone-500 font-medium">
                      Quantity: <span className="font-bold text-stone-800">{order.quantity}</span> • Unit Price: ₹{order.unitPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-lg font-extrabold text-[#963E20]">
                      Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-stone-500 ml-2">
                        ({order.paymentMethod} • {order.paymentStatus.toUpperCase()})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Estimate Box */}
                <div className="w-full sm:w-auto bg-[#FAF7F2] rounded-2xl p-3.5 border border-amber-900/10 space-y-1 sm:text-right">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    {order.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                  </div>
                  <div className="text-sm font-extrabold text-[#1D5C4A] flex items-center sm:justify-end gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1D5C4A]" />
                    <span>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-[11px] font-mono text-stone-600 flex items-center sm:justify-end gap-1">
                      <span>Ref: {order.trackingNumber}</span>
                      <button
                        onClick={() => copyToClipboard(order.trackingNumber!)}
                        className="text-stone-400 hover:text-stone-800"
                        title="Copy tracking number"
                      >
                        {copiedTracking === order.trackingNumber ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Progress Bar for In-Transit / Processing */}
              {isUnderDelivery && (
                <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-[#B5DEC8]/60 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1D5C4A] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 animate-bounce" />
                      <span>
                        {order.status === 'shipped'
                          ? 'Package is in transit with logistics courier'
                          : order.status === 'processing'
                          ? 'Artisan is crafting and preparing the packaging'
                          : 'Order received by the master artisan workshop'}
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">
                      Destination: {order.buyerAddress.split(',')[0]}
                    </span>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-1">
                    {[
                      { label: 'Confirmed', done: true },
                      { label: 'Crafting', done: order.status !== 'new' },
                      { label: 'In Transit', done: order.status === 'shipped' || order.status === 'delivered' },
                      { label: 'Delivered', done: order.status === 'delivered' },
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            step.done ? 'bg-[#1D5C4A]' : 'bg-stone-200'
                          }`}
                        />
                        <div className="text-[10px] font-bold text-center text-stone-600 truncate">
                          {step.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForTracking(order)}
                    className="px-4 py-2.5 rounded-xl bg-[#1D5C4A] hover:bg-[#144738] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Live Tracking Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderForInvoice(order)}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>View Receipt</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'delivered' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRatingModalOrder(order);
                        setUserRating(order.userRating || 5);
                        setUserFeedback(order.userReview || '');
                        setRatingSubmitted(false);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border ${
                        order.isRated
                          ? 'bg-amber-100/70 text-[#963E20] border-amber-300'
                          : 'bg-amber-50 hover:bg-amber-100 text-[#963E20] border-amber-200/60'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{order.isRated ? `Rated ★ ${order.userRating}/5` : 'Rate Product & Artisan'}</span>
                    </button>
                  )}

                  {(order.status === 'new' || order.status === 'processing') && onCancelOrder && (
                    <button
                      type="button"
                      onClick={() => setOrderToCancel(order)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}

                  <a
                    href={`tel:${order.buyerPhone}`}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    title="Artisan Support"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#963E20]" />
                    <span>Support</span>
                  </a>
                </div>
              </div>

              {/* User Submitted Rating Box */}
              {order.isRated && (
                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (order.userRating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-amber-950">
                      Your Review: {order.userRating}/5 Stars
                    </span>
                    {order.userReview && (
                      <span className="text-stone-700 italic line-clamp-1">
                        "{order.userReview}"
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRatingModalOrder(order);
                      setUserRating(order.userRating || 5);
                      setUserFeedback(order.userReview || '');
                      setRatingSubmitted(false);
                    }}
                    className="text-[11px] font-bold text-[#963E20] hover:underline self-end sm:self-auto cursor-pointer"
                  >
                    Edit Review
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#963E20] flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-900">
                {searchQuery ? 'No matching orders found' : 'No purchases yet in this section'}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {searchQuery
                  ? 'Try searching with a different product name or order number.'
                  : 'Support authentic Indian master craftsmen by purchasing handmade textiles, woodwork, brass decor, and pottery.'}
              </p>
            </div>
            <button
              onClick={onBrowseMarketplace}
              className="px-6 py-3 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              Explore Ready Handcrafted Products
            </button>
          </div>
        )}
      </div>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-900">Cancel This Order?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to cancel order #{orderToCancel.orderNumber}?
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3 text-left flex items-center gap-3 border border-stone-200">
              <img
                src={orderToCancel.productImage}
                alt={orderToCancel.productName}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-stone-900 truncate">
                  {orderToCancel.productName}
                </div>
                <div className="text-[11px] text-stone-500">
                  Total: ₹{orderToCancel.totalAmount.toLocaleString('en-IN')} ({orderToCancel.paymentMethod})
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-left border border-amber-200/70 text-[11px] text-amber-900 space-y-0.5">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Instant Cancellation & Refund
              </div>
              <p>100% of your paid amount will be refunded back to your original payment method.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onCancelOrder) {
                    onCancelOrder(orderToCancel.id);
                  }
                  setOrderToCancel(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING MODAL */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-amber-900/10 space-y-5 animate-in fade-in zoom-in-95 my-8">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#1D5C4A] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  Live Shipment Tracker
                </span>
                <h3 className="text-xl font-bold text-stone-900">
                  Order #{selectedOrderForTracking.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200 flex items-center gap-3">
              <img
                src={selectedOrderForTracking.productImage}
                alt={selectedOrderForTracking.productName}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {selectedOrderForTracking.productName}
                </h4>
                <p className="text-xs text-stone-500">
                  By {selectedOrderForTracking.artisanName}
                </p>
                <div className="text-xs font-bold text-[#963E20]">
                  ₹{selectedOrderForTracking.totalAmount.toLocaleString('en-IN')} (Qty: {selectedOrderForTracking.quantity})
                </div>
              </div>
            </div>

            {/* Tracking Reference & Courier Details */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-500 font-medium">Logistics Partner</span>
                <div className="font-bold text-stone-900 mt-0.5">DTDC Express India</div>
              </div>
              <div>
                <span className="text-stone-500 font-medium">AWB Tracking Number</span>
                <div className="font-mono font-bold text-[#1D5C4A] mt-0.5 flex items-center gap-1">
                  <span>{selectedOrderForTracking.trackingNumber || 'DTDC-IND-99821'}</span>
                  <button
                    onClick={() => copyToClipboard(selectedOrderForTracking.trackingNumber || 'DTDC-IND-99821')}
                    className="text-stone-400 hover:text-stone-800"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="col-span-2 pt-2 border-t border-stone-100">
                <span className="text-stone-500 font-medium">Delivery Destination</span>
                <div className="font-medium text-stone-800 mt-0.5">
                  {selectedOrderForTracking.buyerAddress}
                </div>
              </div>
            </div>

            {/* Step-by-Step Milestones Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Milestones & Status History
              </h4>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-4">
                {getTrackingMilestones(selectedOrderForTracking).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Circle icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        step.completed
                          ? 'bg-[#1D5C4A] text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {step.completed ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Connecting line */}
                    {idx < 3 && (
                      <div
                        className={`absolute left-3.5 top-7 w-0.5 h-8 -translate-x-1/2 ${
                          step.completed ? 'bg-[#1D5C4A]' : 'bg-stone-200'
                        }`}
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-baseline">
                        <div className={`text-xs font-bold ${step.completed ? 'text-stone-900' : 'text-stone-500'}`}>
                          {step.title}
                        </div>
                        <div className="text-[10px] text-stone-400 font-medium">{step.date}</div>
                      </div>
                      <div className="text-[11px] text-stone-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="w-full py-3 rounded-2xl bg-[#963E20] text-white font-bold text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT / INVOICE MODAL */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in my-8">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#963E20] uppercase tracking-wider">
                  Official Artisan Receipt
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  KarigarSetu Invoice
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl space-y-1">
                <div className="flex justify-between text-stone-500">
                  <span>Order Reference:</span>
                  <span className="font-mono font-bold text-stone-900">#{selectedOrderForInvoice.orderNumber}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Date of Purchase:</span>
                  <span className="font-medium text-stone-900">
                    {new Date(selectedOrderForInvoice.orderedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Master Artisan:</span>
                  <span className="font-bold text-[#963E20]">{selectedOrderForInvoice.artisanName}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-stone-800">Item Summary:</div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <div>
                    <div className="font-bold text-stone-900">{selectedOrderForInvoice.productName}</div>
                    <div className="text-[11px] text-stone-500">Qty: {selectedOrderForInvoice.quantity} x ₹{selectedOrderForInvoice.unitPrice}</div>
                  </div>
                  <div className="font-bold text-stone-900">
                    ₹{selectedOrderForInvoice.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Direct Artisan Handcraft Fee:</span>
                  <span>₹{selectedOrderForInvoice.totalAmount}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Platform Commission:</span>
                  <span className="text-[#1D5C4A] font-bold">₹0.00 (0% Zero Commission)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Standard Shipping & Packaging:</span>
                  <span className="text-[#1D5C4A] font-bold">Free</span>
                </div>
                <div className="flex justify-between font-extrabold text-stone-900 text-sm pt-2 border-t border-stone-200">
                  <span>Total Paid:</span>
                  <span className="text-[#963E20]">₹{selectedOrderForInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-[#D1EBE1] p-3 rounded-xl border border-[#B5DEC8] text-[#144738] text-[11px] space-y-0.5 font-medium">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Direct Payout to Artisan
                </div>
                <div>Your entire purchase amount goes straight to support the artisan’s family and craft heritage.</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="flex-1 py-3 rounded-2xl bg-[#963E20] text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RATING & FEEDBACK MODAL */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-stone-900 text-base">Rate Product & Artisan</h3>
              <button
                onClick={() => setRatingModalOrder(null)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ratingSubmitted ? (
              <div className="py-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#D1EBE1] text-[#1D5C4A] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-stone-900">Thank You for Supporting Artisans!</h4>
                <p className="text-xs text-stone-500">
                  Your {userRating}-star rating and review have been published to {ratingModalOrder.artisanName}'s verified product record.
                </p>
                <button
                  onClick={() => setRatingModalOrder(null)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#963E20] text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl">
                  <img
                    src={ratingModalOrder.productImage}
                    alt={ratingModalOrder.productName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs truncate max-w-[200px]">{ratingModalOrder.productName}</h4>
                    <p className="text-[11px] text-stone-500">{ratingModalOrder.artisanName}</p>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-xs font-bold text-stone-700">How was the craft quality & finish?</div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 text-2xl transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= userRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">Add words of appreciation for the karigar:</label>
                  <textarea
                    rows={2}
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    placeholder="e.g. Exceptional handcrafting, loved the packaging and authentic feel!"
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#963E20] resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onRateProduct && ratingModalOrder) {
                      onRateProduct(
                        ratingModalOrder.id,
                        ratingModalOrder.productId,
                        userRating,
                        userFeedback
                      );
                    }
                    setRatingSubmitted(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-[#963E20] text-white font-bold text-xs shadow-sm cursor-pointer hover:bg-[#80341A] transition-colors"
                >
                  Submit Artisan Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
