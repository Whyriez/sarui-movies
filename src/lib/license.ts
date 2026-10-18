'use client';

export interface LicenseData {
  type: 'master' | 'demo';
  key: string;
  activatedAt: number;
  expiresAt: number | null; // null for permanent master license
}

export const DEMO_LICENSE_KEY = 'DEMO-SARUI-30M';
export const DEMO_DURATION_MINUTES = 30;

const STORAGE_KEY = 'sarui_stream_license';

/**
 * Retrieve the saved license from localStorage.
 */
export function getStoredLicense(): LicenseData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: LicenseData = JSON.parse(raw);
    if (!parsed || !parsed.type || !parsed.key) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Check if the current license in localStorage is valid and not expired.
 */
export function isLicenseValid(): boolean {
  const license = getStoredLicense();
  if (!license) return false;

  // Master key has permanent access
  if (license.type === 'master') {
    return true;
  }

  // Demo key must not exceed expiresAt
  if (license.type === 'demo' && license.expiresAt) {
    return Date.now() < license.expiresAt;
  }

  return false;
}

/**
 * Calculate remaining seconds for demo license.
 * Returns null if master license or no active license.
 */
export function getRemainingDemoSeconds(): number | null {
  const license = getStoredLicense();
  if (!license || license.type !== 'demo' || !license.expiresAt) return null;
  const remaining = Math.max(0, Math.floor((license.expiresAt - Date.now()) / 1000));
  return remaining;
}

/**
 * Save an active license to localStorage.
 */
export function saveLicense(data: LicenseData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save license to localStorage:', err);
  }
}

/**
 * Clear the license from localStorage (Logout / Reset).
 */
export function clearLicense(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear license:', err);
  }
}

/**
 * Format remaining seconds to mm:ss format.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

