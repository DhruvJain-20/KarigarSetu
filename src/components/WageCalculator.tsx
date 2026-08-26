import React, { useState } from 'react';
import {
  Calculator,
  IndianRupee,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Info,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Language, TradeCategory } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface WageCalculatorProps {
  language: Language;
}

export const WageCalculator: React.FC<WageCalculatorProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const [trade, setTrade] = useState<TradeCategory>('handloom');
  const [cityTier, setCityTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier2');
  const [workUnits, setWorkUnits] = useState<number>(4); // e.g. days or points
  const [calculationMode, setCalculationMode] = useState<'daily' | 'sqft' | 'points'>('daily');
  const [includeHelper, setIncludeHelper] = useState(true);

  // Benchmarking calculation
  const meta = TRADE_META[trade] || TRADE_META.handloom;
  const tierMultiplier = cityTier === 'tier1' ? 1.25 : cityTier === 'tier2' ? 1.0 : 0.85;

  const baseDailyMaster = meta.avgDailyWage * tierMultiplier;
  const helperDaily = 500 * tierMultiplier;

  let totalEstimate = 0;
  let breakdownDesc = '';

  if (calculationMode === 'daily') {
    const dailyTotal = baseDailyMaster + (includeHelper ? helperDaily : 0);
    totalEstimate = Math.round(dailyTotal * workUnits);
    breakdownDesc = `${workUnits} Days × (Master: ₹${Math.round(baseDailyMaster)}/day ${
      includeHelper ? `+ Helper: ₹${Math.round(helperDaily)}/day` : ''
    })`;
  } else if (calculationMode === 'sqft') {
    // Sq.ft calculation for craft / artisan works
    let ratePerSqFt = 75;
    if (trade === 'handloom') ratePerSqFt = 95;
    if (trade === 'stonecraft') ratePerSqFt = 220;
    if (trade === 'artist') ratePerSqFt = 150;
    if (trade === 'metalwork') ratePerSqFt = 180;
    if (trade === 'leathercraft') ratePerSqFt = 130;
    if (trade === 'tailoring') ratePerSqFt = 60;
    if (trade === 'pottery') ratePerSqFt = 50;

    const adjustedRate = ratePerSqFt * tierMultiplier;
    totalEstimate = Math.round(adjustedRate * workUnits);
    breakdownDesc = `${workUnits} sq.ft / meter × ₹${Math.round(adjustedRate)} standard benchmark`;
  } else {
    // Per Piece / Craft point (e.g. ₹150 - ₹650/piece)
    let ratePerPoint = 250;
    if (trade === 'handloom') ratePerPoint = 350;
    if (trade === 'pottery') ratePerPoint = 180;
    if (trade === 'artist') ratePerPoint = 650;
    if (trade === 'metalwork') ratePerPoint = 420;
    if (trade === 'leathercraft') ratePerPoint = 380;
    if (trade === 'tailoring') ratePerPoint = 220;
    if (trade === 'stonecraft') ratePerPoint = 550;

    const adjustedRate = ratePerPoint * tierMultiplier;
    totalEstimate = Math.round(adjustedRate * workUnits);
    breakdownDesc = `${workUnits} finished pieces/units × ₹${Math.round(adjustedRate)}/unit standard benchmark`;
  }

  return (
    <div id="wage-calculator-panel" className="bg-white rounded-3xl border border-amber-900/10 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.fairWageCalc}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Transparent labor rate estimator promoting fair, standardized compensation for skilled karigars and craftspeople.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 text-xs font-semibold text-amber-900 shrink-0">
          <TrendingUp className="w-4 h-4 text-amber-700" />
          <span>Govt & Guild Market Benchmarks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Trade Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Trade / हुनर
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(TRADE_META).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setTrade(key as TradeCategory)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                    trade === key
                      ? 'border-amber-700 bg-amber-50/80 text-amber-950 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="truncate font-bold">{language === 'hi' ? item.nameHi : item.nameEn}</p>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Base ₹{item.avgDailyWage}/day
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* City Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                City / Region Tier
              </label>
              <select
                value={cityTier}
                onChange={(e) => setCityTier(e.target.value as typeof cityTier)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="tier1">Tier 1 Metros (Delhi NCR, Mumbai, Bengaluru)</option>
                <option value="tier2">Tier 2 Cities (Jaipur, Lucknow, Varanasi, Surat)</option>
                <option value="tier3">Tier 3 Towns & Rural Districts</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Pricing Mode
              </label>
              <select
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value as typeof calculationMode)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="daily">Per Day Basis (दैनिक दिहाड़ी)</option>
                <option value="sqft">Per Sq. Ft Basis (स्क्वायर फीट)</option>
                <option value="points">Per Point / Fixture (पॉइंट या नग)</option>
              </select>
            </div>
          </div>

          {/* Quantity Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {calculationMode === 'daily'
                  ? 'Estimated Work Duration (Days)'
                  : calculationMode === 'sqft'
                  ? 'Total Area (Square Feet)'
                  : 'Total Fixtures / Points'}
              </label>
              <span className="text-sm font-extrabold text-amber-900 bg-amber-100 px-3 py-0.5 rounded-lg">
                {workUnits} {calculationMode === 'daily' ? 'Days' : calculationMode === 'sqft' ? 'sq.ft' : 'units'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={calculationMode === 'sqft' ? 500 : 30}
              value={workUnits}
              onChange={(e) => setWorkUnits(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
            />
          </div>

          {/* Helper checkbox */}
          {calculationMode === 'daily' && (
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHelper}
                onChange={(e) => setIncludeHelper(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span>Include Helper / Assistant Karigar (सहायक कारीगर +₹{Math.round(helperDaily)}/day)</span>
            </label>
          )}
        </div>

        {/* Estimated Output Result Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-amber-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
              {t.estimatedCost}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                ₹{totalEstimate.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-amber-200 font-medium">(Labor only)</span>
            </div>

            <p className="text-xs text-amber-200/80 mt-2 bg-black/20 p-3 rounded-xl border border-white/10">
              💡 {breakdownDesc}
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-amber-100/90 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct payment to karigar with zero platform fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Includes standard tooling & safety equipment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Material costs (cement, wood, wires, fabric) extra</span>
            </div>
          </div>

          <div className="p-3 bg-amber-800/60 rounded-xl text-[11px] text-amber-200 border border-amber-700/50">
            🤝 <strong>Fair Trade Pledge:</strong> Ensuring prompt, transparent wages empowers artisans and sustains heritage craftsmanship across India.
          </div>
        </div>
      </div>
    </div>
  );
};
