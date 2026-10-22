export type LicenseType = 'master' | 'demo' | 'custom';

export interface LicenseData {
  type: LicenseType;
  key: string;
  name?: string;
  activatedAt: number;
  expiresAt: number | null; // null for permanent master license
}

export interface CustomKeyConfig {
  key: string;
  name: string;
  durationMonths?: number;
  durationDays?: number;
  durationMinutes?: number;
}

/**
 * Configurable list of custom duration license keys.
 * You can add more keys here or override/extend via process.env.CUSTOM_LICENSE_KEYS.
 */
export const CONFIG_CUSTOM_KEYS: CustomKeyConfig[] = [
  {
    key: 'MAGANGBPS2026',
    name: 'Magang BPS 2026',
    durationMonths: 6,
    durationDays: 180,
  },
];

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

  // Master key has permanent access (or any license with no expiration)
  if (license.type === 'master' || license.expiresAt === null) {
    return true;
  }

  // Time-limited keys (demo, custom) must not exceed expiresAt
  if (license.expiresAt) {
    return Date.now() < license.expiresAt;
  }

  return false;
}

/**
 * Calculate remaining seconds for any time-limited license (demo or custom).
 * Returns null if master license or no active license.
 */
export function getRemainingSeconds(): number | null {
  const license = getStoredLicense();
  if (!license || license.expiresAt === null) return null;
  const remaining = Math.max(0, Math.floor((license.expiresAt - Date.now()) / 1000));
  return remaining;
}

/**
 * Backwards-compatible alias for getRemainingSeconds.
 */
export function getRemainingDemoSeconds(): number | null {
  return getRemainingSeconds();
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
 * Format remaining seconds into a user-friendly duration string.
 * - Days: e.g. "180d"
 * - Hours: e.g. "2h 15m"
 * - Minutes / Seconds: "mm:ss"
 */
export function formatDuration(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return `${days}d`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

