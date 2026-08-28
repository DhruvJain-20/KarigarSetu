import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Sparkles,
  Check,
  Tag,
  DollarSign,
  Clock,
  Package,
  Truck,
  Layers,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Info,
  Sliders,
  Award,
  RefreshCw,
  Coins,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  calculateSmartPrice,
  PricingCostInputs,
  PricingBreakdown,
  CraftComplexity,
  CraftProductType,
  COMPLEXITY_RATES,
  PRODUCT_TYPE_RATES
} from '../utils/pricingCalculator';

interface SmartPricingAssistantProps {
  initialRawMaterialCost?: number;
  initialLabourHours?: number;
  initialLabourRate?: number;
  initialPackagingCost?: number;
  initialTransportCost?: number;
  initialOtherCost?: number;
  initialProfitMargin?: number;
  initialSelectedPrice?: number;
  onPriceSelected: (price: number, breakdown: PricingBreakdown) => void;
  className?: string;
}

export function SmartPricingAssistant({
  initialRawMaterialCost = 0,
  initialLabourHours = 0,
  initialLabourRate = 100,
  initialPackagingCost = 0,
  initialTransportCost = 0,
  initialOtherCost = 0,
  initialProfitMargin = 30,
  initialSelectedPrice = 0,
  onPriceSelected,
  className = '',
}: SmartPricingAssistantProps) {
  // Cost States
  const [rawMaterialCost, setRawMaterialCost] = useState<number>(initialRawMaterialCost);
  const [labourHours, setLabourHours] = useState<number>(initialLabourHours);
  const [labourRate, setLabourRate] = useState<number>(initialLabourRate || 100);
  const [packagingCost, setPackagingCost] = useState<number>(initialPackagingCost);
  const [transportCost, setTransportCost] = useState<number>(initialTransportCost);
  const [otherCost, setOtherCost] = useState<number>(initialOtherCost);
  const [profitMargin, setProfitMargin] = useState<number>(initialProfitMargin || 30);

  // Craftsmanship States
  const [craftComplexity, setCraftComplexity] = useState<CraftComplexity>('medium');
  const [productType, setProductType] = useState<CraftProductType>('handmade');

  // Manual selling price state
  const [customPrice, setCustomPrice] = useState<number>(initialSelectedPrice);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState<boolean>(false);

  // Sync when initial props change (e.g. from Voice extraction)
  useEffect(() => {
    if (initialRawMaterialCost > 0) setRawMaterialCost(initialRawMaterialCost);
  }, [initialRawMaterialCost]);

  useEffect(() => {
    if (initialLabourHours > 0) setLabourHours(initialLabourHours);
  }, [initialLabourHours]);

  useEffect(() => {
    if (initialLabourRate > 0) setLabourRate(initialLabourRate);
  }, [initialLabourRate]);

  useEffect(() => {
    if (initialPackagingCost > 0) setPackagingCost(initialPackagingCost);
  }, [initialPackagingCost]);

  useEffect(() => {
    if (initialTransportCost > 0) setTransportCost(initialTransportCost);
  }, [initialTransportCost]);

  useEffect(() => {
    if (initialOtherCost > 0) setOtherCost(initialOtherCost);
  }, [initialOtherCost]);

  useEffect(() => {
    if (initialSelectedPrice > 0) setCustomPrice(initialSelectedPrice);
  }, [initialSelectedPrice]);

  // Compute Smart Pricing Breakdown deterministically
  const breakdown: PricingBreakdown = useMemo(() => {
    const inputs: PricingCostInputs = {
      rawMaterialCost,
      labourHours,
      labourRate,
      packagingCost,
      transportCost,
      otherCost,
      profitMarginPercent: profitMargin,
      craftComplexity,
      productType,
    };
    return calculateSmartPrice(inputs);
  }, [
    rawMaterialCost,
    labourHours,
    labourRate,
    packagingCost,
    transportCost,
    otherCost,
    profitMargin,
    craftComplexity,
    productType,
  ]);

  // If custom price hasn't been set by user and we have a recommended price, set it
  useEffect(() => {
    if (breakdown.recommendedPrice > 0 && (!customPrice || customPrice === 0)) {
      setCustomPrice(breakdown.recommendedPrice);
    }
  }, [breakdown.recommendedPrice]);

  const handleApplyRecommended = () => {
    setCustomPrice(breakdown.recommendedPrice);
    onPriceSelected(breakdown.recommendedPrice, breakdown);
  };

  const handleApplyTier = (tierPrice: number) => {
    setCustomPrice(tierPrice);
    onPriceSelected(tierPrice, breakdown);
  };

  const handleCustomPriceChange = (val: number) => {
    const safeVal = isNaN(val) ? 0 : Math.max(0, val);
    setCustomPrice(safeVal);
    onPriceSelected(safeVal, breakdown);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Assistant Title & Intro */}
      <div className="bg-gradient-to-br from-[#FAF3E7] to-amber-50 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#963E20] text-white flex items-center justify-center shadow-md">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-lg sm:text-xl tracking-tight">
                  Smart Pricing Assistant
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Free & Transparent
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Calculate fair artisan wages, material costs, and transparent customer pricing with zero guesswork.
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-stone-500 block">Suggested Price</span>
            <span className="text-2xl font-extrabold text-[#963E20]">
              ₹{breakdown.recommendedPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 1. Production Cost Inputs Grid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-900/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#963E20]" />
              1. Direct Production Expenses
            </h4>
            <span className="text-[11px] text-stone-500">Auto-filled from voice or enter manually</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Raw Material Cost */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Raw Material Cost (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={rawMaterialCost > 0 ? rawMaterialCost : ''}
                  onChange={(e) => setRawMaterialCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#963E20]"
                />
              </div>
              <span className="text-[10px] text-stone-600 block">Wood, clay, fabric, brass, stone</span>
            </div>

            {/* Labour Hours */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Making Time (Hours)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={labourHours > 0 ? labourHours : ''}
                  onChange={(e) => setLabourHours(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#963E20]"
                />
              </div>
              <span className="text-[10px] text-stone-600 block">Total skilled artisan time spent</span>
            </div>

            {/* Labour Rate per Hour */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Artisan Hourly Wage (₹/hr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="100"
                  value={labourRate > 0 ? labourRate : ''}
                  onChange={(e) => setLabourRate(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#963E20]"
                />
              </div>
              <span className="text-[10px] text-stone-600 block">Fair wage per hour (e.g. ₹100 - ₹250)</span>
            </div>
          </div>

          {/* Collapsible Additional Logistics Costs */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
              className="text-xs font-bold text-[#963E20] hover:text-[#80341A] flex items-center gap-1 cursor-pointer"
            >
              {showAdvancedInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showAdvancedInputs ? 'Hide Packaging & Transport' : '+ Add Packaging, Freight & Other Costs'}</span>
            </button>

            {showAdvancedInputs && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 mt-2 border-t border-stone-100 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Packaging Materials (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={packagingCost > 0 ? packagingCost : ''}
                      onChange={(e) => setPackagingCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#963E20]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-600 block">Boxes, bubble wrap, cloth pouch</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Transport / Delivery Prep (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={transportCost > 0 ? transportCost : ''}
                      onChange={(e) => setTransportCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#963E20]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-600 block">Local freight, courier preparation</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Other / Tooling Expenses (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={otherCost > 0 ? otherCost : ''}
                      onChange={(e) => setOtherCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#963E20]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-600 block">Chisel wear, natural varnishes, kiln fuel</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Profit Margin & Craftsmanship Adjustment Selectors */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-900/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#963E20]" />
              2. Profit Margin & Craftsmanship Valuation
            </h4>
            <span className="text-xs font-bold text-[#963E20]">
              +{breakdown.profitMarginPercent}% Margin (+₹{breakdown.profitAmount.toLocaleString('en-IN')})
            </span>
          </div>

          {/* Profit Margin Quick Selector Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">Artisan Profit Margin</label>
              <span className="text-xs font-extrabold text-[#963E20]">{profitMargin}%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[20, 25, 30, 40, 50].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setProfitMargin(m)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    profitMargin === m
                      ? 'bg-[#963E20] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {m}% {m === 30 && '(Standard)'} {m === 50 && '(High Premium)'}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={profitMargin}
              onChange={(e) => setProfitMargin(parseInt(e.target.value, 10))}
              className="w-full accent-[#963E20] cursor-pointer"
            />
          </div>

          {/* Craft Complexity & Product Type Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Artisanal Detailing Level
              </label>
              <select
                value={craftComplexity}
                onChange={(e) => setCraftComplexity(e.target.value as CraftComplexity)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#963E20]"
              >
                <option value="simple">Simple Craft (+0% basic assembly)</option>
                <option value="medium">Medium Complexity (+5% hand carving/embroidery)</option>
                <option value="high">High Craftsmanship (+10% intricate masterwork)</option>
                <option value="very_high">Master Heritage Art (+15% rare generational skill)</option>
              </select>
              <span className="text-[10px] text-stone-600 block">
                {COMPLEXITY_RATES[craftComplexity]?.desc}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Product Edition & Type
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as CraftProductType)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#963E20]"
              >
                <option value="handmade">Handmade Craft (+5% unique hand work)</option>
                <option value="traditional">Traditional Heritage (+8% GI regional craft)</option>
                <option value="custom">Custom Made-to-Order (+12% bespoke piece)</option>
                <option value="limited_edition">Limited Edition Collectible (+15% exclusive)</option>
              </select>
              <span className="text-[10px] text-stone-600 block">
                {PRODUCT_TYPE_RATES[productType]?.desc}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Detailed Cost Breakdown Sheet */}
        <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-amber-900/15 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-900/10">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#963E20]" />
              🧠 Karigar Smart Price Breakdown
            </span>
            <span className="text-[11px] font-bold text-stone-600">Cost Summary</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-stone-700">
              <span>Raw Material Cost:</span>
              <span className="font-semibold">₹{breakdown.rawMaterialCost.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center text-stone-700">
              <span>
                Artisan Skilled Labour ({breakdown.labourHours} hrs @ ₹{breakdown.labourRate}/hr):
              </span>
              <span className="font-semibold">₹{breakdown.labourCost.toLocaleString('en-IN')}</span>
            </div>

            {(breakdown.packagingCost > 0 || breakdown.transportCost > 0 || breakdown.otherCost > 0) && (
              <div className="flex justify-between items-center text-stone-700">
                <span>Packaging, Logistics & Tooling:</span>
                <span className="font-semibold">
                  ₹{(breakdown.packagingCost + breakdown.transportCost + breakdown.otherCost).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-amber-900/10 font-bold text-stone-900">
              <span>Total Production Cost:</span>
              <span>₹{breakdown.totalProductionCost.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center text-emerald-800 font-semibold">
              <span>Artisan Direct Profit ({breakdown.profitMarginPercent}%):</span>
              <span>+₹{breakdown.profitAmount.toLocaleString('en-IN')}</span>
            </div>

            {breakdown.craftsmanshipAdjustmentAmount > 0 && (
              <div className="flex justify-between items-center text-[#963E20] font-semibold">
                <span>Craftsmanship & Heritage Bonus (+{breakdown.totalAdjustmentPercent}%):</span>
                <span>+₹{breakdown.craftsmanshipAdjustmentAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2.5 border-t-2 border-[#963E20]/30 text-stone-900">
              <span className="text-sm font-extrabold text-[#963E20] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#963E20]" />
                ✨ Recommended Customer Price:
              </span>
              <span className="text-lg font-black text-[#963E20]">
                ₹{breakdown.recommendedPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Three Suggested Price Tier Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Minimum Sustainable */}
          <div
            onClick={() => handleApplyTier(breakdown.minSustainablePrice)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              customPrice === breakdown.minSustainablePrice && customPrice > 0
                ? 'bg-amber-100 border-[#963E20] ring-2 ring-[#963E20]/30'
                : 'bg-white hover:bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-stone-600">Minimum Fair</span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-semibold">Low Margin</span>
            </div>
            <div className="text-base font-extrabold text-stone-900">
              ₹{breakdown.minSustainablePrice.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Covers essential costs + basic safety buffer.</p>
          </div>

          {/* Recommended (Highlighted) */}
          <div
            onClick={() => handleApplyTier(breakdown.recommendedPrice)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              customPrice === breakdown.recommendedPrice && customPrice > 0
                ? 'bg-[#963E20] text-white border-[#963E20] shadow-md ring-2 ring-[#963E20]/40'
                : 'bg-amber-50 hover:bg-amber-100/70 border-amber-300 text-stone-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[11px] font-bold ${customPrice === breakdown.recommendedPrice ? 'text-amber-200' : 'text-[#963E20]'}`}>
                ⭐ Recommended
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${customPrice === breakdown.recommendedPrice ? 'bg-white/20 text-white' : 'bg-[#963E20]/15 text-[#963E20]'}`}>
                Optimal
              </span>
            </div>
            <div className={`text-lg font-black ${customPrice === breakdown.recommendedPrice ? 'text-white' : 'text-[#963E20]'}`}>
              ₹{breakdown.recommendedPrice.toLocaleString('en-IN')}
            </div>
            <p className={`text-[10px] mt-1 ${customPrice === breakdown.recommendedPrice ? 'text-amber-100' : 'text-stone-600'}`}>
              Full living wage + fair profit + craft bonus.
            </p>
          </div>

          {/* Premium / Collectible */}
          <div
            onClick={() => handleApplyTier(breakdown.premiumPrice)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              customPrice === breakdown.premiumPrice && customPrice > 0
                ? 'bg-amber-100 border-[#963E20] ring-2 ring-[#963E20]/30'
                : 'bg-white hover:bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-stone-600">Collector Tier</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">Premium</span>
            </div>
            <div className="text-base font-extrabold text-stone-900">
              ₹{breakdown.premiumPrice.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">High-end bespoke retail & export valuation.</p>
          </div>
        </div>

        {/* 5. "Why this price?" Transparent Explanation */}
        <div className="bg-white rounded-2xl p-4 border border-amber-900/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#963E20]" />
              Why this price? Transparent Justification
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {breakdown.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. Final Selling Price Selection & Custom Price Override */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Your Final Selling Price (₹)
            </label>
            <p className="text-[11px] text-stone-500">
              You always have 100% control over the price. Use the recommended price or type your own.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative max-w-xs w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-stone-500">₹</span>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={customPrice > 0 ? customPrice : ''}
                onChange={(e) => handleCustomPriceChange(parseInt(e.target.value, 10))}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF3E7] border-2 border-[#963E20] rounded-2xl font-extrabold text-2xl sm:text-3xl text-stone-900 text-center focus:ring-4 focus:ring-[#963E20]/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleApplyRecommended}
              className="py-3 px-5 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Use Recommended Price (₹{breakdown.recommendedPrice.toLocaleString('en-IN')})</span>
            </button>

            {customPrice !== breakdown.recommendedPrice && customPrice > 0 && (
              <button
                type="button"
                onClick={() => onPriceSelected(customPrice, breakdown)}
                className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Set Custom ₹{customPrice.toLocaleString('en-IN')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
