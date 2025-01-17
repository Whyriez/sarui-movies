'use client'
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Episode, SeasonDetails } from '@/interface/Tv';
import { fetchTvDetails, fetchTvEpisodeDetails } from '@/app/api/Tv';

const DetailSeasonEpisode: React.FC = () => {
    const { seasonId: tmdbId, seasonNumber: seasonNumber } = useParams();
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<number>();
    const [modalContentType, setModalContentType] = useState<'play' | 'trailer' | 'series' | null>(null);
    const [tvDetails, setTvDetails] = useState<TvDetails | null>(null);
    const [tvSeasonDetail, setSeasonDetail] = useState<SeasonDetails | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch TV details and trailer
                const { tvDetails, trailerKey } = await fetchTvDetails(tmdbId as string);
                setTvDetails(tvDetails);
                setTrailerKey(trailerKey);

                // Fetch TV episode details
                const { episodes, seasonDetail, trailerKey: episodeTrailerKey } = await fetchTvEpisodeDetails(tmdbId as string, Number(seasonNumber));
                setEpisodes(episodes);
                setSeasonDetail(seasonDetail);

                if (episodeTrailerKey) {
                    setTrailerKey(episodeTrailerKey);
                }
            } catch (error) {
                console.error('Failed to fetch TV details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tmdbId, seasonNumber]);

    if (loading) return <Loading />;

    if (!tvDetails) return <p>No Tv Series details found</p>;


    const handleShowModal = (contentType: 'play' | 'trailer' | 'series', episode: Episode | null = null) => {
        setModalContentType(contentType);
        if (episode) {
            setSelectedEpisode(episode.episode_number);
        }
        const element = document.getElementById('modal') as HTMLDialogElement;
        if (element) {
            element.showModal();
        }
    };

    const tmdbIdString = typeof tmdbId === 'string' ? tmdbId : '';
    const seasonNumberString = typeof seasonNumber === 'string' ? seasonNumber : '';

    const year = new Date(tvDetails.first_air_date).getFullYear();
    // const formattedTitle = movieDetails.title
    //     .toLowerCase()
    //     .replace(/['":\s]+/g, "-")
    //     .replace(/-+/g, "-")
    //     .replace(/^-|-$/g, "");

    // const subtitle = `${formattedTitle}-${year}`;

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row">
                <div className='mt-24'>
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_IMAGE_TMDB}/t/p/w500/${tvSeasonDetail?.poster_path}`}
                            alt={tvDetails.name}
                            width={500}
                            height={750}
                            className="w-full max-w-sm rounded-lg shadow-2xl"
                        />

                        <div className="flex-1">
                            <h1 className="text-5xl font-bold">{`${tvDetails.name} ${tvSeasonDetail?.name}`}</h1>
                            <p className="py-6">{tvSeasonDetail?.overview}</p>
                            <div>
                                <label htmlFor="genre" className="block mb-2 font-semibold">Genre:</label>
                                <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box gap-2">
                                    {tvDetails.genres.map((genre) => (
                                        <li key={genre.id}>
                                            <a className="shadow-md">{genre.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-md mt-4">Release Date: {tvSeasonDetail?.air_date}</p>
                            <p className="text-md">Status: {tvDetails.status}</p>
                            <p className="text-md">Rating: {tvSeasonDetail?.vote_average}</p>

                            <div className="mt-5 flex flex-wrap gap-4">

                                <button
                                    className="btn btn-error text-white"
                                    onClick={() => handleShowModal('trailer')}
                                >
                                    Watch Trailer
                                </button>
                                <Link
                                    target="__BLANK"
                                    className="btn btn-success text-white"
                                    href={`https://subsource.net/subtitles`}
                                >
                                    Search Subtitle
                                </Link>
                            </div>
                        </div>
                    </div>



                    <div className="mt-12 px-6">
                        <h2 className="text-3xl font-bold mb-6">Episode Seasons {seasonNumber}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {episodes.map((episode) => (
                                <div key={episode.id} className="p-4 rounded-lg shadow-lg flex flex-col justify-between h-full">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-2">
                                            {episode.name === `Episode ${episode.episode_number}`
                                                ? `Episode ${episode.episode_number}`
                                                : `Episode ${episode.episode_number} : ${episode.name}`}
                                        </h3>

                                        <p className="text-sm text-gray-400 mb-2">{episode.overview || 'No overview available'}</p>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-3">
                                        Aired on: {episode.air_date}
                                    </div>
                                    <button
                                        className="btn btn-secondary w-full mt-3 text-white"
                                        onClick={() => handleShowModal('series', episode)}
                                    >
                                        Play Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                {modalContentType && (
                    <Modal id='modal' contentType={modalContentType} tmdbId={tmdbIdString} trailerKey={trailerKey} season={seasonNumberString} episode={selectedEpisode} />
                )}
            </div>
        </div>
    );
};

export default DetailSeasonEpisode;
