import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, ZoomIn, Crop as CropIcon, Sparkles } from 'lucide-react';
import { cropImageToBlob } from '../utils/imageEditor';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string, croppedBlob: Blob) => void;
  onClose: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect?: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 85,
      },
      aspect || 1,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropperModal({ imageSrc, onCropComplete, onClose }: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined); // default freeform
  const [isApplying, setIsApplying] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const handleSetAspect = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, newAspect));
    }
  };

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      onClose();
      return;
    }

    try {
      setIsApplying(true);
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const pixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const result = await cropImageToBlob(imageSrc, pixelCrop);
      onCropComplete(result.dataUrl, result.blob);
      onClose();
    } catch (err) {
      console.error('Failed to crop image:', err);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-900/10 flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#963E20] flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">Crop Image</h3>
              <p className="text-[11px] text-stone-500">Drag corners or box to frame your product</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="px-5 py-2.5 bg-amber-50/60 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-stone-700 text-[11px] shrink-0 mr-1">Aspect:</span>
          <button
            type="button"
            onClick={() => handleSetAspect(undefined)}
            className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
              aspect === undefined
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Freeform
          </button>
          <button
            type="button"
            onClick={() => handleSetAspect(1)}
            className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
              aspect === 1
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            1:1 Square
          </button>
          <button
            type="button"
            onClick={() => handleSetAspect(4 / 3)}
            className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
              aspect === 4 / 3
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            4:3 Standard
          </button>
          <button
            type="button"
            onClick={() => handleSetAspect(16 / 9)}
            className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
              aspect === 16 / 9
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            16:9 Wide
          </button>
        </div>

        {/* Cropper Container */}
        <div className="p-4 flex-1 flex items-center justify-center min-h-[260px] max-h-[55vh] overflow-auto bg-stone-900/90 select-none">
          <div className="flex justify-center items-center max-w-full max-h-full">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[50vh] max-w-full"
            >
              <img
                ref={imgRef}
                alt="Crop preview target"
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-h-[50vh] max-w-full object-contain mx-auto"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isApplying}
            onClick={handleApplyCrop}
            className="flex-1 py-3 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isApplying ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Applying Crop...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Crop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
