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
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    imdb_id?: string;
}

export interface TmdbList {
    results: TmdbMedia[];
    total_pages: number;
    page: number;
    total_results: number;
}

export interface TmdbKeywords {
    keywords?: { name: string }[];
    results?: { name: string }[];
}

export interface TmdbVideos {
    results?: { type: string; site: string; key: string; official?: boolean }[];
}

// Target explicit/erotic material without excluding ordinary romance or drama.
const EXPLICIT_KEYWORDS = new Set([
    'porn', 'porno', 'pornography', 'pornographic film', 'adult film',
    'adult cinema', 'erotic', 'erotica', 'erotic movie', 'erotic film',
    'erotic thriller', 'erotic drama', 'softcore', 'softcore pornography',
    'hardcore', 'hardcore pornography', 'sexploitation', 'hentai',
    'pink film', 'pink eiga', 'soft porn', 'pornographic', 'bdsm',
    'explicit sex', 'explicit sexual content', 'sexual content',
    'sex comedy', 'sexual fetish', 'fetishism',
]);

export function hasExplicitKeywords(data: TmdbKeywords): boolean {
    return (data.keywords ?? data.results ?? []).some(({ name }) => EXPLICIT_KEYWORDS.has(name.trim().toLowerCase()));
}

export function getMediaTitle(media: TmdbMedia): string {
    const original = (media.original_title ?? media.original_name)?.trim();
    const localized = (media.title ?? media.name)?.trim();
    return (media.original_language === 'id' ? original || localized : localized || original) || 'Tanpa judul';
}

export function getOverviewText(overview?: string | null): string {
    return overview?.trim() || 'Sinopsis belum tersedia.';
}

export function canShowInCatalog(media: TmdbMedia, type?: MediaType): boolean {
    const mediaType = media.media_type ?? type;
    return (mediaType === 'movie' || mediaType === 'tv') && media.adult !== true
        && typeof media.poster_path === 'string' && /^\/[^\s]+$/.test(media.poster_path)
        && Boolean((media.title ?? media.name ?? media.original_title ?? media.original_name)?.trim());
}

export function getTrailerKey(videos?: TmdbVideos): string | null {
    const trailers = videos?.results?.filter(video => video.type === 'Trailer' && video.site === 'YouTube') ?? [];
    return (trailers.find(video => video.official) ?? trailers[0])?.key ?? null;
}
