import 'server-only';
import { cache } from 'react';
import { canShowInCatalog, getMediaTitle, isDateReleased, isPosterValid, MediaType, TmdbList, TmdbMedia, TmdbVideos } from './tmdb-policy';

export class TmdbError extends Error {
    constructor(message: string, public status: number) { super(message); }
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const base = process.env.TMDB_BASE_URL ?? process.env.NEXT_PUBLIC_TMDB_BASE_URL ?? 'https://api.themoviedb.org/3';
    const token = process.env.TMDB_API_BEARER_TOKEN ?? process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN;
    const apiKey = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY_TMDB;
    if (!token && !apiKey) throw new TmdbError('TMDB configuration is not available.', 503);
    const url = new URL(`${base.replace(/\/$/, '')}/${path}`);
    url.search = new URLSearchParams({ language: 'en-US', ...params }).toString();
    if (!token && apiKey) url.searchParams.set('api_key', apiKey);
    const response = await fetch(url, {
        headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new TmdbError('Failed to load TMDB data.', response.status === 404 ? 404 : 502);
    return response.json();
}

interface OverviewData {
    overview?: string;
    seasons?: { id: number; overview?: string }[];
    episodes?: { id: number; overview?: string }[];
}

async function optionalEnglish<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
    try { return await request<T>(path, { ...params, language: 'en-US' }); }
    catch { return null; }
}

async function fillDetailOverviews<T extends OverviewData>(path: string, data: T): Promise<T> {
    const missing = !data.overview?.trim()
        || data.seasons?.some(season => !season.overview?.trim())
        || data.episodes?.some(episode => !episode.overview?.trim());
    if (!missing) return data;
    const english = await optionalEnglish<OverviewData>(path);
    const fillChildren = (items: { id: number; overview?: string }[], fallback?: { id: number; overview?: string }[]) => {
        const byId = new Map(fallback?.map(item => [item.id, item.overview?.trim()]));
        return items.map(item => ({ ...item, overview: item.overview?.trim() || byId.get(item.id) || '' }));
    };
    return {
        ...data,
        overview: data.overview?.trim() || english?.overview?.trim() || '',
        ...(data.seasons ? { seasons: fillChildren(data.seasons, english?.seasons) } : {}),
        ...(data.episodes ? { episodes: fillChildren(data.episodes, english?.episodes) } : {}),
    };
}

async function fillCatalogOverviews(path: string, params: Record<string, string>, data: TmdbList): Promise<TmdbList> {
    if (!data.results.some(media => !media.overview?.trim())) return data;
    const english = await optionalEnglish<TmdbList>(path, params);
    if (!english) return data;
    const byId = new Map(english?.results?.map(media => [
        `${media.media_type ?? data.results[0]?.media_type}-${media.id}`, media.overview?.trim(),
    ]));
    const results: TmdbMedia[] = [];
    for (let offset = 0; offset < data.results.length; offset += 4) {
        results.push(...await Promise.all(data.results.slice(offset, offset + 4).map(async media => {
            let overview = media.overview?.trim() || byId.get(`${media.media_type}-${media.id}`) || '';
            if (!overview) {
                const detail = await optionalEnglish<TmdbMedia>(`${media.media_type}/${media.id}`);
                overview = detail?.overview?.trim() || '';
            }
            return { ...media, overview };
        })));
    }
    return { ...data, results };
}

export const getSafeDetails = cache(async <T extends TmdbMedia>(type: MediaType, id: string): Promise<T> => {
    if (!/^\d+$/.test(id)) throw new TmdbError('Invalid ID.', 400);
    const data = await request<T & { status?: string; poster_path?: string | null; release_date?: string; first_air_date?: string }>(`${type}/${id}`);

    // Poster is mandatory and must be valid
    if (!isPosterValid(data.poster_path)) {
        throw new TmdbError('Movie poster is not available.', 404);
    }

    // Status must be Released for movies, cannot be In Production / Post Production / Planned / Pilot for series
    if (type === 'movie') {
        if (data.status && data.status.toLowerCase() !== 'released') {
            throw new TmdbError(`Movie has not been released yet (status: ${data.status}).`, 404);
        }
        if (data.release_date && !isDateReleased(data.release_date)) {
            throw new TmdbError('Movie has not been released yet.', 404);
        }
    } else if (type === 'tv') {
        const unreleasedTv = ['in production', 'post production', 'planned', 'pilot'];
        if (data.status && unreleasedTv.includes(data.status.toLowerCase())) {
            throw new TmdbError(`Series has not been released yet (status: ${data.status}).`, 404);
        }
        if (data.first_air_date && !isDateReleased(data.first_air_date)) {
            throw new TmdbError('Series has not been released yet.', 404);
        }
    }

    const title = getMediaTitle(data);
    const details = await fillDetailOverviews(`${type}/${id}`, data);
    return { ...details, ...(type === 'movie' ? { title } : { name: title }) };
});

export const getVideos = cache(async (type: MediaType, id: string): Promise<TmdbVideos> => {
    try {
        const localized = await request<TmdbVideos>(`${type}/${id}/videos`);
        if (localized.results?.some(video => video.type === 'Trailer' && video.site === 'YouTube')) return localized;
        return await request<TmdbVideos>(`${type}/${id}/videos`, { language: 'en-US' });
    } catch { return { results: [] }; }
});

export const getSafeSeason = cache(async (id: string, season: string) => {
    if (!/^\d+$/.test(season)) throw new TmdbError('Invalid season.', 400);
    await getSafeDetails('tv', id);
    const path = `tv/${id}/season/${season}`;
    const data = await request<import('@/interface/Tv').SeasonDetails & { episodes: import('@/interface/Tv').Episode[] }>(path);
    return fillDetailOverviews(path, data);
});

async function filterCatalog(data: TmdbList, type?: MediaType): Promise<TmdbList> {
    const candidates = data.results.filter(media => canShowInCatalog(media, type));
    const results: TmdbMedia[] = [];

    for (let offset = 0; offset < candidates.length; offset += 4) {
        const batch = await Promise.all(candidates.slice(offset, offset + 4).map(async media => {
            const mediaType = (media.media_type ?? type) as MediaType;
            try {
                let status = media.status;
                let posterPath = media.poster_path;

                // Verifikasi status dan poster dari detail jika status belum ada di objek list
                if (!status) {
                    const detail = await request<{ status?: string; poster_path?: string | null }>(`${mediaType}/${media.id}`);
                    status = detail?.status;
                    if (detail?.poster_path !== undefined) posterPath = detail.poster_path;
                }

                // Poster tidak boleh kosong
                if (!isPosterValid(posterPath)) {
                    return null;
                }

                // Status harus Released untuk film, tidak boleh in production/planned untuk TV
                if (mediaType === 'movie') {
                    if (status && status.toLowerCase() !== 'released') return null;
                } else if (mediaType === 'tv') {
                    const unreleasedTv = ['in production', 'post production', 'planned', 'pilot'];
                    if (status && unreleasedTv.includes(status.toLowerCase())) return null;
                }

                const title = getMediaTitle(media);
                return { ...media, media_type: mediaType, ...(mediaType === 'movie' ? { title } : { name: title }) };
            } catch (error) {
                if (error instanceof TmdbError && error.status === 404) return null;
                throw error;
            }
        }));
        for (const media of batch) if (media) results.push(media);
    }
    return { ...data, results, total_pages: Math.min(data.total_pages, 500) };
}

export async function getTmdbData(path: string, params: URLSearchParams) {
    const page = params.get('page') ?? '1';
    if (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 500) throw new TmdbError('Invalid page.', 400);
    let type: MediaType | undefined;
    if (/^movie\/(popular|top_rated|now_playing|upcoming)$/.test(path)) type = 'movie';
    else if (/^tv\/(popular|top_rated|airing_today|on_the_air)$/.test(path)) type = 'tv';
    else if (/^trending\/(movie|tv)\/day$/.test(path)) type = path.split('/')[1] as MediaType;
    else if (path === 'discover/tv') type = 'tv';
    else if (path === 'discover/movie') type = 'movie';
    else if (path === 'search/multi') {
        const query = params.get('query')?.trim() ?? '';
        if (!query) return { results: [], page: Number(page), total_pages: 0, total_results: 0 };
        const searchParams = { page, query, include_adult: 'true' };
        const data = await filterCatalog(await request<TmdbList>(path, searchParams));
        return fillCatalogOverviews(path, searchParams, data);
    } else if (/^(movie|tv)\/\d+$/.test(path)) {
        const [mediaType, id] = path.split('/');
        const details = await getSafeDetails(mediaType as MediaType, id);
        return { ...details, videos: await getVideos(mediaType as MediaType, id) };
    } else if (/^tv\/\d+\/season\/\d+$/.test(path)) {
        const [, id, , season] = path.split('/');
        const details = await getSafeSeason(id, season);
        return { ...details, videos: await getVideos('tv', id) };
    } else throw new TmdbError('Endpoint not available.', 404);
    const listParams: Record<string, string> = { page, include_adult: 'true' };
    params.forEach((value, key) => {
        if (key !== 'page' && key !== 'include_adult') {
            listParams[key] = value;
        }
    });
    const data = await filterCatalog(await request<TmdbList>(path, listParams), type);
    return fillCatalogOverviews(path, listParams, data);
}
