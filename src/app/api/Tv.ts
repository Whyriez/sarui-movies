import { Episode, SeasonDetails } from '@/interface/Tv';
import { fetchTmdb, toMediaCard } from '@/lib/tmdb-client';
import { getTrailerKey, TmdbList, TmdbVideos } from '@/lib/tmdb-policy';

export const fetchTv = async (page: number, category: string) => {
    const data = await fetchTmdb<TmdbList>(`tv/${category}`, { page: String(page) });
    return { tvSeries: data.results.map(tv => toMediaCard(tv, 'tv')), totalPages: Math.max(1, data.total_pages) };
};

export const fetchTrendingTv = async (page: number) => {
    const data = await fetchTmdb<TmdbList>('trending/tv/day', { page: String(page) });
    return { tv: data.results.map(tv => toMediaCard(tv, 'tv')), totalPages: Math.max(1, data.total_pages) };
};

export const fetchTvDetails = async (tmdbId: string) => {
    const tvDetails = await fetchTmdb<TvDetails & { videos: TmdbVideos }>(`tv/${tmdbId}`);
    return { tvDetails, seasons: tvDetails.seasons, trailerKey: getTrailerKey(tvDetails.videos) };
};

export const fetchTvEpisodeDetails = async (tmdbId: string, seasonNumber: number) => {
    const seasonDetail = await fetchTmdb<SeasonDetails & { episodes: Episode[]; videos: TmdbVideos }>(`tv/${tmdbId}/season/${seasonNumber}`);
    return { episodes: seasonDetail.episodes, seasonDetail, trailerKey: getTrailerKey(seasonDetail.videos) };
};
