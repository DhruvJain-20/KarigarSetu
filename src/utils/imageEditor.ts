/**
 * High-performance client-side Background Removal & Image Utilities
 * 100% Free, runs entirely in the user's browser via WebAssembly / ONNX segmentation model.
 * Zero paid APIs, Zero server load, fully compatible with Vercel deployment.
 */

import { removeBackground } from '@imgly/background-removal';

export interface ProcessingProgress {
  percent: number;
  stage: string;
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
 * Fallback smart client-side canvas background removal
 * Used seamlessly if WebAssembly ONNX runtime fails or runs out of memory on low-end mobile devices.
 */
export async function smartCanvasRemoveBackground(imageSrc: string): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImageElement(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Sample corner background color
  const samplePixels = [
    [0, 0],
    [canvas.width - 1, 0],
    [0, canvas.height - 1],
    [canvas.width - 1, canvas.height - 1],
    [Math.floor(canvas.width / 2), 0],
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const [x, y] of samplePixels) {
    const idx = (y * canvas.width + x) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR = Math.round(bgR / samplePixels.length);
  bgG = Math.round(bgG / samplePixels.length);
  bgB = Math.round(bgB / samplePixels.length);

  const threshold = 40;
  const feather = 20;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
    );

    if (dist < threshold) {
      data[i + 3] = 0; // Fully transparent
    } else if (dist < threshold + feather) {
      const alphaFactor = (dist - threshold) / feather;
      data[i + 3] = Math.round(data[i + 3] * alphaFactor);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create transparent PNG blob'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob, dataUrl });
    }, 'image/png');
  });
}

/**
 * Primary AI Background Removal running 100% in user's browser
 */
export async function removeImageBackground(
  imageSource: string | Blob | File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  try {
    onProgress?.({ percent: 15, stage: 'Initializing local AI model...' });

    // Run @imgly/background-removal
    const outputBlob = await removeBackground(imageSource, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const ratio = Math.min(100, Math.round((current / total) * 100));
          const stageName = key.includes('fetch')
            ? 'Downloading AI neural model...'
            : key.includes('compute')
            ? 'Segmenting foreground & removing background...'
            : 'Processing transparent PNG...';
          onProgress?.({ percent: Math.max(20, ratio), stage: stageName });
        }
      },
      output: {
        format: 'image/png',
        quality: 0.95,
      },
    });

    onProgress?.({ percent: 95, stage: 'Generating transparent PNG...' });
    const dataUrl = await blobToDataUrl(outputBlob);
    onProgress?.({ percent: 100, stage: 'Done!' });

    return {
      blob: outputBlob,
      dataUrl,
    };
  } catch (err: any) {
    console.warn('AI WebAssembly model fallback triggered:', err);
    onProgress?.({ percent: 50, stage: 'Applying high-speed edge segmentation fallback...' });
    
    // If input is Blob/File, convert to Data URL first
    let srcUrl = '';
    if (typeof imageSource === 'string') {
      srcUrl = imageSource;
    } else {
      srcUrl = await blobToDataUrl(imageSource);
    }

    const fallbackResult = await smartCanvasRemoveBackground(srcUrl);
    onProgress?.({ percent: 100, stage: 'Completed with smart segmentation!' });
    return fallbackResult;
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
