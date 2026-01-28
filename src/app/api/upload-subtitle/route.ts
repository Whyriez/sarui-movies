import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase (Gunakan Service Role Key agar bisa bypass RLS saat upload server-side jika perlu)
// Atau gunakan Anon key jika policy bucket sudah allow insert public.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan Service Role Key untuk akses penuh di backend
);

// Helper: Convert SRT string ke VTT string
function convertSrtToVtt(srtContent: string): string {
  // 1. Ganti koma (,) di timestamp menjadi titik (.)
  let vtt = srtContent.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
  
  // 2. Tambahkan header WEBVTT
  if (!vtt.startsWith('WEBVTT')) {
    vtt = 'WEBVTT\n\n' + vtt;
  }
  
  return vtt;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    let fileBody: BodyInit | string = file;
    let contentType = 'text/vtt';
    let finalFileName = `${Date.now()}-${fileName.replace(/\.srt$/i, '.vtt')}`; // Pakai timestamp biar unik

    // LOGIKA KONVERSI
    if (fileExt === 'srt') {
      const text = await file.text();
      const vttContent = convertSrtToVtt(text);
      fileBody = vttContent;
      contentType = 'text/vtt';
    } else if (fileExt === 'vtt') {
        // Jika sudah vtt, biarkan saja
        fileBody = file;
    } else {
        return NextResponse.json({ error: 'Only .srt and .vtt files are allowed' }, { status: 400 });
    }

    // UPLOAD KE SUPABASE
    const { data, error } = await supabase.storage
      .from('temp-subtitles') // Pastikan nama bucket sesuai
      .upload(finalFileName, fileBody, {
        contentType: contentType,
        upsert: false
      });

    if (error) {
      console.error('Supabase Upload Error:', error);
      throw error;
    }

    // DAPATKAN PUBLIC URL
    const { data: { publicUrl } } = supabase.storage
      .from('temp-subtitles')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}