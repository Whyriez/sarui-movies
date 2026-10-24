'use client'
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Poster from '@/components/ui/Poster';
import Image from 'next/image';
import { getOverviewText } from '@/lib/tmdb-policy';

const Detail = ({ movieDetails, trailerKey }: { movieDetails: MovieDetails; trailerKey: string | null }) => {
    const { id: tmdbId } = useParams();
    const [modalContentType, setModalContentType] = useState<'play' | 'trailer' | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleShowModal = (contentType: 'play' | 'trailer') => {
        setModalContentType(contentType);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContentType(null);
    };

    const tmdbIdString = typeof tmdbId === 'string' ? tmdbId : '';

    const year = movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : '';
    const formattedTitle = movieDetails.title
        .toLowerCase()
        .replace(/['":\s]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const subtitle = year ? `${formattedTitle}-${year}` : formattedTitle;

    const backdropUrl = movieDetails.backdrop_path
        ? `${(process.env.NEXT_PUBLIC_IMAGE_TMDB || 'https://image.tmdb.org').replace(/\/$/, '')}/t/p/original${movieDetails.backdrop_path}`
        : null;

    return (
        <div className="bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen relative transition-colors duration-200">
            {/* IMMERSIVE BACKDROP HEADER */}
            {backdropUrl && (
                <div className="absolute top-0 left-0 right-0 h-[50vh] sm:h-[65vh] overflow-hidden pointer-events-none z-0">
                    <Image
                        src={backdropUrl}
                        alt={movieDetails.title}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-top opacity-30 filter blur-[1px] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/60 to-black/30 dark:from-[#09090b] dark:via-[#09090b]/60 dark:to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/80 dark:from-[#09090b]/80 via-transparent to-transparent" />
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-32 pb-16">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                    {/* Floating Cinematic Poster */}
                    <div className="w-48 xs:w-56 sm:w-64 md:w-80 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 dark:shadow-black/80 border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900">
                        <Poster
                            path={movieDetails.poster_path}
                            alt={movieDetails.title}
                            width={500}
                            height={750}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Movie Information */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Meta Badges */}
                        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start mb-3">
                            <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-wider">
                                Movie
                            </span>
                            {year && (
                                <span className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-800">
                                    {year}
                                </span>
                            )}
                            {movieDetails.vote_average > 0 && (
                                <span className="text-xs font-bold text-amber-500 dark:text-amber-400 bg-zinc-200/90 dark:bg-black/60 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-white/10 flex items-center gap-1">
                                    ★ {movieDetails.vote_average.toFixed(1)}
                                </span>
                            )}
                            {movieDetails.status && (
                                <span className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-900/60 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-800">
                                    {movieDetails.status}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                            {movieDetails.title}
                        </h1>

                        {/* Genres */}
                        {movieDetails.genres && movieDetails.genres.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 my-4">
                                {movieDetails.genres.map((genre) => (
                                    <span key={genre.id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-800/80 px-3 py-1 rounded-full">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Overview */}
                        <p className="text-xs sm:text-sm md:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl py-2">
                            {getOverviewText(movieDetails.overview)}
                        </p>

                        {/* Additional Metadata */}
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 my-3">
                            {movieDetails.release_date && (
                                <p><strong className="text-zinc-800 dark:text-zinc-300">Release Date:</strong> {movieDetails.release_date}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
                            <button
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-xl shadow-rose-600/30 hover:scale-105 transition-all flex items-center gap-2"
                                onClick={() => handleShowModal('play')}
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                <span>Play Movie</span>
                            </button>
                            <button
                                className="bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex items-center gap-2 shadow-sm"
                                onClick={() => handleShowModal('trailer')}
                            >
                                <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                                <span>Trailer</span>
                            </button>
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white font-medium text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800/80 transition-all flex items-center gap-2 shadow-sm"
                                href={`https://subsource.net/subtitles/${subtitle}`}
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
                                </svg>
                                <span>Subtitles</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {isModalOpen && modalContentType && (
                    <Modal
                        id="modal"
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        contentType={modalContentType}
                        title={movieDetails.title}
                        tmdbId={tmdbIdString}
                        trailerKey={trailerKey}
                        posterPath={movieDetails.poster_path}
                        backdropPath={movieDetails.backdrop_path}
                    />
                )}
            </div>
        </div>
    );
};

export default Detail;
