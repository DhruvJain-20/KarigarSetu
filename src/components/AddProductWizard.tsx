import React, { useState, useRef, useEffect } from 'react';
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
  Check,
  ChevronRight,
  Package,
  Image as ImageIcon,
  AlertCircle,
  Crop as CropIcon,
  Download,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Calculator
} from 'lucide-react';
import { ReadyProduct, Language, ArtisanUserProfile } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { removeImageBackground, triggerImageDownload, ProcessingProgress } from '../utils/imageEditor';
import { ImageCropperModal } from './ImageCropperModal';
import { LiveCameraModal } from './LiveCameraModal';
import { VoiceProductEntry } from './VoiceProductEntry';
import { SmartPricingAssistant } from './SmartPricingAssistant';
import { ExtractedProductDetails } from '../utils/transcriptExtractor';
import { PricingBreakdown } from '../utils/pricingCalculator';

interface AddProductWizardProps {
  language: Language;
  onClose: () => void;
  onProductCreated: (product: ReadyProduct) => void;
  artisanProfile?: ArtisanUserProfile;
}

export function AddProductWizard({ language, onClose, onProductCreated, artisanProfile }: AddProductWizardProps) {
  // Wizard steps: 1 = AI Photo Studio & Voice, 2 = Smart Pricing, 3 = Review & Publish
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Photo studio state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // AI Adjustments toggles
  const [aiAdjustments, setAiAdjustments] = useState({
    removeBg: false,
    improveLighting: false,
  });

  // Separate image states
  const [originalImage, setOriginalImage] = useState<string>('');
  const [productImage, setProductImage] = useState<string>(''); // Current working image
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null);

  // Background removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState<ProcessingProgress | null>(null);

  // Cropper & Live Camera modals state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);

  // General processing & error states
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [studioErrorMessage, setStudioErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Voice AI State
  const [showVoiceStudio, setShowVoiceStudio] = useState<boolean>(true);
  const [hasAiExtracted, setHasAiExtracted] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('');
  const [culturalSignificance, setCulturalSignificance] = useState<string>('');
  const [makingTime, setMakingTime] = useState<string>('');

  // Step 2: Smart Pricing & Cost States
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [rawMaterialCost, setRawMaterialCost] = useState<number>(0);
  const [labourHours, setLabourHours] = useState<number>(0);
  const [labourRate, setLabourRate] = useState<number>(100);
  const [packagingCost, setPackagingCost] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(30);
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);

  // Step 3: Listing details state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Handlooms & Textiles');
  const [craftType, setCraftType] = useState('');
  const [stockCount, setStockCount] = useState(1);
  const [materialsInput, setMaterialsInput] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [showManualEditDetails, setShowManualEditDetails] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // Handle voice extraction callback
  const handleVoiceDetailsExtracted = (details: ExtractedProductDetails) => {
    setHasAiExtracted(true);

    if (details.productName) setProductName(details.productName);
    if (details.category) setCategory(details.category);
    if (details.description) setDescription(details.description);
    if (details.craftTechnique) setCraftType(details.craftTechnique);
    if (details.material) setMaterialsInput(details.material);
    if (details.dimensions) setDimensions(details.dimensions);
    if (details.origin) setOrigin(details.origin);
    if (details.culturalSignificance) setCulturalSignificance(details.culturalSignificance);
    if (details.makingTime) setMakingTime(details.makingTime);

    if (typeof details.rawMaterialCost === 'number' && details.rawMaterialCost > 0) {
      setRawMaterialCost(details.rawMaterialCost);
    }
    if (typeof details.labourHours === 'number' && details.labourHours > 0) {
      setLabourHours(details.labourHours);
    }
    if (typeof details.labourRate === 'number' && details.labourRate > 0) {
      setLabourRate(details.labourRate);
    }
    if (typeof details.packagingCost === 'number' && details.packagingCost > 0) {
      setPackagingCost(details.packagingCost);
    }
    if (typeof details.transportCost === 'number' && details.transportCost > 0) {
      setTransportCost(details.transportCost);
    }
    if (typeof details.otherCosts === 'number' && details.otherCosts > 0) {
      setOtherCost(details.otherCosts);
    }
    if (typeof details.price === 'number' && details.price > 0) {
      setSelectedPrice(details.price);
    }
  };

  const handleCostFieldsExtracted = (costs: {
    rawMaterialCost?: number;
    labourHours?: number;
    labourRate?: number;
    packagingCost?: number;
    transportCost?: number;
    otherCosts?: number;
    targetPrice?: number;
  }) => {
    if (costs.rawMaterialCost !== undefined) setRawMaterialCost(costs.rawMaterialCost);
    if (costs.labourHours !== undefined) setLabourHours(costs.labourHours);
    if (costs.labourRate !== undefined) setLabourRate(costs.labourRate);
    if (costs.packagingCost !== undefined) setPackagingCost(costs.packagingCost);
    if (costs.transportCost !== undefined) setTransportCost(costs.transportCost);
    if (costs.otherCosts !== undefined) setOtherCost(costs.otherCosts);
    if (costs.targetPrice !== undefined && costs.targetPrice > 0) setSelectedPrice(costs.targetPrice);
  };

  const handleSmartPriceSelected = (price: number, breakdown: PricingBreakdown) => {
    setSelectedPrice(price);
    setPricingBreakdown(breakdown);
    setRawMaterialCost(breakdown.rawMaterialCost);
    setLabourHours(breakdown.labourHours);
    setLabourRate(breakdown.labourRate);
    setPackagingCost(breakdown.packagingCost);
    setTransportCost(breakdown.transportCost);
    setOtherCost(breakdown.otherCost);
    setProfitMargin(breakdown.profitMarginPercent);
  };

  // Handle image capture from live camera
  const handleLiveCameraCapture = async (dataUrl: string) => {
    setIsProcessingImage(true);
    setStudioErrorMessage('');
    setValidationError('');
    try {
      setOriginalImage(dataUrl);
      setProductImage(dataUrl);
      setCroppedImage(null);
      setBgRemovedImage(null);
      setAiAdjustments({ removeBg: false, improveLighting: false });
    } catch (err) {
      console.error('Failed to set captured image:', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Drag-and-drop state for image file
  const [isDraggingFileOver, setIsDraggingFileOver] = useState(false);

  // Common file processor for upload and drag-and-drop
  const processImageFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setStudioErrorMessage('Please select or drop a valid image file (PNG, JPG, WEBP, HEIC).');
      return;
    }
    setIsProcessingImage(true);
    setStudioErrorMessage('');
    setValidationError('');
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.88);
      setOriginalImage(compressed);
      setProductImage(compressed);
      setCroppedImage(null);
      setBgRemovedImage(null);
      setAiAdjustments({ removeBg: false, improveLighting: false });
    } catch (err) {
      console.error('Failed to process image:', err);
      setStudioErrorMessage('Failed to read image file. Please try another image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Image Upload handler with instant compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFileOver) setIsDraggingFileOver(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFileOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  // Real client-side AI background removal
  const handleRemoveBackground = async () => {
    if (!productImage || isRemovingBg) return;

    try {
      setIsRemovingBg(true);
      setStudioErrorMessage('');
      setBgRemovalProgress({ percent: 10, stage: 'Starting local AI background removal...' });

      const result = await removeImageBackground(productImage, (prog) => {
        setBgRemovalProgress(prog);
      });

      setProductImage(result.dataUrl);
      setBgRemovedImage(result.dataUrl);
      setAiAdjustments((prev) => ({ ...prev, removeBg: true }));
    } catch (err: any) {
      console.error('Background removal error:', err);
      setStudioErrorMessage('Unable to remove background. You can continue with the current image or try again.');
    } finally {
      setIsRemovingBg(false);
      setTimeout(() => {
        setBgRemovalProgress(null);
      }, 800);
    }
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setCroppedImage(croppedDataUrl);
    setProductImage(croppedDataUrl);
    setIsCropperOpen(false);
  };

  const handleResetToOriginal = () => {
    if (originalImage) {
      setProductImage(originalImage);
      setCroppedImage(null);
      setBgRemovedImage(null);
      setAiAdjustments({ removeBg: false, improveLighting: false });
    }
  };

  const handleDownload = () => {
    if (!productImage) return;
    const cleanName = (productName || 'karigar-craft').toLowerCase().replace(/\s+/g, '-');
    const filename = `${cleanName}-${bgRemovedImage ? 'transparent' : 'enhanced'}.png`;
    triggerImageDownload(productImage, filename);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingSlider || !sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDraggingSlider || !sliderContainerRef.current || !e.touches[0]) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingSlider) {
        setIsDraggingSlider(false);
      }
    };

    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDraggingSlider]);

  const handleSliderPointerDown = (clientX: number) => {
    setIsDraggingSlider(true);
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  // Browser-native speech input for single field
  const handleSingleFieldVoice = (field: 'name' | 'desc') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListeningMic(field);
      setTimeout(() => {
        setIsListeningMic(null);
        if (field === 'name') setProductName((prev) => prev || 'Handcrafted Heritage Masterpiece');
        else setDescription((prev) => prev || 'Lovingly hand-shaped using indigenous natural materials.');
      }, 1000);
      return;
    }

    try {
      setIsListeningMic(field);
      const rec = new SpeechRecognition();
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (field === 'name') setProductName(text);
        else setDescription(text);
        setIsListeningMic(null);
      };
      rec.onerror = () => setIsListeningMic(null);
      rec.onend = () => setIsListeningMic(null);
      rec.start();
    } catch (e) {
      setIsListeningMic(null);
    }
  };

  // Publish product directly
  const handlePublish = () => {
    if (!productName.trim()) {
      setValidationError('Please enter a product name');
      return;
    }
    if (selectedPrice <= 0) {
      setValidationError('Please specify a valid selling price');
      return;
    }

    const materialsArray = materialsInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const calculatedLabourCost = labourHours > 0 && labourRate > 0 ? Math.round(labourHours * labourRate) : undefined;
    const calculatedProductionCost = pricingBreakdown?.totalProductionCost || 
      (rawMaterialCost + (calculatedLabourCost || 0) + packagingCost + transportCost + otherCost);

    const newProduct: ReadyProduct = {
      id: `prod-${Date.now()}`,
      name: productName.trim(),
      hindiName: productName.trim(),
      description: description.trim() || 'Authentic handmade artifact crafted with exquisite care and heritage methods.',
      hindiDescription: description.trim() || 'प्रामाणिक हस्तशिल्प उत्पाद।',
      price: selectedPrice,
      originalPrice: Math.round(selectedPrice * 1.2),
      category: category || 'Handicrafts & Decor',
      craftType: craftType || 'Handmade Craft',
      artisanId: artisanProfile?.id || 'artisan',
      artisanName: artisanProfile?.name || 'Artisan / Maker',
      artisanCity: artisanProfile?.businessDetails?.city || 'India',
      artisanAvatar: artisanProfile?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      images: [productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'],
      aiEnhancedImage: productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
      status: stockCount > 0 ? 'published' : 'sold_out',
      stock: stockCount > 0 ? stockCount : 1,
      isHandmade: true,
      isVerifiedCraft: true,
      materials: materialsArray.length > 0 ? materialsArray : ['Natural Materials', 'Artisanal Craft'],
      dimensions: dimensions || 'Standard Craft Size',
      weight: 'Standard',
      tags: ['Handmade', 'Artisan Direct', category],
      rating: 5.0,
      reviewsCount: 0,
      rawMaterialCost: rawMaterialCost > 0 ? rawMaterialCost : undefined,
      labourHours: labourHours > 0 ? labourHours : undefined,
      labourRate: labourRate > 0 ? labourRate : undefined,
      labourCost: calculatedLabourCost,
      packagingCost: packagingCost > 0 ? packagingCost : undefined,
      transportCost: transportCost > 0 ? transportCost : undefined,
      otherCost: otherCost > 0 ? otherCost : undefined,
      productionCost: calculatedProductionCost > 0 ? calculatedProductionCost : undefined,
      profitMargin: profitMargin > 0 ? profitMargin : undefined,
      recommendedPrice: pricingBreakdown?.recommendedPrice || undefined,
      finalSelectedPrice: selectedPrice,
      origin: origin || undefined,
      culturalSignificance: culturalSignificance || undefined,
      makingTime: makingTime || undefined,
      createdAt: new Date().toISOString(),
    };

    onProductCreated(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-2xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-amber-900/10">
        {/* Top Header Bar */}
        <div className="bg-white/80 backdrop-blur border-b border-amber-900/10 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => {
              if (step > 1) setStep((step - 1) as 1 | 2);
              else onClose();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:bg-amber-100/50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-xl text-[#963E20] tracking-tight">KarigarSetu</span>
            <span className="text-xs font-bold text-stone-500 hidden sm:inline">• Add Product</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D1EBE1] text-[#1D5C4A] text-xs font-semibold rounded-full">
              {language === 'hi' ? 'हिन्दी' : 'English'}
            </span>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-800 text-sm font-semibold p-1.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="bg-amber-100/40 px-6 py-2.5 flex items-center justify-between text-xs text-stone-600 border-b border-amber-900/5">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 1 ? 'bg-[#963E20] text-white' : 'bg-stone-300 text-stone-700'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-[#963E20] font-bold' : ''}>Voice & Photo Studio</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 2 ? 'bg-[#963E20] text-white' : 'bg-stone-300 text-stone-700'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-[#963E20] font-bold' : ''}>Smart Pricing</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 3 ? 'bg-[#963E20] text-white' : 'bg-stone-300 text-stone-700'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'text-[#963E20] font-bold' : ''}>Review Listing</span>
          </div>
        </div>

        {/* Step 1: Voice-Based Product Entry + AI Photo Studio */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-6 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Add Your Handcrafted Product
              </h2>
              <p className="text-sm text-stone-600">
                Describe your craft by voice and upload a product photo to create your listing in seconds.
              </p>
            </div>

            {/* Prominent Voice Product Entry Feature */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#963E20]" />
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wide">
                    🎤 Describe Your Product by Voice
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVoiceStudio(!showVoiceStudio)}
                  className="text-xs font-bold text-[#963E20] hover:text-[#80341A] flex items-center gap-1 cursor-pointer"
                >
                  {showVoiceStudio ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showVoiceStudio ? 'Collapse Voice Studio' : 'Open Voice Studio'}</span>
                </button>
              </div>

              {showVoiceStudio && (
                <VoiceProductEntry
                  language={language}
                  onDetailsExtracted={handleVoiceDetailsExtracted}
                  onCostFieldsExtracted={handleCostFieldsExtracted}
                />
              )}
            </div>

            {/* Photo Studio Section */}
            <div className="space-y-4 pt-2 border-t border-amber-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wide">
                    📸 Product Photo & AI Studio
                  </h3>
                </div>
                {productImage && (
                  <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Photo Ready
                  </span>
                )}
              </div>

              {/* Photo Upload Area / Drag & Drop */}
              {!productImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-4 shadow-xs ${
                    isDraggingFileOver
                      ? 'border-[#963E20] bg-amber-100/70 ring-4 ring-amber-400/30 scale-[1.01]'
                      : 'border-[#963E20]/40 hover:border-[#963E20] bg-white hover:bg-amber-50/40'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-transform ${
                      isDraggingFileOver ? 'bg-[#963E20] text-white scale-110' : 'bg-amber-100 text-[#963E20]'
                    }`}
                  >
                    {isProcessingImage ? (
                      <Sparkles className="w-7 h-7 animate-spin" />
                    ) : isDraggingFileOver ? (
                      <Upload className="w-7 h-7 animate-bounce" />
                    ) : (
                      <ImageIcon className="w-7 h-7" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-stone-900">
                      {isProcessingImage
                        ? 'Optimizing Image...'
                        : isDraggingFileOver
                        ? 'Drop image here to add'
                        : 'Upload or Drag & Drop Product Photo'}
                    </h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Supports JPG, PNG, WEBP. Fast client-side image compression & free AI background cleanup.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLiveCameraOpen(true);
                      }}
                      className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-[#963E20]/30 text-[#963E20] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-stone-600" />
                      <span>Select File</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Background removal progress indicator */}
                  {isRemovingBg && bgRemovalProgress && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#963E20]" />
                          {bgRemovalProgress.stage}
                        </span>
                        <span>{bgRemovalProgress.percent}%</span>
                      </div>
                      <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#963E20] h-full transition-all duration-300 rounded-full"
                          style={{ width: `${bgRemovalProgress.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Banner */}
                  {studioErrorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{studioErrorMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStudioErrorMessage('')}
                        className="text-xs font-bold text-red-800 hover:underline cursor-pointer ml-2"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Split Slider Preview */}
                  <div
                    ref={sliderContainerRef}
                    className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden select-none border border-stone-300 shadow-md cursor-ew-resize bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-stone-100 touch-none"
                    onMouseDown={(e) => handleSliderPointerDown(e.clientX)}
                    onTouchStart={(e) => {
                      if (e.touches[0]) handleSliderPointerDown(e.touches[0].clientX);
                    }}
                  >
                    {/* Original Layer */}
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 pointer-events-none select-none">
                      <img
                        src={originalImage}
                        alt="Original photo"
                        draggable={false}
                        className="w-full h-full object-contain brightness-95 pointer-events-none select-none"
                      />
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-stone-900/70 backdrop-blur text-white text-xs font-semibold shadow-xs pointer-events-none">
                        Original
                      </span>
                    </div>

                    {/* AI Enhanced / Working Layer */}
                    <div
                      className="absolute inset-0 overflow-hidden bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px] bg-stone-200/50 pointer-events-none select-none"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <div
                        className="relative h-full flex items-center justify-center pointer-events-none select-none"
                        style={{
                          width: sliderContainerRef.current
                            ? `${sliderContainerRef.current.clientWidth}px`
                            : '100%',
                        }}
                      >
                        <img
                          src={productImage}
                          alt="Studio working photo"
                          draggable={false}
                          className={`w-full h-full object-contain pointer-events-none select-none ${
                            aiAdjustments.improveLighting ? 'brightness-105 contrast-105 saturate-110' : ''
                          }`}
                        />
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-stone-900 text-xs font-bold shadow-xs flex items-center gap-1 pointer-events-none">
                          <Sparkles className="w-3 h-3 text-[#963E20]" />
                          {bgRemovedImage ? 'Transparent PNG' : croppedImage ? 'Cropped' : 'Enhanced'}
                        </span>
                      </div>
                    </div>

                    {/* Center Divider Handle Bar */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none flex items-center justify-center z-10"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-white text-stone-700 shadow-md flex items-center justify-center text-xs font-bold border border-stone-200 pointer-events-none">
                        ‹›
                      </div>
                    </div>
                  </div>

                  {/* Studio Editing Tools */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 tracking-wide uppercase">
                        Studio Editing Tools
                      </span>
                      {(croppedImage || bgRemovedImage || productImage !== originalImage) && (
                        <button
                          type="button"
                          onClick={handleResetToOriginal}
                          className="text-xs font-semibold text-amber-800 hover:text-[#963E20] flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset Original
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={isRemovingBg}
                        onClick={handleRemoveBackground}
                        className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                          bgRemovedImage
                            ? 'bg-[#D1EBE1] text-[#1D5C4A] border-[#A8D8C7] shadow-xs'
                            : isRemovingBg
                            ? 'bg-amber-100 text-amber-900 border-amber-300 opacity-75'
                            : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-300 shadow-xs'
                        }`}
                      >
                        {isRemovingBg ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#963E20]" />
                        ) : (
                          <Wand2 className="w-4 h-4 text-[#963E20]" />
                        )}
                        <span>{bgRemovedImage ? 'Background Cleaned' : 'Remove Background'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                          croppedImage
                            ? 'bg-[#D1EBE1] text-[#1D5C4A] border-[#A8D8C7] shadow-xs'
                            : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-300 shadow-xs'
                        }`}
                      >
                        <CropIcon className="w-4 h-4 text-[#963E20]" />
                        <span>{croppedImage ? 'Recrop Image' : 'Crop Image'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownload}
                        className="p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 shadow-xs cursor-pointer col-span-2 sm:col-span-1"
                      >
                        <Download className="w-4 h-4 text-emerald-700" />
                        <span>Download Image</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Camera & Cropper Modals */}
            {isLiveCameraOpen && (
              <LiveCameraModal
                onCapture={handleLiveCameraCapture}
                onClose={() => setIsLiveCameraOpen(false)}
              />
            )}

            {isCropperOpen && productImage && (
              <ImageCropperModal
                imageSrc={productImage}
                onCropComplete={handleCropComplete}
                onClose={() => setIsCropperOpen(false)}
              />
            )}

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Step 1 Actions */}
            <div className="pt-2 space-y-2 mt-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Smart Pricing</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              {productImage && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLiveCameraOpen(true)}
                    className="py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-[#963E20]/30 text-[#963E20] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Retake Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Smart Pricing Assistant */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            {/* Product Summary Mini Card */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs flex items-center gap-3">
              <img
                src={productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'}
                alt="Product thumbnail"
                className="w-14 h-14 rounded-xl object-cover border border-stone-100"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {productName || 'New Handmade Product'}
                </h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-stone-500 truncate">{category}</p>
                  {hasAiExtracted && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Voice Costs Applied
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Smart Pricing Assistant Interactive Component */}
            <SmartPricingAssistant
              initialRawMaterialCost={rawMaterialCost}
              initialLabourHours={labourHours}
              initialLabourRate={labourRate}
              initialPackagingCost={packagingCost}
              initialTransportCost={transportCost}
              initialOtherCost={otherCost}
              initialProfitMargin={profitMargin}
              initialSelectedPrice={selectedPrice}
              onPriceSelected={handleSmartPriceSelected}
            />

            {/* Actions */}
            <div className="pt-2 space-y-2 mt-auto">
              <button
                type="button"
                disabled={selectedPrice <= 0}
                onClick={() => {
                  if (selectedPrice > 0) setStep(3);
                }}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2 ${
                  selectedPrice > 0
                    ? 'bg-[#963E20] hover:bg-[#80341A] text-white cursor-pointer'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>Continue with ₹{selectedPrice.toLocaleString('en-IN')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review Listing - Product Details with AI Auto-Fill review */}
        {step === 3 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Review & Publish Listing
              </h2>
              <p className="text-sm text-stone-600">
                Verify your craft details before publishing directly to the marketplace.
              </p>
            </div>

            {/* AI Extracted Notification Banner */}
            {hasAiExtracted && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>✨ AI extracted these details from your voice description. Please review and edit before publishing.</span>
              </div>
            )}

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Product Image with Badges */}
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-sm h-48 sm:h-52 bg-stone-100">
              <img
                src={productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'}
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

            {/* Details Form Card */}
            <div className="bg-[#FAF3E7] rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Product Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={productName}
                    placeholder="e.g. Handmade Teak Wood Elephant"
                    onChange={(e) => {
                      setProductName(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 font-semibold text-stone-900 text-sm focus:outline-none focus:border-[#963E20]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSingleFieldVoice('name')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#963E20] cursor-pointer"
                  >
                    <Mic className={`w-4 h-4 ${isListeningMic === 'name' ? 'text-red-500 animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">Selling Price (₹) *</label>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[11px] font-bold text-[#963E20] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Calculator className="w-3 h-3" />
                    Open Pricing Assistant
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    value={selectedPrice > 0 ? selectedPrice : ''}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSelectedPrice(isNaN(val) ? 0 : val);
                      if (validationError) setValidationError('');
                    }}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white border border-stone-300 font-bold text-stone-900 text-base focus:outline-none focus:border-[#963E20]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Description</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={description}
                    placeholder="Describe your craft story, materials, and heritage techniques..."
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 text-stone-800 text-xs sm:text-sm focus:outline-none focus:border-[#963E20] leading-relaxed resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSingleFieldVoice('desc')}
                    className="absolute right-3 top-3 text-stone-500 hover:text-[#963E20] cursor-pointer"
                  >
                    <Mic className={`w-4 h-4 ${isListeningMic === 'desc' ? 'text-red-500 animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Craft Category & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#963E20] font-medium"
                  >
                    <option value="Handlooms & Textiles">Handlooms & Textiles</option>
                    <option value="Pottery & Terracotta">Pottery & Terracotta</option>
                    <option value="Paintings & Fine Art">Paintings & Fine Art</option>
                    <option value="Brass & Metal Crafts">Brass & Metal Crafts</option>
                    <option value="Stone Carving & Sculptures">Stone Carving & Sculptures</option>
                    <option value="Zardozi & Embroidery">Zardozi & Embroidery</option>
                    <option value="Handmade Leathercraft">Handmade Leathercraft</option>
                    <option value="Handicrafts & Decor">Handicrafts & Decor</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Craft Technique</label>
                  <input
                    type="text"
                    value={craftType}
                    placeholder="e.g. Hand Carving, Dhokra"
                    onChange={(e) => setCraftType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#963E20]"
                  />
                </div>
              </div>

              {/* Extra Optional Specs */}
              {showManualEditDetails && (
                <div className="pt-2 border-t border-amber-900/10 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={stockCount}
                        onChange={(e) => setStockCount(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">Dimensions / Size</label>
                      <input
                        type="text"
                        value={dimensions}
                        placeholder="e.g. 10 x 6 x 8 inches"
                        onChange={(e) => setDimensions(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Materials Used (comma separated)
                    </label>
                    <input
                      type="text"
                      value={materialsInput}
                      placeholder="e.g. Teak Wood, Natural Oil Polish"
                      onChange={(e) => setMaterialsInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2 mt-auto">
              <button
                type="button"
                onClick={handlePublish}
                className="w-full py-4 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Publish Product (₹{selectedPrice.toLocaleString('en-IN')})
              </button>

              <button
                type="button"
                onClick={() => setShowManualEditDetails(!showManualEditDetails)}
                className="w-full py-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-stone-600" />
                {showManualEditDetails ? 'Hide Extra Fields' : 'Add Stock & Dimensions'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
