import { NextRequest, NextResponse } from 'next/server';
import { CONFIG_CUSTOM_KEYS, type CustomKeyConfig } from '@/lib/license';

function getCustomKeyConfig(rawKey: string): CustomKeyConfig | null {
  const normalized = rawKey.trim().toUpperCase();

  // 1. Check built-in config list
  const found = CONFIG_CUSTOM_KEYS.find(
    (item) => item.key.toUpperCase() === normalized
  );
  if (found) return found;

  // 2. Check environment variable CUSTOM_LICENSE_KEYS (JSON or CSV format)
  // Example JSON: '[{"key":"MYKEY","name":"My Key","durationDays":90}]'
  // Example CSV:  'KEY1:180:Name 1,KEY2:30:Name 2'
  if (process.env.CUSTOM_LICENSE_KEYS) {
    try {
      const parsed = JSON.parse(process.env.CUSTOM_LICENSE_KEYS);
      if (Array.isArray(parsed)) {
        const envFound = parsed.find(
          (item: any) => typeof item?.key === 'string' && item.key.toUpperCase() === normalized
        );
        if (envFound) {
          return {
            key: envFound.key,
            name: envFound.name || envFound.key,
            durationDays: Number(envFound.durationDays) || undefined,
            durationMonths: Number(envFound.durationMonths) || undefined,
            durationMinutes: Number(envFound.durationMinutes) || undefined,
          };
        }
      }
    } catch {
      const parts = process.env.CUSTOM_LICENSE_KEYS.split(',');
      for (const part of parts) {
        const [k, days, name] = part.split(':').map((s) => s.trim());
        if (k && k.toUpperCase() === normalized) {
          return {
            key: k,
            name: name || k,
            durationDays: Number(days) || 180,
          };
        }
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawKey = typeof body?.key === 'string' ? body.key.trim() : '';

    if (!rawKey) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a license key.' },
        { status: 400 }
      );
    }

    // 1. Check for Demo License Key (30 Minutes)
    const normalizedKey = rawKey.toUpperCase();
    if (normalizedKey === 'DEMO-SARUI-30M' || normalizedKey === 'DEMO30' || normalizedKey === 'DEMO') {
      const durationMinutes = 30;
      const expiresAt = Date.now() + durationMinutes * 60 * 1000;
      return NextResponse.json({
        valid: true,
        type: 'demo',
        key: 'DEMO-SARUI-30M',
        name: 'Demo 30M',
        expiresAt,
        message: '30-Minute Demo License successfully activated.',
      });
    }

    // 2. Check for Master / Owner License Key from Environment (Permanent)
    const masterKey =
      process.env.STREAM_LICENSE_KEY ||
      process.env.NEXT_PUBLIC_STREAM_LICENSE_KEY ||
      'SARUI-MASTER-VIP-2026';

    if (rawKey === masterKey || rawKey.toLowerCase() === masterKey.toLowerCase()) {
      return NextResponse.json({
        valid: true,
        type: 'master',
        key: rawKey,
        name: 'Master VIP',
        expiresAt: null,
        message: 'Master Owner License verified. Permanent access saved.',
      });
    }

    // 3. Check for Configurable Duration Keys (e.g. MAGANGBPS2026 - 6 months)
    const customConfig = getCustomKeyConfig(rawKey);
    if (customConfig) {
      let expiresAt: number;
      let durationDesc: string;

      if (customConfig.durationMonths) {
        const future = new Date();
        future.setMonth(future.getMonth() + customConfig.durationMonths);
        expiresAt = future.getTime();
        durationDesc = `${customConfig.durationMonths} months`;
      } else if (customConfig.durationDays) {
        expiresAt = Date.now() + customConfig.durationDays * 24 * 60 * 60 * 1000;
        durationDesc = `${customConfig.durationDays} days`;
      } else if (customConfig.durationMinutes) {
        expiresAt = Date.now() + customConfig.durationMinutes * 60 * 1000;
        durationDesc = `${customConfig.durationMinutes} minutes`;
      } else {
        // Fallback default: 180 days (6 months)
        expiresAt = Date.now() + 180 * 24 * 60 * 60 * 1000;
        durationDesc = '6 months';
      }

      return NextResponse.json({
        valid: true,
        type: 'custom',
        key: customConfig.key,
        name: customConfig.name,
        expiresAt,
        message: `${customConfig.name} key verified successfully. Access granted for ${durationDesc}.`,
      });
    }

    return NextResponse.json(
      {
        valid: false,
        message: 'Invalid or unregistered license key. Please check your key and try again.',
      },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: 'A system error occurred while validating the license.' },
      { status: 500 }
    );
  }
}

