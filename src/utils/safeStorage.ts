/**
 * Safe LocalStorage utility that gracefully handles QuotaExceededError
 * and prevents uncaught storage errors from crashing the React render lifecycle.
 */

export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to read or parse key "${key}":`, err);
    return fallback;
  }
}

export function safeSetItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] QuotaExceededError or write failure for key "${key}":`, err);

    // If quota exceeded, attempt to clean up or compress stored items
    try {
      if (Array.isArray(value)) {
        // If it's a list (like ready products), retain the most recent items and sanitize huge base64 fields if needed
        const pruned = value.slice(0, Math.min(value.length, 25)).map((item: any) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            // If images array contains huge data URLs, keep first one or truncate
            if (Array.isArray(copy.images)) {
              copy.images = copy.images.slice(0, 2);
            }
            return copy;
          }
          return item;
        });

        localStorage.setItem(key, JSON.stringify(pruned));
        return true;
      }
    } catch (recoveryErr) {
      console.warn(`[SafeStorage] Secondary recovery write also failed for key "${key}":`, recoveryErr);
    }

    return false;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to remove key "${key}":`, err);
  }
}
