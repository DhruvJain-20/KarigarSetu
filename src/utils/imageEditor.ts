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
  maxDimension = 1024
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
    stage: isMobile ? 'Preparing photo for mobile AI...' : 'Initializing local AI neural model...',
  });

  // Optimize image dimensions for smooth WASM tensor processing without memory limits
  const prepared = await prepareOptimizedImage(
    imageSource,
    isMobile ? 800 : 1024
  );

  onProgress?.({
    percent: 25,
    stage: 'Downloading neural segmentation model...',
  });

  const progressHandler = (key: string, current: number, total: number) => {
    if (total > 0) {
      const ratio = Math.min(100, Math.round((current / total) * 100));
      const stageName = key.includes('fetch')
        ? 'Downloading AI neural model...'
        : key.includes('compute')
        ? 'Removing 100% background...'
        : 'Generating transparent PNG...';
      onProgress?.({ percent: Math.max(25, ratio), stage: stageName });
    }
  };

  // Attempt 1: Standard built-in loader matching version 1.7.0
  try {
    const config: Config = {
      progress: progressHandler,
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
    console.warn('Attempt 1 (default config) failed, trying Attempt 2 with isnet_quint8...', err1);

    // Attempt 2: Lightweight 8-bit quantized integer weights (universal WebAssembly support)
    try {
      onProgress?.({ percent: 40, stage: 'Loading mobile-optimized neural model...' });
      const config2: Config = {
        model: 'isnet_quint8',
        progress: progressHandler,
        output: {
          format: 'image/png',
          quality: 0.95,
        },
      };

      const outputBlob = await removeBackground(prepared.blob, config2);
      const dataUrl = await blobToDataUrl(outputBlob);
      onProgress?.({ percent: 100, stage: 'Background removed successfully!' });
      return { blob: outputBlob, dataUrl };
    } catch (err2: any) {
      console.warn('Attempt 2 failed, trying Attempt 3 with unpkg CDN...', err2);

      // Attempt 3: unpkg CDN mirror with matching 1.7.0 assets
      try {
        onProgress?.({ percent: 55, stage: 'Retrying with backup AI model source...' });
        const config3: Config = {
          publicPath: 'https://unpkg.com/@imgly/background-removal-data@1.7.0/dist/',
          progress: progressHandler,
          output: {
            format: 'image/png',
            quality: 0.95,
          },
        };

        const outputBlob = await removeBackground(prepared.blob, config3);
        const dataUrl = await blobToDataUrl(outputBlob);
        onProgress?.({ percent: 100, stage: 'Background removed successfully!' });
        return { blob: outputBlob, dataUrl };
      } catch (err3: any) {
        console.warn('Attempt 3 failed, trying Attempt 4 with jsdelivr CDN...', err3);

        // Attempt 4: jsdelivr CDN mirror
        try {
          onProgress?.({ percent: 70, stage: 'Finalizing neural segmentation...' });
          const config4: Config = {
            publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.7.0/dist/',
            progress: progressHandler,
            output: {
              format: 'image/png',
              quality: 0.95,
            },
          };

          const outputBlob = await removeBackground(prepared.blob, config4);
          const dataUrl = await blobToDataUrl(outputBlob);
          onProgress?.({ percent: 100, stage: 'Background removed successfully!' });
          return { blob: outputBlob, dataUrl };
        } catch (err4: any) {
          console.error('All background removal attempts failed:', err4);
          throw new Error('Unable to run AI background removal in this browser. Please check your connection or try another photo.');
        }
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
