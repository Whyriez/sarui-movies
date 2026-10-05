'use client'
import { useState, useEffect, useRef } from "react";
import { Movie } from "@/interface/Movies";
import MovieCard from "@/components/ui/MovieCard";
import { fetchMovies } from "../api/Movies";
import Skeleton from "@/components/ui/Skeleton";

const PAGE_RANGE = 1;

function NowPlaying() {
    const [currentPage, setCurrentPage] = useState(1);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const nowPlayingRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        const loadMovies = async () => {
            try {
                const { movies: fetchedMovies, totalPages: fetchedTotalPages } = await fetchMovies(currentPage, 'now_playing');
                if (!active) return;
                setMovies(fetchedMovies);
                setTotalPages(fetchedTotalPages);
            } catch (error) {
                if (!active) return;
                setError('Data gagal dimuat. Silakan coba lagi.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadMovies();
        return () => { active = false; };
    }, [currentPage]);

    useEffect(() => {
        if (nowPlayingRef.current) {
            nowPlayingRef.current.scrollIntoView({ behavior: 'smooth' });
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
        <div>
            <div className="my-16 p-4 flex flex-col items-center" ref={nowPlayingRef}>
                <h2 className="text-3xl font-bold mb-4 text-center">Now Playing Movies</h2>
                {loading ? (
                    <Skeleton/>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : movies.length === 0 ? (
                    <p>Tidak ada film atau serial yang tersedia di halaman ini.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {movies.map((movie, index) => (
                            <MovieCard key={index} movie={movie} type="movie" />
                        ))}
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <nav className="pagination flex items-center space-x-2">
                        <button
                            className="btn btn-outline"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>
                        {start > 1 && (
                            <>
                                <button
                                    className={`btn ${currentPage === 1 ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => handlePageChange(1)}
                                >
                                    1
                                </button>
                                {start > 2 && <span className="mx-2">...</span>}
                            </>
                        )}
                        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(pageIndex => (
                            <button
                                key={pageIndex}
                                className={`btn ${currentPage === pageIndex ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handlePageChange(pageIndex)}
                            >
                                {pageIndex}
                            </button>
                        ))}
                        {end < totalPages && (
                            <>
                                {end < totalPages - 1 && <span className="mx-2">...</span>}
                                <button
                                    className={`btn ${currentPage === totalPages ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => handlePageChange(totalPages)}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                        <button
                            className="btn btn-outline"
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

export default NowPlaying
