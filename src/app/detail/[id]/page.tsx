'use client'
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchMovieDetails } from '@/app/api/Movies';

const Detail: React.FC = () => {
    const { id: tmdbId } = useParams();
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [modalContentType, setModalContentType] = useState<'play' | 'trailer' | null>(null);
    const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { movieDetails, trailerKey } = await fetchMovieDetails(tmdbId as string);
                setMovieDetails(movieDetails);
                setTrailerKey(trailerKey);
            } catch (error) {
                console.error('Failed to fetch movie details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tmdbId]);

    if (loading) return <Loading />;

    if (!movieDetails) return <p>No movie details found</p>;


    const handleShowModal = (contentType: 'play' | 'trailer') => {
        setModalContentType(contentType);
        const element = document.getElementById('modal') as HTMLDialogElement;
        if (element) {
            element.showModal();
        }
    };

    const tmdbIdString = typeof tmdbId === 'string' ? tmdbId : '';

    const year = new Date(movieDetails.release_date).getFullYear();
    const formattedTitle = movieDetails.title
        .toLowerCase()
        .replace(/['":\s]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const subtitle = `${formattedTitle}-${year}`;
    
    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row">
                <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_TMDB}/t/p/w500/${movieDetails.poster_path}`}
                    alt={movieDetails.title}
                    width={500}
                    height={750}
                    className="max-w-sm rounded-lg shadow-2xl"
                />
                <div>
                    <h1 className="text-5xl font-bold ">{movieDetails.title}</h1>
                    <p className="py-6 ">
                        {movieDetails.overview}
                    </p>
                    <div>
                        <label htmlFor="genre" >Genre :</label>
                        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box gap-2">
                            {movieDetails.genres.map((genre) => (
                                <li key={genre.id}><a className='shadow-md'>{genre.name}</a></li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-md ">Release Date: {movieDetails.release_date}</p>
                    <p className="text-md ">Status: {movieDetails.status}</p>
                    <p className="text-md ">Rating: {movieDetails.vote_average}</p>

                    <div className='mt-5 flex gap-4'>
                        <button
                            className="btn btn-secondary text-white"
                            onClick={() => handleShowModal('play')}
                        >
                            Play Now
                        </button>
                        <button
                            className="btn btn-error text-white"
                            onClick={() => handleShowModal('trailer')}
                        >
                            Watch Trailer
                        </button>
                        <Link
                            target='__BLANK'
                            className="btn btn-success text-white"
                            href={`https://subsource.net/subtitles/${subtitle}`}
                        >
                            Search Subtitle
                        </Link>


                    </div>
                </div>
                {modalContentType && (
                    <Modal id='modal' contentType={modalContentType} tmdbId={tmdbIdString} trailerKey={trailerKey} />
                )}
            </div>


        </div>
    );
};

export default Detail;
