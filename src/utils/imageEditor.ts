/**
 * High-performance client-side Background Removal & Image Utilities
 * 100% Free, runs entirely in the user's browser via WebAssembly / ONNX neural segmentation.
 * Zero paid APIs, Zero server load, fully compatible with all mobile browsers (iOS Safari, Android Chrome).
 */

import { removeBackground, Config } from '@imgly/background-removal';

export interface ProcessingProgress {
  percent: number;
  stage: string;
}

// Official high-speed CDN assets URL matching package version 1.5.7
const IMGLY_PUBLIC_PATH = 'https://staticimgly.com/@imgly/background-removal-data@1.5.7/dist/';
const FALLBACK_PUBLIC_PATH = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.5.7/dist/';

/**
 * Detects if the user is on a mobile device or tablet
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.innerWidth < 768)
  );
}

/**
 * Converts a Blob to a base64 Data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts an image URL / Data URL to an HTMLImageElement
 */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Pre-processes image to ensure standard RGB pixel buffers without mobile memory exhaustion
 */
export async function prepareOptimizedImage(
  imageSource: string | Blob | File,
  maxDimension = 1200
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  let srcUrl = '';
  if (typeof imageSource === 'string') {
    srcUrl = imageSource;
  } else {
    srcUrl = await blobToDataUrl(imageSource);
  }

  const img = await loadImageElement(srcUrl);
  let { naturalWidth: width, naturalHeight: height } = img;

  if (width <= 0) width = img.width || 600;
  if (height <= 0) height = img.height || 600;

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to prepare image for background removal'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob, dataUrl, width, height });
    }, 'image/png');
  });
}

/**
 * Primary AI Background Removal running in user's browser
 * Uses neural segmentation model with full background eradication on both mobile & desktop.
 */
export async function removeImageBackground(
  imageSource: string | Blob | File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  const isMobile = isMobileDevice();

  onProgress?.({
    percent: 15,
    stage: isMobile ? 'Preparing image for mobile AI...' : 'Initializing local AI neural model...',
  });

  // Optimize image dimensions for smooth WASM tensor processing
  const prepared = await prepareOptimizedImage(
    imageSource,
    isMobile ? 800 : 1200
  );

  onProgress?.({
    percent: 30,
    stage: isMobile ? 'Loading mobile AI segmentation model...' : 'Downloading AI neural model...',
  });

  // Attempt 1: Standard Neural Inference with explicit CDN publicPath
  try {
    const config: Config = {
      publicPath: IMGLY_PUBLIC_PATH,
      // For mobile, use 'isnet_quint8' which has universal 8-bit WebAssembly support without SIMD crashes
      model: isMobile ? 'isnet_quint8' : 'isnet',
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const ratio = Math.min(100, Math.round((current / total) * 100));
          const stageName = key.includes('fetch')
            ? isMobile ? 'Loading AI segmentation model...' : 'Downloading AI neural model...'
            : key.includes('compute')
            ? 'Removing 100% background...'
            : 'Generating transparent PNG...';
          onProgress?.({ percent: Math.max(30, ratio), stage: stageName });
        }
      },
      output: {
        format: 'image/png',
        quality: 0.95,
      },
    };

    const outputBlob = await removeBackground(prepared.blob, config);
    onProgress?.({ percent: 95, stage: 'Generating transparent PNG...' });
    const dataUrl = await blobToDataUrl(outputBlob);
    onProgress?.({ percent: 100, stage: 'Background removed successfully!' });

    return { blob: outputBlob, dataUrl };
  } catch (err1: any) {
    console.warn('Attempt 1 with primary CDN/model failed, trying fallback CDN & lightweight neural model...', err1);

    // Attempt 2: Fallback with alternative CDN and lightweight integer quantized model
    try {
      onProgress?.({ percent: 45, stage: 'Retrying with lightweight mobile AI model...' });
      const fallbackConfig: Config = {
        publicPath: FALLBACK_PUBLIC_PATH,
        model: 'isnet_quint8',
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const ratio = Math.min(100, Math.round((current / total) * 100));
            onProgress?.({ percent: Math.max(45, ratio), stage: 'Removing background...' });
          }
        },
        output: {
          format: 'image/png',
          quality: 0.95,
        },
      };

      const outputBlob = await removeBackground(prepared.blob, fallbackConfig);
      const dataUrl = await blobToDataUrl(outputBlob);
      onProgress?.({ percent: 100, stage: 'Background removed successfully!' });
      return { blob: outputBlob, dataUrl };
    } catch (err2: any) {
      console.warn('Attempt 2 failed, trying default bundle config...', err2);

      // Attempt 3: Default unpkg bundle without explicit publicPath override
      try {
        onProgress?.({ percent: 60, stage: 'Finalizing background segmentation...' });
        const defaultConfig: Config = {
          output: {
            format: 'image/png',
            quality: 0.95,
          },
        };
        const outputBlob = await removeBackground(prepared.blob, defaultConfig);
        const dataUrl = await blobToDataUrl(outputBlob);
        onProgress?.({ percent: 100, stage: 'Background removed successfully!' });
        return { blob: outputBlob, dataUrl };
      } catch (err3: any) {
        console.error('All neural background removal attempts failed:', err3);
        throw new Error(
          'Could not remove background automatically. Please ensure WebAssembly is enabled in your mobile browser.'
        );
      }
    }
  }
}

/**
 * High-precision canvas crop with transparent PNG output
 */
export async function cropImageToBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<{ blob: Blob; dataUrl: string }> {
  const image = await loadImageElement(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Draw cropped slice onto canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate cropped image'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob, dataUrl });
    }, 'image/png');
  });
}

/**
 * Triggers instant browser download of the image
 */
export function triggerImageDownload(imageUrlOrData: string, filename = 'karigar-product.png') {
  const link = document.createElement('a');
  link.href = imageUrlOrData;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
