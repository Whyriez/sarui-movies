import { fetchTmdb, toMediaCard } from '@/lib/tmdb-client';
import { getTrailerKey, TmdbList, TmdbVideos } from '@/lib/tmdb-policy';

export const fetchMovies = async (page: number, category: string) => {
    const data = await fetchTmdb<TmdbList>(`movie/${category}`, { page: String(page) });
    return { movies: data.results.map(movie => toMediaCard(movie, 'movie')), totalPages: Math.max(1, data.total_pages) };
};

export const fetchTrendingMovies = async (page: number) => {
    const data = await fetchTmdb<TmdbList>('trending/movie/day', { page: String(page) });
    return { movies: data.results.map(movie => toMediaCard(movie, 'movie')), totalPages: Math.max(1, data.total_pages) };
};

export const fetchSearchResults = async (query: string, page: number) => {
    const data = await fetchTmdb<TmdbList>('search/multi', { query, page: String(page) });
    return { movies: data.results.map(movie => toMediaCard(movie)), totalPages: Math.max(1, data.total_pages) };
};

export const fetchMovieDetails = async (tmdbId: string) => {
    const movieDetails = await fetchTmdb<MovieDetails & { videos: TmdbVideos }>(`movie/${tmdbId}`);
    return { movieDetails, trailerKey: getTrailerKey(movieDetails.videos) };
};
