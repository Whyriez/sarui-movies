import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedToken } from '@/lib/embedToken';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaId = searchParams.get('mediaId');

  if (!mediaId) {
    return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
  }

  const token = generateEmbedToken(mediaId, 180);
  return NextResponse.json({ token });
}

