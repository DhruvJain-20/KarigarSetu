import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  CheckCircle2,
  Heart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MapPin,
  Package,
  Truck,
  Check,
  X,
  CreditCard,
  Building2,
  ChevronRight,
  Info
} from 'lucide-react';
import { ReadyProduct, ProductOrder, Language } from '../types';
import { BuyerPurchasesView } from './BuyerPurchasesView';

interface MarketplaceStorefrontProps {
  language: Language;
  products: ReadyProduct[];
  orders: ProductOrder[];
  onProductOrdered: (order: ProductOrder) => void;
  onCancelOrder?: (orderId: string) => void;
  onSwitchToArtisan: () => void;
  initialTab?: 'browse' | 'purchases';
}

const CATEGORIES = [
  'All',
  'Textiles',
  'Woodwork',
  'Pottery',
  'Metalwork',
  'Home Decor',
  'Leather & Craft',
];

export function MarketplaceStorefront({
  language,
  products,
  orders,
  onProductOrdered,
  onCancelOrder,
  onSwitchToArtisan,
  initialTab = 'browse',
}: MarketplaceStorefrontProps) {
  const [storeTab, setStoreTab] = useState<'browse' | 'purchases'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<ReadyProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<ProductOrder | null>(null);

  // Active delivery count
  const activeDeliveryCount = orders.filter(
    (o) => o.status === 'shipped' || o.status === 'processing' || o.status === 'new'
  ).length;

  // Checkout form state
  const [buyerName, setBuyerName] = useState('Pooja Malhotra');
  const [buyerPhone, setBuyerPhone] = useState('+91 98100 88776');
  const [buyerAddress, setBuyerAddress] = useState('Flat 502, Prestige Tower, Sector 54, Gurugram, Haryana - 122002');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash on Delivery' | 'Card'>('UPI');

  const publishedProducts = products.filter((p) => p.status === 'published');

  const filteredProducts = publishedProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.craftType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForBuy) return;

    const total = selectedProductForBuy.price * quantity;
    const newOrder: ProductOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `KS-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: selectedProductForBuy.id,
      productName: selectedProductForBuy.name,
      productImage: selectedProductForBuy.images[0] || selectedProductForBuy.aiEnhancedImage || '',
      artisanId: selectedProductForBuy.artisanId,
      artisanName: selectedProductForBuy.artisanName,
      buyerName: buyerName.trim() || 'Direct Customer',
      buyerPhone: buyerPhone.trim() || '+91 98000 00000',
      buyerAddress: buyerAddress.trim() || 'India',
      buyerType: 'Direct Consumer',
      quantity,
      unitPrice: selectedProductForBuy.price,
      totalAmount: total,
      status: 'new',
      orderedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      trackingNumber: `DTDC-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid',
    };

    onProductOrdered(newOrder);
    setIsCheckoutOpen(false);
    setOrderSuccess(newOrder);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-28 px-3 sm:px-4 pt-2 space-y-6">
      
      {/* Sub-Header Navigation: Browse Crafts vs My Purchases */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStoreTab('browse')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              storeTab === 'browse'
                ? 'bg-[#963E20] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{language === 'hi' ? 'कारीगरी उत्पाद खरीदें' : 'Browse & Buy Crafts'}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              storeTab === 'browse' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {publishedProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStoreTab('purchases')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              storeTab === 'purchases'
                ? 'bg-[#1D5C4A] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{language === 'hi' ? 'मेरे खरीदे उत्पाद व डिलीवरी' : 'My Purchases & Delivery'}</span>
            {activeDeliveryCount > 0 ? (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                storeTab === 'purchases' ? 'bg-white text-[#1D5C4A]' : 'bg-[#D1EBE1] text-[#1D5C4A]'
              }`}>
                {activeDeliveryCount} Under Delivery
              </span>
            ) : (
              <span className="text-[11px] px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded-full">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onSwitchToArtisan}
          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#963E20] text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-200 self-end sm:self-auto"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Artisan Seller Hub</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* VIEW: MY PURCHASES & LIVE TRACKING */}
      {storeTab === 'purchases' ? (
        <BuyerPurchasesView
          language={language}
          orders={orders}
          onBrowseMarketplace={() => setStoreTab('browse')}
          onCancelOrder={onCancelOrder}
        />
      ) : (
        /* VIEW: BROWSE READY CRAFTS */
        <div className="space-y-6">
          {/* Marketplace Banner */}
          <div className="bg-gradient-to-br from-[#FAF3EB] via-white to-amber-50 rounded-3xl p-6 border border-amber-900/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1EBE1] text-[#1D5C4A] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                100% Direct from Master Karigars
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
                Artisanal Crafts & Ready Products
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Buy authentic handloom, woodwork, terracotta, and heritage crafts directly from verified Indian artisans with zero middleman markup.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {activeDeliveryCount > 0 && (
                <button
                  onClick={() => setStoreTab('purchases')}
                  className="px-4 py-3 rounded-2xl bg-[#D1EBE1] hover:bg-[#c2e4d8] text-[#1D5C4A] font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Truck className="w-4 h-4 animate-bounce" />
                  <span>Track {activeDeliveryCount} In-Transit Orders</span>
                </button>
              )}
              <button
                onClick={onSwitchToArtisan}
                className="px-4 py-3 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2"
              >
                <span>Sell Your Craft</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search handloom sarees, rosewood boxes, pottery, brass diyas..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs text-sm font-medium text-stone-800 focus:outline-none focus:border-[#963E20]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#963E20] text-white shadow-xs'
                      : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-56 bg-stone-100 overflow-hidden">
                  <img
                    src={product.images[0] || product.aiEnhancedImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1D5C4A]/90 backdrop-blur text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Handmade
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-900/80 backdrop-blur text-white text-[11px] font-semibold">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-semibold text-stone-600 truncate max-w-[180px]">
                        {product.craftType}
                      </span>
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{product.rating}</span>
                        <span className="text-stone-400">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-stone-900 text-lg group-hover:text-[#963E20] transition-colors leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Artisan line */}
                    <div className="pt-1 flex items-center gap-2 text-xs text-stone-700">
                      <div className="w-5 h-5 rounded-full bg-[#963E20] text-white flex items-center justify-center text-[10px] font-bold">
                        {product.artisanName.charAt(0)}
                      </div>
                      <span className="font-medium truncate">{product.artisanName}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500 text-[11px] flex items-center gap-0.5 shrink-0">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {product.artisanCity}
                      </span>
                    </div>
                  </div>

                  {/* Price & Buy Button */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-[#963E20]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#1D5C4A] font-semibold flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Free Direct Delivery
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProductForBuy(product);
                        setQuantity(1);
                        setIsCheckoutOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedProductForBuy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#963E20] uppercase tracking-wider">
                  Direct Artisan Purchase
                </span>
                <h3 className="text-xl font-bold text-stone-900">
                  Instant Checkout
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Product Summary */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex items-center gap-4">
              <img
                src={selectedProductForBuy.images[0] || selectedProductForBuy.aiEnhancedImage}
                alt={selectedProductForBuy.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {selectedProductForBuy.name}
                </h4>
                <p className="text-xs text-stone-500 truncate">
                  Crafted by {selectedProductForBuy.artisanName} • {selectedProductForBuy.artisanCity}
                </p>
                <div className="text-sm font-extrabold text-[#963E20] mt-1">
                  ₹{selectedProductForBuy.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Buyer Full Name</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 font-medium focus:outline-none focus:border-[#963E20]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 font-medium focus:outline-none focus:border-[#963E20]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Quantity</label>
                  <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 bg-stone-100 font-bold hover:bg-stone-200"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-bold text-sm">{quantity}</div>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 bg-stone-100 font-bold hover:bg-stone-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 font-medium focus:outline-none focus:border-[#963E20] resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / GPay / PhonePe' },
                    { id: 'Card', label: 'Debit / Credit Card' },
                    { id: 'Cash on Delivery', label: 'Cash on Delivery' },
                  ].map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as typeof paymentMethod)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        paymentMethod === pm.id
                          ? 'border-[#963E20] bg-amber-50/70 text-[#963E20]'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total & Direct payout badge */}
              <div className="bg-[#FAF3E7] p-3.5 rounded-2xl border border-amber-900/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Grand Total (Free Shipping)</div>
                  <div className="text-xl font-extrabold text-[#963E20]">
                    ₹{(selectedProductForBuy.price * quantity).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-[10px] text-[#1D5C4A] font-bold bg-white px-2.5 py-1 rounded-full border border-[#B5DEC8]">
                  Verified Direct Payout
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm sm:text-base transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirm & Place Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#D1EBE1] text-[#1D5C4A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-stone-900">Order Confirmed!</h3>
              <p className="text-xs text-stone-600">
                Order #{orderSuccess.orderNumber} has been received by {orderSuccess.artisanName}.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Item:</span>
                <span className="font-bold text-stone-800">{orderSuccess.productName} (x{orderSuccess.quantity})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Amount:</span>
                <span className="font-bold text-[#963E20]">₹{orderSuccess.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tracking:</span>
                <span className="font-mono text-[#1D5C4A] font-bold">{orderSuccess.trackingNumber}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setStoreTab('purchases');
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1D5C4A] hover:bg-[#144738] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <Truck className="w-4 h-4" />
                <span>Track Delivery Status</span>
              </button>

              <button
                onClick={() => setOrderSuccess(null)}
                className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
