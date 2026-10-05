import { Movie } from '@/interface/Movies';
import { getMediaTitle, getOverviewText, MediaType, TmdbMedia } from './tmdb-policy';

export async function fetchTmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const response = await fetch(`/api/tmdb/${path}?${new URLSearchParams(params)}`);
    if (!response.ok) throw new Error('Data gagal dimuat. Silakan coba lagi.');
    return response.json();
}

export function toMediaCard(media: TmdbMedia, type?: MediaType): Movie {
    const mediaType = media.media_type ?? type ?? 'movie';
    const title = getMediaTitle(media);
    return {
        imdb_id: media.imdb_id ?? '',
        tmdb_id: String(media.id), title, mediaType,
        embed_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/${mediaType}/${media.imdb_id ?? media.id}`,
        embed_url_tmdb: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/${mediaType}/${media.id}`,
        quality: '',
        details: {
            title, poster_path: media.poster_path ?? '',
            overview: getOverviewText(media.overview),
            release_date: media.release_date ?? media.first_air_date ?? '',
        },
    };
}
