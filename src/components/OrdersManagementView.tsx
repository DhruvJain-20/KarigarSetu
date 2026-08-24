import React, { useState } from 'react';
import {
  Phone,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  X,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { ProductOrder, Language } from '../types';

interface OrdersManagementViewProps {
  language: Language;
  orders: ProductOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: ProductOrder['status']) => void;
}

export function OrdersManagementView({
  language,
  orders,
  onUpdateOrderStatus,
}: OrdersManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'processing' | 'shipped' | 'delivered'>('new');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ProductOrder | null>(null);
  const [callingOrder, setCallingOrder] = useState<ProductOrder | null>(null);

  const newCount = orders.filter((o) => o.status === 'new').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const getStatusStepIndex = (status: ProductOrder['status']) => {
    switch (status) {
      case 'new':
        return 0; // Ordered
      case 'processing':
        return 1; // Processed
      case 'shipped':
        return 2; // Shipped
      case 'delivered':
        return 3; // Delivered
      default:
        return 0;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-2 space-y-5">
      
      {/* Title Header matching Screenshot 6 */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-[28px] font-bold text-stone-900 tracking-tight">
          Your Orders
        </h1>
        <p className="text-sm text-stone-600 font-medium">
          Manage and track your customer orders.
        </p>
      </div>

      {/* Tabs matching Screenshot 6 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'new'
              ? 'bg-[#D1EBE1] text-[#1D5C4A] shadow-xs'
              : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
          }`}
        >
          <span>New</span>
          <span className="w-4 h-4 rounded-full bg-[#1D5C4A] text-white text-[10px] flex items-center justify-center">
            {newCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('processing')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'processing'
              ? 'bg-[#D1EBE1] text-[#1D5C4A] shadow-xs'
              : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
          }`}
        >
          <span>Processing</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-300 text-stone-800 text-[10px]">
            {processingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shipped')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'shipped'
              ? 'bg-[#D1EBE1] text-[#1D5C4A] shadow-xs'
              : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
          }`}
        >
          <span>Shipped</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-300 text-stone-800 text-[10px]">
            {shippedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivered')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'delivered'
              ? 'bg-[#D1EBE1] text-[#1D5C4A] shadow-xs'
              : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
          }`}
        >
          <span>Delivered ({deliveredCount})</span>
        </button>
      </div>

      {/* Orders Cards matching Screenshot 6 */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const stepIndex = getStatusStepIndex(order.status);
          const initialLetter = order.buyerName.charAt(0).toUpperCase();

          return (
            <div
              key={order.id}
              className="bg-[#FAF3E7] rounded-3xl p-5 border border-amber-900/10 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Buyer Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#963E20] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    {initialLetter}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base leading-tight">
                      {order.buyerName}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {order.buyerType || 'Buyer'}
                    </p>
                  </div>
                </div>

                {/* Status Tag matching Screenshot 6 */}
                {order.status === 'shipped' ? (
                  <span className="px-3 py-1 rounded-full bg-[#D1EBE1] text-[#1D5C4A] text-xs font-bold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Shipped
                  </span>
                ) : order.status === 'new' ? (
                  <span className="px-3 py-1 rounded-full bg-[#FCE8E6] text-[#C5221F] text-xs font-bold flex items-center gap-1 border border-[#FAD2CF]">
                    <Clock className="w-3.5 h-3.5" />
                    New
                  </span>
                ) : order.status === 'processing' ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5" />
                    Processing
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivered
                  </span>
                )}
              </div>

              {/* Product Item Box matching Screenshot 6 */}
              <div className="bg-white rounded-2xl p-4 border border-amber-900/5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 text-sm">
                    {order.productName}{' '}
                    <span className="text-stone-500 font-normal text-xs">(x{order.quantity})</span>
                  </h4>
                  <div className="text-lg font-extrabold text-[#963E20]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="w-16 h-16 rounded-xl object-cover border border-stone-100 shrink-0"
                />
              </div>

              {/* Progress Stepper Timeline matching Screenshot 6 */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-[11px] font-semibold text-stone-600 px-0.5">
                  <span className={stepIndex >= 0 ? 'text-stone-900 font-bold' : 'text-stone-400'}>
                    Ordered
                  </span>
                  <span className={stepIndex >= 1 ? 'text-stone-900 font-bold' : 'text-stone-400'}>
                    Processed
                  </span>
                  <span className={stepIndex >= 2 ? 'text-stone-900 font-bold' : 'text-stone-400'}>
                    Shipped
                  </span>
                  <span className={stepIndex >= 3 ? 'text-stone-900 font-bold' : 'text-stone-400'}>
                    Delivered
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="relative h-2 bg-stone-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      order.status === 'shipped' || order.status === 'delivered'
                        ? 'bg-[#1D5C4A]'
                        : order.status === 'processing'
                        ? 'bg-amber-600'
                        : 'bg-[#963E20]'
                    }`}
                    style={{
                      width:
                        stepIndex === 0
                          ? '25%'
                          : stepIndex === 1
                          ? '50%'
                          : stepIndex === 2
                          ? '75%'
                          : '100%',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons matching Screenshot 6 */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCallingOrder(order)}
                  className="py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-4 h-4 text-[#963E20]" />
                  Call Buyer
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForDetails(order)}
                  className="py-3 px-4 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-300 p-8 space-y-2">
            <PackageCheck className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-stone-600 text-sm font-semibold">
              No orders currently in '{activeTab}' state.
            </p>
          </div>
        )}
      </div>

      {/* Call Buyer Contact Drawer Modal */}
      {callingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-stone-900 text-base">Contact Buyer</h3>
              <button
                onClick={() => setCallingOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#963E20] font-bold text-2xl flex items-center justify-center mx-auto mb-2">
                {callingOrder.buyerName.charAt(0)}
              </div>
              <h4 className="font-bold text-stone-900 text-lg">{callingOrder.buyerName}</h4>
              <p className="text-sm font-bold text-stone-700">{callingOrder.buyerPhone}</p>
              <p className="text-xs text-stone-500">{callingOrder.buyerAddress}</p>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${callingOrder.buyerPhone}`}
                className="w-full py-3 rounded-2xl bg-[#1D5C4A] hover:bg-[#144738] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                Call Directly
              </a>
              <button
                onClick={() => setCallingOrder(null)}
                className="w-full py-3 rounded-2xl bg-stone-100 text-stone-700 font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal with Status Advancer */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-900/10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#963E20] uppercase tracking-wider">
                  Order Slip #{selectedOrderForDetails.orderNumber}
                </span>
                <h3 className="text-xl font-bold text-stone-900">
                  {selectedOrderForDetails.productName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order specs */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Customer</span>
                <span className="font-bold text-stone-900">{selectedOrderForDetails.buyerName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Delivery Address</span>
                <span className="font-medium text-stone-800 text-right max-w-[200px]">
                  {selectedOrderForDetails.buyerAddress}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Payment</span>
                <span className="font-bold text-[#1D5C4A]">
                  {selectedOrderForDetails.paymentMethod} ({selectedOrderForDetails.paymentStatus.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Quantity & Price</span>
                <span className="font-bold text-stone-900">
                  {selectedOrderForDetails.quantity} unit(s) @ ₹{selectedOrderForDetails.unitPrice} = ₹{selectedOrderForDetails.totalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tracking Code</span>
                <span className="font-mono font-bold text-stone-700">
                  {selectedOrderForDetails.trackingNumber || 'Pending'}
                </span>
              </div>
            </div>

            {/* Change Status Fast Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-stone-700">Update Order Status:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(selectedOrderForDetails.id, 'processing');
                    setSelectedOrderForDetails((prev) => prev ? { ...prev, status: 'processing' } : null);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border ${
                    selectedOrderForDetails.status === 'processing'
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  Mark Processed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(selectedOrderForDetails.id, 'shipped');
                    setSelectedOrderForDetails((prev) => prev ? { ...prev, status: 'shipped' } : null);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border ${
                    selectedOrderForDetails.status === 'shipped'
                      ? 'bg-[#1D5C4A] text-white border-[#144738]'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  Mark Shipped
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(selectedOrderForDetails.id, 'delivered');
                    setSelectedOrderForDetails((prev) => prev ? { ...prev, status: 'delivered' } : null);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border ${
                    selectedOrderForDetails.status === 'delivered'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  Mark Delivered
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrderForDetails(null)}
              className="w-full py-3 rounded-2xl bg-[#963E20] text-white font-bold text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
