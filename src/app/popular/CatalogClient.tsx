'use client'
import { useState, useEffect, useRef } from "react";
import { Movie } from "@/interface/Movies";
import MovieCard from "@/components/ui/MovieCard";
import { fetchMovies } from "../api/Movies";
import Skeleton from "@/components/ui/Skeleton";

const PAGE_RANGE = 1;

function PopularMovies() {
    const [currentPage, setCurrentPage] = useState(1);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const popularRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        const loadMovies = async () => {
            try {
                const { movies: fetchedMovies, totalPages: fetchedTotalPages } = await fetchMovies(currentPage, 'popular');
                if (!active) return;
                setMovies(fetchedMovies);
                setTotalPages(fetchedTotalPages);
            } catch (error) {
                if (!active) return;
                setError('Data gagal dimuat. Silakan periksa koneksi internet Anda.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadMovies();
        return () => { active = false; };
    }, [currentPage]);

    useEffect(() => {
        if (popularRef.current && currentPage > 1) {
            popularRef.current.scrollIntoView({ behavior: 'smooth' });
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

    return (
        <div className="bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-24 pb-16" ref={popularRef}>
                <div className="flex items-end justify-between mb-8 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Popular Movies
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Deretan film dengan antusiasme dan penonton terbanyak
                        </p>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Hal {currentPage} / {totalPages}
                    </span>
                </div>

                {loading ? (
                    <Skeleton count={10} />
                ) : error ? (
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-zinc-900 border border-red-200 dark:border-red-500/20 text-center max-w-md mx-auto my-12">
                        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="text-center py-24 text-zinc-500 dark:text-zinc-400">
                        <p className="text-sm">Tidak ada film yang tersedia saat ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 w-full">
                        {movies.map((movie, index) => (
                            <MovieCard key={index} movie={movie} type="movie" />
                        ))}
                    </div>
                )}

                {/* CINEMA PAGINATION */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Sebelumnya
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
                                Selanjutnya
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PopularMovies;
