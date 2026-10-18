'use client'
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Poster from '@/components/ui/Poster';
import Image from 'next/image';
import { Seasons } from '@/interface/Tv';
import { getOverviewText } from '@/lib/tmdb-policy';

const DetailTv = ({ tvDetails, seasons, trailerKey }: { tvDetails: TvDetails; seasons: Seasons[]; trailerKey: string | null }) => {
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
    const year = tvDetails.first_air_date ? new Date(tvDetails.first_air_date).getFullYear() : '';

    const backdropUrl = tvDetails.backdrop_path
        ? `${(process.env.NEXT_PUBLIC_IMAGE_TMDB || 'https://image.tmdb.org').replace(/\/$/, '')}/t/p/original${tvDetails.backdrop_path}`
        : null;

    return (
        <div className="bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen relative transition-colors duration-200">
            {/* IMMERSIVE BACKDROP HEADER */}
            {backdropUrl && (
                <div className="absolute top-0 left-0 right-0 h-[50vh] sm:h-[65vh] overflow-hidden pointer-events-none z-0">
                    <Image
                        src={backdropUrl}
                        alt={tvDetails.name}
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
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-32 pb-16 space-y-12">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                    {/* Floating Cinematic Poster */}
                    <div className="w-48 xs:w-56 sm:w-64 md:w-80 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 dark:shadow-black/80 border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900">
                        <Poster
                            path={tvDetails.poster_path}
                            alt={tvDetails.name}
                            width={500}
                            height={750}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* TV Information */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        {/* Meta Badges */}
                        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start mb-3">
                            <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-wider">
                                Serial TV
                            </span>
                            {year && (
                                <span className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-800">
                                    {year}
                                </span>
                            )}
                            {tvDetails.vote_average > 0 && (
                                <span className="text-xs font-bold text-amber-500 dark:text-amber-400 bg-zinc-200/90 dark:bg-black/60 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-white/10 flex items-center gap-1">
                                    ★ {tvDetails.vote_average.toFixed(1)}
                                </span>
                            )}
                            {tvDetails.status && (
                                <span className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-900/60 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-800">
                                    {tvDetails.status}
                                </span>
                            )}
                            {seasons && seasons.length > 0 && (
                                <span className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-900/60 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-800">
                                    {seasons.length} Musim
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                            {tvDetails.name}
                        </h1>

                        {/* Genres */}
                        {tvDetails.genres && tvDetails.genres.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 my-4">
                                {tvDetails.genres.map((genre) => (
                                    <span key={genre.id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-800/80 px-3 py-1 rounded-full">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Overview */}
                        <p className="text-xs sm:text-sm md:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl py-2">
                            {getOverviewText(tvDetails.overview)}
                        </p>

                        {/* Additional Metadata */}
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 my-3">
                            {tvDetails.first_air_date && (
                                <p><strong className="text-zinc-800 dark:text-zinc-300">Tayang Perdana:</strong> {tvDetails.first_air_date}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
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
                                href="https://subsource.net/subtitles"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
                                </svg>
                                <span>Subtitles</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* SEASONS LIST SECTION */}
                {seasons && seasons.length > 0 && (
                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Daftar Musim &amp; Episode
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Pilih musim untuk melihat daftar episode lengkap dan mulai menonton
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {seasons.map((season) => {
                                const seasonTitle = season.name === `Season ${season.season_number}`
                                    ? `Season ${season.season_number}`
                                    : `Season ${season.season_number}: ${season.name}`;

                                return (
                                    <Link
                                        href={`/detail/tv/season/${tmdbId}/${season.season_number}`}
                                        key={season.id}
                                        className="flex gap-4 p-4 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/70 dark:hover:bg-zinc-900 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-sm"
                                    >
                                        <div className="w-20 sm:w-24 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5">
                                            <Poster
                                                size="w200"
                                                path={season.poster_path}
                                                alt={season.name}
                                                width={150}
                                                height={225}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                    <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                                        {season.episode_count} Eps
                                                    </span>
                                                    {season.air_date && (
                                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                            {new Date(season.air_date).getFullYear() || season.air_date}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                                                    {seasonTitle}
                                                </h3>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                                                    {getOverviewText(season.overview)}
                                                </p>
                                            </div>

                                            <div className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                <span>Pilih Episode</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Trailer Modal */}
                {isModalOpen && modalContentType && (
                    <Modal
                        id='modal'
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        contentType={modalContentType}
                        title={tvDetails.name}
                        tmdbId={tmdbIdString}
                        trailerKey={trailerKey}
                    />
                )}
            </div>
        </div>
    );
};

export default DetailTv;
