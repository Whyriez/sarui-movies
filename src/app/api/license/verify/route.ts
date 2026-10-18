import { NextRequest, NextResponse } from 'next/server';

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

    // 1. Check for Demo License Key
    const normalizedKey = rawKey.toUpperCase();
    if (normalizedKey === 'DEMO-SARUI-30M' || normalizedKey === 'DEMO30' || normalizedKey === 'DEMO') {
      const durationMinutes = 30;
      const expiresAt = Date.now() + durationMinutes * 60 * 1000;
      return NextResponse.json({
        valid: true,
        type: 'demo',
        key: 'DEMO-SARUI-30M',
        expiresAt,
        message: '30-Minute Demo License successfully activated.',
      });
    }

    // 2. Check for Master / Owner License Key from Environment
    const masterKey =
      process.env.STREAM_LICENSE_KEY ||
      process.env.NEXT_PUBLIC_STREAM_LICENSE_KEY ||
      'SARUI-MASTER-VIP-2026';

    if (rawKey === masterKey || rawKey.toLowerCase() === masterKey.toLowerCase()) {
      return NextResponse.json({
        valid: true,
        type: 'master',
        key: rawKey,
        expiresAt: null,
        message: 'Master Owner License verified. Permanent access saved.',
      });
    }

    return NextResponse.json(
      {
        valid: false,
        message: 'Invalid or unregistered license key. Use the Demo key or check your Master Key.',
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

