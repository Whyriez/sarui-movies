import type { Metadata } from 'next';
import DetailClient from './DetailClient';
import { getMoviePage } from '@/lib/tmdb-pages';
import { getVideos } from '@/lib/tmdb-server';
import { getTrailerKey } from '@/lib/tmdb-policy';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const movie = await getMoviePage(params.id);
    return { title: movie.title, description: movie.overview || undefined };
}

export default async function MoviePage({ params }: Props) {
    const movieDetails = await getMoviePage(params.id);
    const videos = await getVideos('movie', params.id);
    return <DetailClient movieDetails={movieDetails} trailerKey={getTrailerKey(videos)} />;
}
