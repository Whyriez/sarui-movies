export type MediaType = 'movie' | 'tv';

export interface TmdbMedia {
    id: number;
    adult?: boolean;
    media_type?: string;
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    original_language?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    imdb_id?: string;
    vote_average?: number;
    status?: string;
}

export interface TmdbList {
    results: TmdbMedia[];
    total_pages: number;
    page: number;
    total_results: number;
}

export interface TmdbVideos {
    results?: { type: string; site: string; key: string; official?: boolean }[];
}

export function isPosterValid(posterPath?: string | null): boolean {
    return typeof posterPath === 'string' && /^\/[^\s]+$/.test(posterPath);
}

export function isDateReleased(dateStr?: string | null): boolean {
    if (!dateStr || !dateStr.trim()) return false;
    const releaseTime = new Date(dateStr).getTime();
    if (isNaN(releaseTime)) return false;
    // Buffer 24 jam untuk perbedaan zona waktu dunia
    const now = Date.now() + 86400000;
    return releaseTime <= now;
}

export function isStatusReleased(type: MediaType, status?: string | null, releaseDate?: string | null): boolean {
    if (type === 'movie') {
        if (status) {
            return status.toLowerCase() === 'released';
        }
        return releaseDate ? isDateReleased(releaseDate) : true;
    }
    if (type === 'tv') {
        if (status) {
            const unreleased = ['in production', 'post production', 'planned', 'pilot'];
            if (unreleased.includes(status.toLowerCase())) return false;
        }
        return releaseDate ? isDateReleased(releaseDate) : true;
    }
    return true;
}

export function canShowInCatalog(media: TmdbMedia, type?: MediaType): boolean {
    const mediaType = (media.media_type ?? type) as MediaType | undefined;
    if (mediaType !== 'movie' && mediaType !== 'tv') return false;

    // Filter film/series yang posternya hilang atau null
    if (!isPosterValid(media.poster_path)) {
        return false;
    }

    // Harus memiliki judul / nama yang valid
    const title = (media.title ?? media.name ?? media.original_title ?? media.original_name)?.trim();
    if (!title) return false;

    // Filter film yang belum released jika status tersedia
    if (media.status && !isStatusReleased(mediaType, media.status, media.release_date ?? media.first_air_date)) {
        return false;
    }

    // Filter film dengan tanggal rilis di masa depan (belum tayang / post-production)
    const dateStr = media.release_date ?? media.first_air_date;
    if (dateStr && !isDateReleased(dateStr)) {
        return false;
    }

    return true;
}

export function getMediaTitle(media: TmdbMedia): string {
    const localized = (media.title ?? media.name)?.trim();
    const original = (media.original_title ?? media.original_name)?.trim();
    return localized || original || 'Untitled';
}

export function getOverviewText(overview?: string | null): string {
    return overview?.trim() || 'Synopsis not available.';
}

export function getTrailerKey(videos?: TmdbVideos): string | null {
    const trailers = videos?.results?.filter(video => video.type === 'Trailer' && video.site === 'YouTube') ?? [];
    return (trailers.find(video => video.official) ?? trailers[0])?.key ?? null;
}

// Deprecated: Limitasi 18+ telah dicabut, dipertahankan sebagai no-op
export function hasExplicitKeywords(): boolean {
    return false;
}
