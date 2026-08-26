import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  CheckCircle2,
  Trash2,
  ShoppingBag,
  ExternalLink,
  Package,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { ReadyProduct, Language } from '../types';

interface ProductsCatalogViewProps {
  language: Language;
  products: ReadyProduct[];
  onOpenAddProduct: () => void;
  onEditProduct?: (product: ReadyProduct) => void;
  onToggleStatus?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  onViewAsBuyer?: (product: ReadyProduct) => void;
  onUpdateStock?: (productId: string, newStock: number) => void;
}

export function ProductsCatalogView({
  language,
  products,
  onOpenAddProduct,
  onEditProduct,
  onToggleStatus,
  onDeleteProduct,
  onViewAsBuyer,
  onUpdateStock,
}: ProductsCatalogViewProps) {
  const [restockModalProduct, setRestockModalProduct] = useState<ReadyProduct | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(5);

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalProduct || !onUpdateStock) return;
    onUpdateStock(restockModalProduct.id, Math.max(0, restockAmount));
    setRestockModalProduct(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-2 space-y-5">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-[28px] font-bold text-stone-900 tracking-tight">
            Your Products
          </h1>
          <p className="text-sm text-stone-600 font-medium">
            Manage your live craft catalog ({products.length} {products.length === 1 ? 'item' : 'items'})
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddProduct}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#963E20] hover:bg-[#80341A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Product List Cards */}
      <div className="space-y-4">
        {products.map((product) => {
          const isOutOfStock = product.stock <= 0 || product.status === 'sold_out';

          return (
            <div
              key={product.id}
              className={`bg-white rounded-3xl overflow-hidden border transition-all ${
                isOutOfStock
                  ? 'border-red-200/90 shadow-xs'
                  : 'border-stone-200/90 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Product Image Header with Pill */}
              <div className="relative h-48 sm:h-52 bg-stone-100 overflow-hidden">
                <img
                  src={product.images[0] || product.aiEnhancedImage}
                  alt={product.name}
                  className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale-[30%]' : ''}`}
                />
                
                {/* Status Badge */}
                <div className="absolute top-3.5 left-3.5">
                  {isOutOfStock ? (
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Out of Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#1D5C4A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock ({product.stock})
                    </span>
                  )}
                </div>

                {onViewAsBuyer && (
                  <button
                    onClick={() => onViewAsBuyer(product)}
                    className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-stone-800 text-xs font-bold shadow-xs hover:bg-white flex items-center gap-1"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Product Info Section */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-stone-900 leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium shrink-0">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-[#963E20]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Stock status & Actions */}
                <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2 font-medium">
                    {isOutOfStock ? (
                      <span className="text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        0 available (Sold out)
                      </span>
                    ) : (
                      <span className="text-stone-700 flex items-center gap-1 bg-stone-50 px-2.5 py-1 rounded-lg">
                        <Package className="w-3.5 h-3.5 text-[#1D5C4A]" />
                        In Stock: <strong className="text-stone-900 font-extrabold">{product.stock}</strong> units
                      </span>
                    )}

                    {/* Quick Restock button */}
                    {onUpdateStock && (
                      <button
                        type="button"
                        onClick={() => {
                          setRestockModalProduct(product);
                          setRestockAmount(product.stock > 0 ? product.stock + 5 : 5);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#963E20] font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isOutOfStock ? 'Restock' : 'Adjust Stock'}</span>
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {onEditProduct && (
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteProduct && (
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product.id)}
                        className="w-9 h-9 rounded-full bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-300 p-8 space-y-3">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-stone-600 text-sm font-semibold">
              No products found in your artisan catalog.
            </p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Add your handmade crafts here. Once published, buyers across the platform can discover and purchase them in Shop Crafts!
            </p>
            <button
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 rounded-xl bg-[#963E20] text-white text-xs font-bold shadow-xs hover:bg-[#80341A]"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Product Button for mobile */}
      <div className="fixed bottom-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-30">
        <button
          type="button"
          onClick={onOpenAddProduct}
          className="py-3.5 px-6 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Restock Inventory Modal */}
      {restockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#963E20] uppercase tracking-wider">
                  Inventory Management
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  Update Stock
                </h3>
              </div>
              <button
                onClick={() => setRestockModalProduct(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl flex items-center gap-3 border border-stone-200/80">
              <img
                src={restockModalProduct.images[0] || restockModalProduct.aiEnhancedImage}
                alt={restockModalProduct.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-xs truncate">
                  {restockModalProduct.name}
                </h4>
                <p className="text-[11px] text-stone-500">
                  Current Stock: <strong className={restockModalProduct.stock === 0 ? 'text-red-600' : 'text-[#1D5C4A]'}>{restockModalProduct.stock} units</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-stone-700">New Available Stock Quantity</label>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setRestockAmount(Math.max(0, restockAmount - 1))}
                    className="px-4 py-3 bg-stone-100 font-bold hover:bg-stone-200 text-stone-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 text-center font-extrabold text-base py-2.5 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRestockAmount(restockAmount + 1)}
                    className="px-4 py-3 bg-stone-100 font-bold hover:bg-stone-200 text-stone-700"
                  >
                    +
                  </button>
                </div>

                {/* Quick Add Pills */}
                <div className="flex gap-2 pt-1">
                  {[5, 10, 20, 50].map((addNum) => (
                    <button
                      key={addNum}
                      type="button"
                      onClick={() => setRestockAmount(addNum)}
                      className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-colors"
                    >
                      Set {addNum}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold shadow-xs"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
