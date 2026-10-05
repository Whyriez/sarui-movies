'use client'
import MovieCard from "@/components/ui/MovieCard";
import { Movie } from "@/interface/Movies";
import { useEffect, useRef, useState } from "react";
import { fetchSearchResults } from "../api/Movies";
import Skeleton from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";

const PAGE_RANGE = 1;

function Search({ searchParams }: { searchParams: { query: string, page: number } }) {
    const router = useRouter();
    const currentPage = searchParams.page;
    const searchQuery = searchParams.query;
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        const loadSearchResult = async () => {
            try {
                const { movies: moviesWithDetails, totalPages: fetchedTotalPages } = await fetchSearchResults(searchQuery, currentPage);
                if (!active) return;
                setFilteredMovies(moviesWithDetails);
                setTotalPages(fetchedTotalPages);
            } catch (error) {
                if (!active) return;
                setFilteredMovies([]);
                setTotalPages(1);
                setError('Pencarian gagal dimuat. Silakan coba lagi.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadSearchResult();
        return () => { active = false; };
    }, [currentPage, searchQuery]);

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.scrollIntoView({ behavior: 'smooth' });
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
            router.push(`/search?page=${page}&query=${encodeURIComponent(searchQuery)}`, { scroll: false });
        }
    };

    const { start, end } = getPaginationRange(currentPage, totalPages);
    return (
        <div className="my-16 p-4 flex flex-col items-center" ref={searchRef}>
            <h2 className="text-3xl font-bold mb-4 text-center">Search Results for "{searchQuery}"</h2>
            {loading ? (
                 <Skeleton/>
            ) : error ? (
                <p role="alert">{error}</p>
            ) : filteredMovies.length === 0 ? (
                <p>Tidak ada film atau serial dengan poster yang sesuai di halaman ini.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredMovies.map(movie => (
                        <MovieCard key={`${movie.mediaType}-${movie.tmdb_id}`} movie={movie} type={movie.mediaType} />
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
    )
}

export default Search
