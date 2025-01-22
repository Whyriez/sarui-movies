'use client'
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Seasons } from '@/interface/Tv';
import { fetchTvDetails } from '@/app/api/Tv';

const DetailTv: React.FC = () => {
    const { id: tmdbId } = useParams();
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [modalContentType, setModalContentType] = useState<'play' | 'trailer' | null>(null);
    const [tvDetails, setTvDetails] = useState<TvDetails | null>(null);
    const [seasons, setSeasons] = useState<Seasons[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { tvDetails, seasons, trailerKey } = await fetchTvDetails(tmdbId as string);
                setTvDetails(tvDetails);
                setSeasons(seasons);
                setTrailerKey(trailerKey);
            } catch (error) {
                console.error('Failed to fetch TV details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tmdbId]);

    if (loading) return <Loading />;

    if (!tvDetails) return <p>No Tv Series details found</p>;


    const handleShowModal = (contentType: 'play' | 'trailer') => {
        setModalContentType(contentType);
        const element = document.getElementById('modal') as HTMLDialogElement;
        if (element) {
            element.showModal();
        }
    };

    const tmdbIdString = typeof tmdbId === 'string' ? tmdbId : '';

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
                            src={`${process.env.NEXT_PUBLIC_IMAGE_TMDB}/t/p/w500/${tvDetails.poster_path}`}
                            alt={tvDetails.name}
                            width={500}
                            height={750}
                            className="w-full max-w-sm rounded-lg shadow-2xl"
                        />

                        <div className="flex-1">
                            <h1 className="text-5xl font-bold">{tvDetails.name}</h1>
                            <p className="py-6">{tvDetails.overview}</p>
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

                            <p className="text-md mt-4">Release Date: {tvDetails.first_air_date}</p>
                            <p className="text-md">Status: {tvDetails.status}</p>
                            <p className="text-md">Rating: {tvDetails.vote_average}</p>

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
                        <h2 className="text-3xl font-bold mb-6">Seasons</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {seasons.map((season) => (
                                <Link href={`/detail/tv/season/${tmdbId}/${season.season_number}`} key={season.id} className="00 p-4 rounded-lg shadow-lg">
                                    <div className='flex justify-center'>
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_TMDB}/t/p/w200${season.poster_path}`}
                                            alt={season.name}
                                            width={150}
                                            height={225}
                                            className="rounded-md mb-4 "
                                        />
                                    </div>

                                    <h3 className="text-lg font-semibold mb-2">
                                    {season.name === `Season ${season.season_number}`
                                                ? `Season ${season.season_number}`
                                                : `Season ${season.season_number} : ${season.name}`}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{season.overview || 'No overview available'}</p>
                                    <p className="text-sm text-gray-500">Aired on: {season.air_date}</p>
                                    <p className="text-sm text-gray-500">Episodes: {season.episode_count}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                {modalContentType && (
                    <Modal id='modal' contentType={modalContentType} title={tvDetails.name} tmdbId={tmdbIdString} trailerKey={trailerKey} />
                )}
            </div>
        </div>
    );
};

export default DetailTv;
