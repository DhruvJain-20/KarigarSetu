import React from 'react';
import {
  Plus,
  Sparkles,
  Mic,
  TrendingUp,
  ChevronRight,
  Package,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  Eye,
  Store,
  Compass
} from 'lucide-react';
import { ReadyProduct, ProductOrder, ArtisanUserProfile, Language } from '../types';

interface ArtisanHomeHubProps {
  language: Language;
  artisanProfile: ArtisanUserProfile;
  products: ReadyProduct[];
  orders: ProductOrder[];
  onOpenAddProduct: () => void;
  onNavigateToProducts: () => void;
  onNavigateToOrders: () => void;
  onNavigateToProfile: () => void;
  onOpenVoiceAssistant: () => void;
  onSwitchToMarketplace: () => void;
}

export function ArtisanHomeHub({
  language,
  artisanProfile,
  products,
  orders,
  onOpenAddProduct,
  onNavigateToProducts,
  onNavigateToOrders,
  onNavigateToProfile,
  onOpenVoiceAssistant,
  onSwitchToMarketplace,
}: ArtisanHomeHubProps) {
  const publishedProducts = products.filter((p) => p.status === 'published');
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const recentProducts = products.slice(0, 4);

  // Compute total sales strictly from active (non-cancelled) orders
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);

  return (
    <div className="w-full max-w-lg mx-auto pb-24 px-3 sm:px-4 pt-1 sm:pt-3 space-y-4 sm:space-y-6">
      
      {/* Top Welcome Greeting matching Screenshot 1 */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-[28px] font-bold text-stone-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
            <span>Namaste, {artisanProfile.name.split(' ')[0]}</span>
            <span className="text-xl sm:text-2xl">👋</span>
          </h1>
          <button
            onClick={onSwitchToMarketplace}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-100/80 hover:bg-amber-200/80 text-[#963E20] text-[11px] sm:text-xs font-bold transition-colors border border-amber-900/10 shrink-0 cursor-pointer"
          >
            <Store className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Buyer View</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 font-medium">
          Let’s take your craft to more customers.
        </p>
      </div>

      {/* Main + Add New Product Button matching Screenshot 1 */}
      <button
        type="button"
        onClick={onOpenAddProduct}
        className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
      >
        <Plus className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2.5]" />
        <span>Add New Product</span>
      </button>

      {/* 3 Metric Cards Triplet matching Screenshot 1 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={onNavigateToProducts}
          className="bg-white hover:bg-stone-50/90 rounded-2xl p-2.5 sm:p-3.5 border border-stone-200/80 shadow-xs text-center transition-all flex flex-col justify-center items-center cursor-pointer"
        >
          <span className="text-lg sm:text-2xl font-extrabold text-stone-900 leading-tight">
            {products.length}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 mt-1 leading-tight">
            Products<br />Listed
          </span>
        </button>

        <button
          onClick={onNavigateToOrders}
          className="bg-white hover:bg-stone-50/90 rounded-2xl p-2.5 sm:p-3.5 border border-stone-200/80 shadow-xs text-center transition-all flex flex-col justify-center items-center cursor-pointer"
        >
          <span className="text-lg sm:text-2xl font-extrabold text-stone-900 leading-tight">
            {newOrdersCount}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 mt-1 leading-tight">
            New<br />Orders
          </span>
        </button>

        <button
          onClick={onNavigateToProfile}
          className="bg-[#D1EBE1] hover:bg-[#c2e4d8] rounded-2xl p-2.5 sm:p-3.5 border border-[#B5DEC8] shadow-xs text-center transition-all flex flex-col justify-center items-center cursor-pointer"
        >
          <span className="text-base sm:text-2xl font-extrabold text-[#144738] leading-tight truncate max-w-full">
            ₹{totalSales.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#1D5C4A] mt-1 leading-tight">
            Total<br />Sales
          </span>
        </button>
      </div>

      {/* AI Artisan Tools Section matching Screenshot 1 */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 tracking-tight">
          AI Artisan Tools
        </h2>

        <div className="space-y-2.5">
          {/* AI Product Studio */}
          <div
            onClick={onOpenAddProduct}
            className="bg-[#FAF3EB] hover:bg-[#F5EAD9] rounded-3xl p-4 sm:p-4.5 border border-amber-900/10 shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#963E20] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-stone-900 group-hover:text-[#963E20] transition-colors">
                AI Product Studio
              </h3>
              <p className="text-xs text-stone-600">
                Enhance your photos instantly.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
          </div>

          {/* Voice Cataloger */}
          <div
            onClick={onOpenVoiceAssistant}
            className="bg-[#FAF3EB] hover:bg-[#F5EAD9] rounded-3xl p-4 sm:p-4.5 border border-amber-900/10 shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D1EBE1] text-[#1D5C4A] flex items-center justify-center shrink-0 shadow-xs">
              <Mic className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-stone-900 group-hover:text-[#1D5C4A] transition-colors">
                Voice Cataloger
              </h3>
              <p className="text-xs text-stone-600">
                Create listings by speaking.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
          </div>

          {/* Smart Pricing */}
          <div
            onClick={onOpenAddProduct}
            className="bg-[#FAF3EB] hover:bg-[#F5EAD9] rounded-3xl p-4 sm:p-4.5 border border-amber-900/10 shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-stone-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-stone-900 group-hover:text-stone-800 transition-colors">
                Smart Pricing
              </h3>
              <p className="text-xs text-stone-600">
                Market trends & pricing suggestions based on your craft.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Your Recent Products Section matching Screenshot 1 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            Your Recent Products
          </h2>
          <button
            onClick={onNavigateToProducts}
            className="text-xs font-bold text-[#963E20] hover:underline flex items-center gap-0.5"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                onClick={onNavigateToProducts}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative h-32 bg-stone-100 overflow-hidden">
                  <img
                    src={product.images[0] || product.aiEnhancedImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      product.status === 'published'
                        ? 'bg-[#1D5C4A] text-white'
                        : 'bg-stone-800/80 text-white'
                    }`}
                  >
                    {product.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="text-sm font-extrabold text-stone-900 mt-1">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={onOpenAddProduct}
            className="p-6 rounded-2xl bg-white border border-dashed border-stone-300 text-center cursor-pointer hover:border-[#963E20] transition-colors space-y-2"
          >
            <Package className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-xs font-bold text-stone-700">No products published yet</p>
            <p className="text-[11px] text-stone-500">Click to list your first craft item with AI Studio</p>
          </div>
        )}
      </div>

    </div>
  );
}
