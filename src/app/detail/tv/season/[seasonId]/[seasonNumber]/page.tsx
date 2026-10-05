import type { Metadata } from 'next';
import DetailClient from './DetailClient';
import { getTvPage, getSeasonPage } from '@/lib/tmdb-pages';
import { getVideos } from '@/lib/tmdb-server';
import { getTrailerKey } from '@/lib/tmdb-policy';

type Props = { params: { seasonId: string; seasonNumber: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const tv = await getTvPage(params.seasonId);
    return { title: `${tv.name} - Season ${params.seasonNumber}` };
}

export default async function SeasonPage({ params }: Props) {
    const tvDetails = await getTvPage(params.seasonId);
    const tvSeasonDetail = await getSeasonPage(params.seasonId, params.seasonNumber);
    const videos = await getVideos('tv', params.seasonId);
    return <DetailClient tvDetails={tvDetails} tvSeasonDetail={tvSeasonDetail} episodes={tvSeasonDetail.episodes} trailerKey={getTrailerKey(videos)} />;
}
