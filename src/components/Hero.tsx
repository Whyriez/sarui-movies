'use client'
import { useState, useEffect, useRef } from "react";
import MovieCard from "./ui/MovieCard";
import TvCard from "@/components/ui/TvCard";
import { Media } from "@/interface/Media";
import { fetchTrendingMovies } from "@/app/api/Movies";
import Skeleton from "./ui/Skeleton";
import Image from "next/image";
import Link from "next/link";

const PAGE_RANGE = 1;

function Hero() {
    const [currentPage, setCurrentPage] = useState(1);
    const [movies, setMovies] = useState<Media[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const catalogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        const loadTrendingMovies = async () => {
            try {
                const { movies: fetchedMovies, totalPages: fetchedTotalPages } = await fetchTrendingMovies(currentPage);
                if (!active) return;
                setMovies(fetchedMovies);
                setTotalPages(fetchedTotalPages);
            } catch (error) {
                if (!active) return;
                setError('Failed to load catalog. Please check your internet connection.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadTrendingMovies();
        return () => { active = false; };
    }, [currentPage]);

    useEffect(() => {
        if (catalogRef.current && currentPage > 1) {
            catalogRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    const getPaginationRange = (currentPage: number, totalPages: number) => {
        let start = Math.max(currentPage - PAGE_RANGE, 1);
        let end = Math.min(currentPage + PAGE_RANGE, totalPages);

        if (end - start < PAGE_RANGE * 2) {
            if (start === 1) {
                end = Math.min(PAGE_RANGE * 2 + 1, totalPages);
            } else if (end === totalPages) {
                start = Math.max(totalPages - PAGE_RANGE * 2, 1);
            }
        }

        return { start, end };
    };

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const { start, end } = getPaginationRange(currentPage, totalPages);

    // Featured Spotlight: Top trending movie
    const featured = movies[0];
    const featuredBackdrop = featured?.details?.backdrop_path
        ? `${(process.env.NEXT_PUBLIC_IMAGE_TMDB || 'https://image.tmdb.org').replace(/\/$/, '')}/t/p/original${featured.details.backdrop_path}`
        : '/background.png';

    const featuredYear = featured?.details?.release_date
        ? new Date(featured.details.release_date).getFullYear()
        : null;

    const featuredRating = featured?.details?.vote_average
        ? featured.details.vote_average.toFixed(1)
        : null;

    const featuredHref = featured?.mediaType === 'movie'
        ? `/detail/${featured.tmdb_id}`
        : `/detail/tv/${featured?.tmdb_id}`;

    return (
        <div className="bg-zinc-50 mt-16 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-200">
            {/* CINEMATIC SPOTLIGHT BILLBOARD */}
            <div className="relative w-full h-[65vh] sm:h-[75vh] md:h-[82vh] overflow-hidden">
                {/* Backdrop Image */}
                <Image
                    src={featuredBackdrop}
                    alt={featured?.title || "Cinema Spotlight"}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center scale-105 transition-all duration-1000 ease-out"
                />

                {/* Cinematic Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/20 to-black/40 dark:from-[#09090b] dark:via-[#09090b]/40 dark:to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/50 to-transparent dark:from-[#09090b] dark:via-[#09090b]/70 dark:to-transparent sm:w-3/4" />

                {/* Billboard Content */}
                <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-20">
                    <div className="max-w-2xl space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold tracking-widest text-rose-500 uppercase bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                                Today&apos;s Spotlight
                            </span>
                            {featuredRating && (
                                <span className="text-[11px] font-semibold text-amber-400 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                                    ★ {featuredRating}
                                </span>
                            )}
                            {featuredYear && (
                                <span className="text-[11px] text-zinc-300 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                                    {featuredYear}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-none drop-shadow-md">
                            {featured?.title || "SaruiMovies"}
                        </h1>

                        <p className="text-xs sm:text-sm md:text-base text-zinc-700 dark:text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl">
                            {featured?.details?.overview || "Enjoy streaming your favorite movies and TV series with high quality."}
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            {featured && (
                                <Link
                                    href={featuredHref}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xl hover:scale-105"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    <span>Watch Now</span>
                                </Link>
                            )}
                            <button
                                onClick={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-zinc-900/10 hover:bg-zinc-900/20 text-zinc-900 border border-zinc-900/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md dark:text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl dark:border-white/10 transition-all"
                            >
                                Explore Catalog
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CATALOG SECTION */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12" ref={catalogRef}>
                <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Trending Now
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Today&apos;s most popular movies &amp; series
                        </p>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>

                {loading ? (
                    <Skeleton count={10} />
                ) : error ? (
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-zinc-900 border border-red-200 dark:border-red-500/20 text-center max-w-md mx-auto my-12">
                        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 dark:text-zinc-400">
                        <p className="text-sm">No titles available at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                        {movies.map((movie, index) => (
                            movie.mediaType === "movie" ? (
                                <MovieCard key={index} movie={movie} type="movie" />
                            ) : (
                                <TvCard key={index} tv={movie} />
                            )
                        ))}
                    </div>
                )}

                {/* SLEEK CINEMA PAGINATION */}
                <div className="mt-10 sm:mt-16 flex justify-center">
                    <nav className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>
                        {start > 1 && (
                            <>
                                <button
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === 1 ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30' : 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm'}`}
                                    onClick={() => handlePageChange(1)}
                                >
                                    1
                                </button>
                                {start > 2 && <span className="px-1 text-zinc-400 dark:text-zinc-600 text-xs">...</span>}
                            </>
                        )}
                        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(pageIndex => (
                            <button
                                key={pageIndex}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === pageIndex ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30' : 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm'}`}
                                onClick={() => handlePageChange(pageIndex)}
                            >
                                {pageIndex}
                            </button>
                        ))}
                        {end < totalPages && (
                            <>
                                {end < totalPages - 1 && <span className="px-1 text-zinc-400 dark:text-zinc-600 text-xs">...</span>}
                                <button
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === totalPages ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30' : 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm'}`}
                                    onClick={() => handlePageChange(totalPages)}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                        <button
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Hero;
