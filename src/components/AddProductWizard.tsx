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
  Loader2
} from 'lucide-react';
import { ReadyProduct, Language, ArtisanUserProfile } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { removeImageBackground, triggerImageDownload, ProcessingProgress } from '../utils/imageEditor';
import { ImageCropperModal } from './ImageCropperModal';
import { LiveCameraModal } from './LiveCameraModal';

interface AddProductWizardProps {
  language: Language;
  onClose: () => void;
  onProductCreated: (product: ReadyProduct) => void;
  artisanProfile?: ArtisanUserProfile;
}

export function AddProductWizard({ language, onClose, onProductCreated, artisanProfile }: AddProductWizardProps) {
  // Wizard steps: 1 = AI Photo Studio, 2 = Smart Pricing, 3 = Review & Publish
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Photo studio state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // AI Adjustments toggles (Sharpen details removed as requested)
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

  // Step 2: Pricing state (clean defaults)
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [isCustomPriceMode, setIsCustomPriceMode] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');

  // Step 3: Listing details state - empty initial values & placeholders
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

  // Image Upload handler with instant compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  // Real client-side AI background removal (100% Free, browser-based)
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
      }, 1500);
    }
  };

  // Handle Crop Completion
  const handleCropComplete = (croppedDataUrl: string) => {
    setProductImage(croppedDataUrl);
    setCroppedImage(croppedDataUrl);
  };

  // Reset to original image
  const handleResetToOriginal = () => {
    if (!originalImage) return;
    setProductImage(originalImage);
    setCroppedImage(null);
    setBgRemovedImage(null);
    setAiAdjustments({ removeBg: false, improveLighting: false });
    setStudioErrorMessage('');
  };

  // Direct image download
  const handleDownload = () => {
    if (!productImage) return;
    const isPng = bgRemovedImage || productImage.startsWith('data:image/png');
    triggerImageDownload(productImage, `karigar-artisan-craft-${Date.now()}.${isPng ? 'png' : 'jpg'}`);
  };

  // Global mouse up / touch end listener for smooth slider dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDraggingSlider(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider && sliderContainerRef.current) {
        const rect = sliderContainerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
      }
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && sliderContainerRef.current && e.touches[0]) {
        const rect = sliderContainerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
      }
    };

    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
      window.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDraggingSlider]);

  // Click or drag on slider container
  const handleSliderPointerDown = (clientX: number) => {
    setIsDraggingSlider(true);
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  // Voice AI simulation
  const handleVoiceInput = (field: 'name' | 'price' | 'desc') => {
    setIsListeningMic(field);
    setTimeout(() => {
      setIsListeningMic(null);
      if (field === 'name') {
        setProductName((prev) => (prev ? prev + ' (Handmade Masterpiece)' : 'Authentic Handcrafted Piece'));
      } else if (field === 'price') {
        setSelectedPrice(selectedPrice > 0 ? Math.round(selectedPrice * 1.05) : 1500);
      } else if (field === 'desc') {
        setDescription(
          (prev) =>
            (prev ? prev + ' ' : '') +
            'Handcrafted using traditional techniques with 100% natural materials and verified artisan craftsmanship.'
        );
      }
    }, 1500);
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

    const newProduct: ReadyProduct = {
      id: `prod-${Date.now()}`,
      name: productName.trim(),
      hindiName: productName.trim(),
      description: description.trim() || 'Authentic handmade artifact crafted with exquisite care and heritage methods.',
      hindiDescription: description.trim() || 'प्रामाणिक हस्तशिल्प उत्पाद।',
      price: selectedPrice,
      originalPrice: Math.round(selectedPrice * 1.2),
      category: category || 'Handicrafts',
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
      createdAt: new Date().toISOString(),
    };

    onProductCreated(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-amber-900/10">
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
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D1EBE1] text-[#1D5C4A] text-xs font-semibold rounded-full">
              {language === 'hi' ? 'हिन्दी' : 'English'}
            </span>
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
            <span className={step === 1 ? 'text-[#963E20] font-bold' : ''}>Photo Studio</span>
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

        {/* Step 1: Upload Product Photo from Device & Enhance */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Add Product Photo
              </h2>
              <p className="text-sm text-stone-600">
                Upload a photo of your handmade craft directly from your device.
              </p>
            </div>

            {/* Photo Action Upload Area */}
            {!productImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#963E20]/40 hover:border-[#963E20] bg-white rounded-3xl p-8 text-center cursor-pointer transition-all hover:bg-amber-50/40 space-y-4 shadow-xs"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 text-[#963E20] flex items-center justify-center mx-auto shadow-inner">
                  {isProcessingImage ? (
                    <Sparkles className="w-8 h-8 animate-spin" />
                  ) : (
                    <ImageIcon className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900">
                    {isProcessingImage ? 'Optimizing Image...' : 'Click to Upload Photo from Device'}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Select a photo from your gallery or files (PNG, JPG, WEBP).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiveCameraOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-[#963E20]/30 text-[#963E20] font-bold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4 text-[#963E20]" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload from Device</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If image is uploaded: Interactive Before/After Split Comparison Slider + Photo Studio Controls */
              <div className="space-y-4">
                {/* Progress / Status Bar during Background Removal */}
                {isRemovingBg && bgRemovalProgress && (
                  <div className="p-3.5 bg-amber-100/70 border border-amber-300 rounded-2xl space-y-1.5 shadow-xs animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-[#963E20]">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-[#963E20]" />
                        <span>{bgRemovalProgress.stage}</span>
                      </div>
                      <span>{bgRemovalProgress.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-amber-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#963E20] transition-all duration-300 rounded-full"
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

                {/* Split Slider Preview - Fully smooth drag with zero image dragging/ghosting */}
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

                  {/* Bottom pill message */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-stone-900/80 backdrop-blur text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md pointer-events-none">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Slide smoothly to compare Before & After</span>
                  </div>
                </div>

                {/* AI Adjustments & Editing Controls */}
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
                    {/* Remove Background Button */}
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

                    {/* Crop Image Button */}
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

                    {/* Download Processed Image Button */}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 shadow-xs cursor-pointer col-span-2 sm:col-span-1"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Download Image</span>
                    </button>
                  </div>

                  {/* Secondary Lighting Toggle (Sharpen details removed) */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setAiAdjustments((prev) => ({
                          ...prev,
                          improveLighting: !prev.improveLighting,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                        aiAdjustments.improveLighting
                          ? 'bg-[#D1EBE1] text-[#1D5C4A] border-[#A8D8C7]'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Studio Lighting
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Camera Modal */}
            {isLiveCameraOpen && (
              <LiveCameraModal
                onCapture={handleLiveCameraCapture}
                onClose={() => setIsLiveCameraOpen(false)}
              />
            )}

            {/* Image Cropper Modal */}
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

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2 mt-auto">
              <button
                type="button"
                disabled={!productImage}
                onClick={() => {
                  if (productImage) setStep(2);
                }}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2 ${
                  productImage
                    ? 'bg-[#963E20] hover:bg-[#80341A] text-white cursor-pointer'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                Continue to Pricing
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
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
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

        {/* Step 2: Smart Pricing */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Set Selling Price
              </h2>
              <p className="text-sm text-stone-600">
                Enter your fair selling price for this handmade craft.
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
                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {productName || 'New Handmade Product'}
                </h4>
                <p className="text-xs text-stone-500">{category}</p>
              </div>
            </div>

            {/* Price Input Card */}
            <div className="bg-[#FAF3E7] rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#963E20] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#963E20]" />
                Fair Craft Valuation
              </div>

              <div className="text-center space-y-2 py-1">
                <label className="text-xs font-medium text-stone-600">Enter Your Selling Price (₹)</label>
                <div className="flex items-center justify-center">
                  <div className="relative max-w-xs w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-stone-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={selectedPrice > 0 ? selectedPrice : ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setSelectedPrice(isNaN(val) ? 0 : val);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-2xl font-extrabold text-2xl sm:text-3xl text-stone-900 text-center focus:ring-2 focus:ring-[#963E20] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-2.5 pt-2 border-t border-amber-200/60">
                <div className="bg-white/80 rounded-xl p-3 border border-amber-900/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-[#963E20]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      0% Marketplace Commission
                    </div>
                    <div className="text-[11px] text-stone-600">
                      You receive 100% of the customer payment directly to your registered bank account or UPI.
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-amber-900/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      Handmade Authenticity Guarantee
                    </div>
                    <div className="text-[11px] text-stone-600">
                      Your product will carry a verified artisan badge for buyers across India.
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

        {/* Step 3: Review Listing - Product Details with Clean Empty Placeholders */}
        {step === 3 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Product Details
              </h2>
              <p className="text-sm text-stone-600">
                Fill in the craft name and description for your customer listing.
              </p>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Product Image with Badges */}
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-sm h-48 sm:h-52 bg-stone-100">
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

            {/* Details Form Card */}
            <div className="bg-[#FAF3E7] rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Product Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={productName}
                    placeholder=""
                    onChange={(e) => {
                      setProductName(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 font-semibold text-stone-900 text-sm focus:outline-none focus:border-[#963E20]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput('name')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#963E20] cursor-pointer"
                  >
                    <Mic className={`w-4 h-4 ${isListeningMic === 'name' ? 'text-red-500 animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Selling Price (₹) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={selectedPrice > 0 ? selectedPrice : ''}
                    placeholder=""
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSelectedPrice(isNaN(val) ? 0 : val);
                      if (validationError) setValidationError('');
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 font-bold text-stone-900 text-base focus:outline-none focus:border-[#963E20]"
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
                    placeholder=""
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-stone-300 text-stone-800 text-xs sm:text-sm focus:outline-none focus:border-[#963E20] leading-relaxed resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput('desc')}
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
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#963E20]"
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
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Craft Type</label>
                  <input
                    type="text"
                    value={craftType}
                    placeholder=""
                    onChange={(e) => setCraftType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#963E20]"
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
                        placeholder=""
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
                      placeholder=""
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
                Publish Product
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
