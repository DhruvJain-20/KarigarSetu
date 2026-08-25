/**
 * Client-side image compression and resizing utility.
 * Downscales high-resolution camera / gallery photos to a lightweight Data URL,
 * avoiding localStorage QuotaExceededError and improving preview speeds.
 */

export async function compressImage(
  fileOrDataUrl: File | Blob | string,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's already an HTTP / Unsplash URL, no need to compress
    if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
      return resolve(fileOrDataUrl);
    }

    const img = new Image();

    const processLoadedImage = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original
        if (typeof fileOrDataUrl === 'string') {
          return resolve(fileOrDataUrl);
        }
        return resolve(img.src);
      }

      // Draw with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Output as compressed JPEG data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onload = processLoadedImage;
    img.onerror = () => {
      // If image loading fails, resolve with what we have or reject gracefully
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        reject(new Error('Failed to process image file'));
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('FileReader returned empty result'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
