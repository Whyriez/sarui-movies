'use client'
import MovieCard from "@/components/ui/Card";
import { Movie } from "@/interface/Movies";
import { useEffect, useState } from "react";
import { fetchSearchResults } from "../api/Movies";
import Skeleton from "@/components/ui/Skeleton";

const PAGE_RANGE = 1;

function Search({ searchParams }: { searchParams: { query: string, page: number } }) {
    const [currentPage, setCurrentPage] = useState(searchParams.page || 1);
    const [searchQuery, setSearchQuery] = useState(searchParams.query || '');
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSearchResult = async () => {
            try {
                const { movies: moviesWithDetails, totalPages: fetchedTotalPages } = await fetchSearchResults(searchQuery, currentPage);
                setFilteredMovies(moviesWithDetails);
                setTotalPages(fetchedTotalPages);
            } catch (error) {
                console.error("Failed to fetch movies", error);
            } finally {
                setLoading(false);
            }
        };

        loadSearchResult();
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
            window.history.replaceState({}, '', `/search?page=${page}&query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const { start, end } = getPaginationRange(currentPage, totalPages);

    return (
        <div className="my-8 p-4 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4 text-center">Search Results for "{searchQuery}"</h2>
            {loading ? (
                 <Skeleton/>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredMovies.map((movie, index) => (
                        <MovieCard key={index} movie={movie} />
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