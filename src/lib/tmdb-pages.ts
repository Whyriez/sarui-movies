import { notFound } from 'next/navigation';
import { getSafeDetails, getSafeSeason, TmdbError } from './tmdb-server';

async function available<T>(load: () => Promise<T>): Promise<T> {
    try { return await load(); }
    catch (error) {
        if (error instanceof TmdbError && (error.status === 404 || error.status === 400)) notFound();
        throw error;
    }
}

export const getMoviePage = (id: string) => available(() => getSafeDetails<MovieDetails>('movie', id));
export const getTvPage = (id: string) => available(() => getSafeDetails<TvDetails>('tv', id));
export const getSeasonPage = (id: string, season: string) => available(() => getSafeSeason(id, season));
