import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  SlidersHorizontal,
  Wand2,
  CheckCircle2,
  TrendingUp,
  Tag,
  ShieldCheck,
  Mic,
  ArrowLeft,
  Edit3,
  Layers,
  Info,
  Check,
  ChevronRight,
  Package,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { ReadyProduct, Language } from '../types';

interface AddProductWizardProps {
  language: Language;
  onClose: () => void;
  onProductCreated: (product: ReadyProduct) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Handloom Dupatta & Fabric',
    category: 'Textiles',
    craftType: 'Block Printed Cotton',
    defaultTitle: 'Handcrafted Block Printed Cotton Dupatta',
    defaultDesc: 'A beautifully handcrafted piece featuring traditional block print techniques. Perfect for everyday wear or festive occasions. The natural cotton fabric ensures breathability and comfort.',
    specs: 'Textiles • Cotton • 2.5m x 1.1m',
    materials: ['Organic Cotton', 'Vegetable Dyes'],
    dimensions: '2.5m x 1.1m',
    weight: '180g',
    suggestedPrice: 1499,
    lowPrice: 1299,
    highPrice: 1699,
    marketAvg: 1450,
    originalImg: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80',
    enhancedImg: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hand-carved Wooden Bowl',
    category: 'Woodwork',
    craftType: 'Wood Carving',
    defaultTitle: 'Hand-carved Wooden Bowl',
    defaultDesc: 'Masterfully carved single-piece natural walnut wood bowl with smooth organic lacquer polish, safe for salads and fruits.',
    specs: 'Home Decor • Woodwork • 24cm dia',
    materials: ['Walnut Wood', 'Food-safe Polish'],
    dimensions: '24cm dia x 10cm height',
    weight: '520g',
    suggestedPrice: 1499,
    lowPrice: 1299,
    highPrice: 1699,
    marketAvg: 1450,
    originalImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80',
    enhancedImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Terracotta Tea Set',
    category: 'Pottery',
    craftType: 'Clay Terracotta',
    defaultTitle: 'Artisanal Terracotta Kulhad Chai Set',
    defaultDesc: 'Set of 6 handcrafted baked river clay cups that lend authentic natural fragrance to your daily tea and coffee rituals.',
    specs: 'Kitchenware • Clay • Set of 6',
    materials: ['Pure Terracotta Clay', 'Natural Kiln Baked'],
    dimensions: '150ml per cup',
    weight: '800g',
    suggestedPrice: 850,
    lowPrice: 699,
    highPrice: 999,
    marketAvg: 790,
    originalImg: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700&auto=format&fit=crop&q=80',
    enhancedImg: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Woven Banarasi Silk Saree',
    category: 'Textiles',
    craftType: 'Banarasi Handloom',
    defaultTitle: 'Pure Katan Silk Banarasi Saree',
    defaultDesc: 'Exquisite bridal handloom saree woven with pure zari border, delicate floral butis, and opulent traditional pallu.',
    specs: 'Textiles • Pure Silk • 6.3m',
    materials: ['Pure Silk', 'Golden Zari'],
    dimensions: '6.3 meters with blouse',
    weight: '680g',
    suggestedPrice: 4200,
    lowPrice: 3800,
    highPrice: 4800,
    marketAvg: 4100,
    originalImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
    enhancedImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
  }
];

export function AddProductWizard({ language, onClose, onProductCreated }: AddProductWizardProps) {
  // Wizard steps: 1 = AI Photo Studio, 2 = Smart Pricing, 3 = Review & Publish
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Active preset template
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const activePreset = SAMPLE_PHOTO_PRESETS[selectedPresetIndex];

  // Photo studio state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // AI Adjustments toggles
  const [aiAdjustments, setAiAdjustments] = useState({
    removeBg: true,
    improveLighting: true,
    sharpen: true,
    autoCrop: false,
  });

  // Custom uploaded image or preset
  const [productImage, setProductImage] = useState<string>(activePreset.enhancedImg);
  const [originalImage, setOriginalImage] = useState<string>(activePreset.originalImg);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Pricing state
  const [selectedPrice, setSelectedPrice] = useState<number>(activePreset.suggestedPrice);
  const [isCustomPriceMode, setIsCustomPriceMode] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>(activePreset.suggestedPrice.toString());

  // Step 3: Listing details state
  const [productName, setProductName] = useState(activePreset.defaultTitle);
  const [description, setDescription] = useState(activePreset.defaultDesc);
  const [category, setCategory] = useState(activePreset.category);
  const [craftType, setCraftType] = useState(activePreset.craftType);
  const [stockCount, setStockCount] = useState(10);
  const [materials, setMaterials] = useState<string[]>(activePreset.materials);
  const [dimensions, setDimensions] = useState(activePreset.dimensions);
  const [showManualEditDetails, setShowManualEditDetails] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState<string | null>(null);

  // Handle preset switch
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = SAMPLE_PHOTO_PRESETS[index];
    setProductImage(p.enhancedImg);
    setOriginalImage(p.originalImg);
    setSelectedPrice(p.suggestedPrice);
    setCustomPriceInput(p.suggestedPrice.toString());
    setProductName(p.defaultTitle);
    setDescription(p.defaultDesc);
    setCategory(p.category);
    setCraftType(p.craftType);
    setMaterials(p.materials);
    setDimensions(p.dimensions);
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setOriginalImage(result);
        setProductImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag slider handler
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  // Voice AI simulation
  const handleVoiceInput = (field: 'name' | 'price' | 'desc') => {
    setIsListeningMic(field);
    setTimeout(() => {
      setIsListeningMic(null);
      if (field === 'name') {
        setProductName('Master Heritage ' + productName);
      } else if (field === 'price') {
        setSelectedPrice(Math.round(selectedPrice * 1.05));
      } else if (field === 'desc') {
        setDescription(description + ' Handcrafted with 100% authentic GI registered local artisanal methods.');
      }
    }, 1600);
  };

  // Publish product
  const handlePublish = (status: 'published' | 'draft' = 'published') => {
    const newProduct: ReadyProduct = {
      id: `prod-${Date.now()}`,
      name: productName,
      hindiName: productName,
      description: description,
      hindiDescription: description,
      price: selectedPrice,
      originalPrice: Math.round(selectedPrice * 1.25),
      category: category,
      craftType: craftType,
      artisanId: 'artisan-meera-ramesh',
      artisanName: 'Ramesh Kumar & Meera Bai',
      artisanCity: 'Jaipur, Rajasthan',
      artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      images: [productImage],
      aiEnhancedImage: productImage,
      status: status,
      stock: stockCount,
      isHandmade: true,
      isVerifiedCraft: true,
      materials: materials,
      dimensions: dimensions,
      weight: activePreset.weight,
      tags: ['Handmade', 'Verified Artisan', 'GI Craft', category],
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    onProductCreated(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-amber-900/10">
        
        {/* Top Header Bar matching Screenshot 1-4 */}
        <div className="bg-white/80 backdrop-blur border-b border-amber-900/10 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => {
              if (step > 1) setStep((step - 1) as 1 | 2);
              else onClose();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:bg-amber-100/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-xl text-[#963E20] tracking-tight">KarigarSetu</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D1EBE1] text-[#1D5C4A] text-xs font-semibold rounded-full">
              {language === 'hi' ? 'हिन्दी' : 'English'}
            </span>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="bg-amber-100/40 px-6 py-2 flex items-center justify-between text-xs text-stone-600 border-b border-amber-900/5">
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#963E20] text-white' : 'bg-stone-300 text-stone-700'}`}>1</span>
            <span className={step === 1 ? 'text-[#963E20] font-bold' : ''}>Photo Studio</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#963E20] text-white' : 'bg-stone-300 text-stone-700'}`}>2</span>
            <span className={step === 2 ? 'text-[#963E20] font-bold' : ''}>Smart Pricing</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#963E20] text-white' : 'bg-stone-300 text-stone-700'}`}>3</span>
            <span className={step === 3 ? 'text-[#963E20] font-bold' : ''}>Review Listing</span>
          </div>
        </div>

        {/* Step 1: Make your product marketplace-ready (Photo Studio) */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Make your product marketplace-ready
              </h2>
              <p className="text-sm text-stone-600">
                High-quality photos attract more buyers.
              </p>
            </div>

            {/* Quick Sample Presets Picker */}
            <div className="bg-amber-50/70 border border-amber-900/10 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5 text-[#963E20]" />
                  Select sample craft photo or capture your own:
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`p-1.5 rounded-xl text-left text-xs border transition-all flex flex-col gap-1 ${
                      selectedPresetIndex === idx
                        ? 'border-[#963E20] bg-amber-100/70 font-semibold shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <img src={p.enhancedImg} alt={p.name} className="w-full h-12 object-cover rounded-lg" />
                    <span className="truncate text-[11px] text-stone-800">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300/80 text-stone-800 font-semibold text-sm transition-colors shadow-xs"
              >
                <Camera className="w-4 h-4 text-stone-700" />
                Take Photo
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300/80 text-stone-800 font-semibold text-sm transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4 text-stone-700" />
                Upload Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Interactive Before/After Split Comparison Slider (Matching Screenshot 2) */}
            <div
              ref={sliderContainerRef}
              className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden select-none border border-stone-300 shadow-md cursor-ew-resize bg-stone-900"
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDraggingSlider(true)}
              onTouchEnd={() => setIsDraggingSlider(false)}
              onTouchMove={handleTouchMove}
            >
              {/* Original Layer (Right side underneath) */}
              <div className="absolute inset-0">
                <img
                  src={originalImage}
                  alt="Original artisan photo"
                  className={`w-full h-full object-cover ${
                    aiAdjustments.improveLighting ? 'brightness-90 contrast-95' : ''
                  }`}
                />
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-stone-900/60 backdrop-blur text-white text-xs font-semibold">
                  Original
                </span>
              </div>

              {/* AI Enhanced Layer (Left side clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <div
                  className="relative h-full"
                  style={{ width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%' }}
                >
                  <img
                    src={productImage}
                    alt="AI Enhanced studio photo"
                    className={`w-full h-full object-cover ${
                      aiAdjustments.improveLighting ? 'brightness-105 contrast-105 saturate-110' : ''
                    } ${aiAdjustments.sharpen ? 'filter-none' : ''}`}
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-stone-900 text-xs font-semibold shadow-xs">
                    AI Enhanced
                  </span>
                </div>
              </div>

              {/* Center Divider Handle Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none flex items-center justify-center"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-stone-700 shadow-md flex items-center justify-center text-xs font-bold border border-stone-200">
                  ‹›
                </div>
              </div>

              {/* Bottom pill message */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-stone-900/80 backdrop-blur text-white text-xs font-medium flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                AI is improving your product image...
              </div>
            </div>

            {/* AI Adjustments Badges matching Screenshot 2 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 tracking-wide uppercase">
                AI Adjustments
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAiAdjustments((prev) => ({ ...prev, removeBg: !prev.removeBg }))
                  }
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    aiAdjustments.removeBg
                      ? 'bg-[#D1EBE1] text-[#1D5C4A] border-[#A8D8C7] shadow-xs'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Remove Background
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAiAdjustments((prev) => ({ ...prev, improveLighting: !prev.improveLighting }))
                  }
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    aiAdjustments.improveLighting
                      ? 'bg-[#D1EBE1] text-[#1D5C4A] border-[#A8D8C7] shadow-xs'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Improve Lighting
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAiAdjustments((prev) => ({ ...prev, sharpen: !prev.sharpen }))
                  }
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    aiAdjustments.sharpen
                      ? 'bg-[#D1EBE1] text-[#1D5C4A] border-[#A8D8C7] shadow-xs'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Sharpen
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAiAdjustments((prev) => ({ ...prev, autoCrop: !prev.autoCrop }))
                  }
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    aiAdjustments.autoCrop
                      ? 'bg-[#D1EBE1] text-[#1D5C4A] border-[#A8D8C7] shadow-xs'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Auto Crop
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2 mt-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Use This Image
              </button>

              <button
                type="button"
                onClick={() => {
                  setSliderPosition(50);
                  fileInputRef.current?.click();
                }}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-sm transition-colors"
              >
                Retake Photo
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Find the right price (Smart Pricing matching Screenshot 3) */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Find the right price
              </h2>
              <p className="text-sm text-stone-600">
                Let AI help you set a competitive price for your product.
              </p>
            </div>

            {/* Product Summary Mini Card */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs flex items-center gap-3">
              <img
                src={productImage}
                alt="Product thumbnail"
                className="w-14 h-14 rounded-xl object-cover border border-stone-100"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">{productName}</h4>
                <p className="text-xs text-stone-500">{category} • {craftType}</p>
              </div>
            </div>

            {/* AI Market Analysis Container */}
            <div className="bg-[#FAF3E7] rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#963E20] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#963E20]" />
                AI Market Analysis
              </div>

              <div className="text-center space-y-1.5 py-1">
                <div className="text-xs font-medium text-stone-600">Recommended Price</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                  ₹{selectedPrice.toLocaleString('en-IN')}
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D1EBE1] text-[#1D5C4A] text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  High Demand
                </div>
              </div>

              {/* Range indicator slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-stone-600 font-medium">
                  <span>Low: ₹{activePreset.lowPrice.toLocaleString('en-IN')}</span>
                  <span>High: ₹{activePreset.highPrice.toLocaleString('en-IN')}</span>
                </div>

                <div className="relative h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-1/4 right-1/4 bg-[#A8D8C7] rounded-full"></div>
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-[#1D5C4A] rounded-full"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  ></div>
                </div>

                <p className="text-center text-[11px] text-stone-500 font-medium">
                  Sweet spot based on quality & market
                </p>
              </div>

              {/* Insight Bullets matching Screenshot 3 */}
              <div className="space-y-2.5 pt-2 border-t border-amber-200/60">
                <div className="bg-white/80 rounded-xl p-3 border border-amber-900/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-[#963E20]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      Similar items sell for ₹{activePreset.marketAvg.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-stone-600">
                      Based on 120 recent sales in your craft cluster & online marketplaces.
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-amber-900/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      Handmade premium included
                    </div>
                    <div className="text-[11px] text-stone-600">
                      +₹49 added for authentic GI artisanal craftsmanship.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom price modal / input if requested */}
            {isCustomPriceMode && (
              <div className="bg-white rounded-2xl p-4 border border-stone-300 shadow-sm space-y-3">
                <label className="text-xs font-bold text-stone-800">Enter Your Desired Price (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 text-lg"
                    placeholder="1499"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(customPriceInput, 10);
                      if (num > 0) {
                        setSelectedPrice(num);
                        setIsCustomPriceMode(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2 mt-auto relative">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-4 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Use ₹{selectedPrice.toLocaleString('en-IN')}
              </button>

              <button
                type="button"
                onClick={() => setIsCustomPriceMode(!isCustomPriceMode)}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-stone-600" />
                Set Custom Price
              </button>

              {/* Floating Voice Mic button matching Screenshot 3 */}
              <button
                type="button"
                onClick={() => handleVoiceInput('price')}
                title="Voice Price Suggestion"
                className={`absolute right-0 -top-16 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95 ${
                  isListeningMic === 'price'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#2E5448] text-white hover:bg-[#244339]'
                }`}
              >
                <Mic className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review your listing (AI Voice Cataloger matching Screenshot 4) */}
        {step === 3 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Review your listing
              </h2>
              <p className="text-sm text-stone-600">
                Make sure everything looks perfect before publishing.
              </p>
            </div>

            {/* Product Image with Badges */}
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-sm h-52 sm:h-56 bg-stone-100">
              <img
                src={productImage}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-[#1D5C4A]/90 backdrop-blur text-white text-xs font-semibold flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Handmade
                </span>
                <span className="px-3 py-1 rounded-full bg-[#963E20]/90 backdrop-blur text-white text-xs font-semibold flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Craft
                </span>
              </div>
            </div>

            {/* AI Generated Details Card matching Screenshot 4 */}
            <div className="bg-[#FAF3E7] rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-900/10 text-xs font-bold text-[#963E20]">
                <Sparkles className="w-3.5 h-3.5 text-[#963E20]" />
                AI Generated Details
              </div>

              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Product Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 font-semibold text-stone-900 text-sm focus:outline-none focus:border-[#963E20]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput('name')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#963E20]"
                  >
                    <Mic className={`w-4 h-4 ${isListeningMic === 'name' ? 'text-red-500 animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Price</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`₹${selectedPrice}`}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                      setSelectedPrice(val);
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 font-bold text-stone-900 text-base focus:outline-none focus:border-[#963E20]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput('price')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#963E20]"
                  >
                    <Mic className={`w-4 h-4 ${isListeningMic === 'price' ? 'text-red-500 animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Description</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 text-stone-800 text-xs sm:text-sm focus:outline-none focus:border-[#963E20] leading-relaxed resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput('desc')}
                    className="absolute right-3 top-3 text-stone-500 hover:text-[#963E20]"
                  >
                    <Mic className={`w-4 h-4 ${isListeningMic === 'desc' ? 'text-red-500 animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Specs Box */}
              <div className="bg-white/80 rounded-2xl p-3.5 border border-dashed border-amber-900/20 flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                <Package className="w-4 h-4 text-[#963E20] shrink-0" />
                <span>{category} • {craftType} • {dimensions || 'Standard Artisanal Size'}</span>
              </div>
            </div>

            {/* Manual details expansion */}
            {showManualEditDetails && (
              <div className="bg-white rounded-3xl p-4 border border-stone-200 space-y-3">
                <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">Advanced Specifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Stock Inventory</label>
                    <input
                      type="number"
                      value={stockCount}
                      onChange={(e) => setStockCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Craft Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2 mt-auto">
              <button
                type="button"
                onClick={() => handlePublish('published')}
                className="w-full py-4 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Publish Product
              </button>

              <button
                type="button"
                onClick={() => setShowManualEditDetails(!showManualEditDetails)}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-stone-600" />
                {showManualEditDetails ? 'Hide Extra Fields' : 'Edit Details Manually'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
