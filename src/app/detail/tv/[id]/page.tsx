import type { Metadata } from 'next';
import DetailClient from './DetailClient';
import { getTvPage } from '@/lib/tmdb-pages';
import { getVideos } from '@/lib/tmdb-server';
import { getTrailerKey } from '@/lib/tmdb-policy';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const tv = await getTvPage(params.id);
    return { title: tv.name, description: tv.overview || undefined };
}

export default async function TvPage({ params }: Props) {
    const tvDetails = await getTvPage(params.id);
    const videos = await getVideos('tv', params.id);
    return <DetailClient tvDetails={tvDetails} seasons={tvDetails.seasons} trailerKey={getTrailerKey(videos)} />;
}
