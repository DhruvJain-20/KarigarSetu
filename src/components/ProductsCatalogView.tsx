import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  Trash2,
  Layers,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  SlidersHorizontal,
  Package
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
}

export function ProductsCatalogView({
  language,
  products,
  onOpenAddProduct,
  onEditProduct,
  onToggleStatus,
  onDeleteProduct,
  onViewAsBuyer,
}: ProductsCatalogViewProps) {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;

  const filteredProducts = products.filter((p) => {
    if (filter === 'published') return p.status === 'published';
    if (filter === 'draft') return p.status === 'draft';
    return true;
  });

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-2 space-y-5">
      
      {/* Title Header matching Screenshot 5 */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-[28px] font-bold text-stone-900 tracking-tight">
          Your Products
        </h1>
        <p className="text-sm text-stone-600 font-medium">
          Manage your catalog
        </p>
      </div>

      {/* Filter Tabs matching Screenshot 5 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#D1EBE1] text-[#1D5C4A] shadow-xs'
              : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setFilter('published')}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            filter === 'published'
              ? 'bg-[#D1EBE1] text-[#1D5C4A] shadow-xs'
              : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
          }`}
        >
          Published ({publishedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('draft')}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            filter === 'draft'
              ? 'bg-[#D1EBE1] text-[#1D5C4A] shadow-xs'
              : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/70'
          }`}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Product List Cards matching Screenshot 5 */}
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const isDraft = product.status === 'draft';
          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-md transition-all"
            >
              {/* Product Image Header with Pill */}
              <div className="relative h-48 sm:h-52 bg-stone-100 overflow-hidden">
                <img
                  src={product.images[0] || product.aiEnhancedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-3.5 left-3.5">
                  {isDraft ? (
                    <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                      <Edit2 className="w-3 h-3" />
                      Draft
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#1D5C4A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Published
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

              {/* Product Info Section matching Screenshot 5 */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-stone-900 leading-snug">
                    {product.name}
                  </h3>
                  <div className="text-xl font-extrabold text-[#963E20]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Stock or Pending status */}
                <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 font-medium">
                    {isDraft ? (
                      <span className="text-stone-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Details
                      </span>
                    ) : (
                      <span className="text-stone-700 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-stone-500" />
                        In Stock: {product.stock}
                      </span>
                    )}
                  </div>

                  {/* Action: Resume editing or edit icon */}
                  {isDraft ? (
                    <button
                      type="button"
                      onClick={() => onEditProduct ? onEditProduct(product) : onOpenAddProduct()}
                      className="px-4 py-2 rounded-xl bg-amber-100/80 hover:bg-amber-200 text-[#963E20] font-bold text-xs transition-colors"
                    >
                      Resume Editing
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditProduct && onEditProduct(product)}
                        className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 text-[#963E20] flex items-center justify-center transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-300 p-8 space-y-3">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-stone-600 text-sm font-semibold">
              No products found in this category.
            </p>
            <button
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 rounded-xl bg-[#963E20] text-white text-xs font-bold"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Product Button matching Screenshot 5 */}
      <div className="fixed bottom-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-30">
        <button
          type="button"
          onClick={onOpenAddProduct}
          className="py-3.5 px-6 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add Product</span>
        </button>
      </div>

    </div>
  );
}
