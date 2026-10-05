import { NextRequest, NextResponse } from 'next/server';
import { getTmdbData, TmdbError } from '@/lib/tmdb-server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        return NextResponse.json(await getTmdbData(params.path.join('/'), request.nextUrl.searchParams));
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof TmdbError ? error.message : 'Data TMDB gagal dimuat. Coba lagi.' },
            { status: error instanceof TmdbError ? error.status : 502 }
        );
    }
}
