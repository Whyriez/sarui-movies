'use client'
import { useState, useEffect, useRef } from "react";
import MovieCard from "./ui/Card";
import Navbar from "./Navbar";
import { Movie } from "@/interface/Movies";
import { fetchTrendingMovies } from "@/app/api/Movies";

const PAGE_RANGE = 2;

function Hero() {
    const [currentPage, setCurrentPage] = useState(1);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const trendingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadTrendingMovies = async () => {
            try {
                const { movies: fetchedMovies, totalPages: fetchedTotalPages } = await fetchTrendingMovies(currentPage);
                setMovies(fetchedMovies);
                setTotalPages(fetchedTotalPages);
            } catch (error) {
                console.error("Failed to fetch movies", error);
            } finally {
                setLoading(false);
            }
        };

        loadTrendingMovies();
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

    const handleExploreClick = () => {
        if (trendingRef.current) {
            trendingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const { start, end } = getPaginationRange(currentPage, totalPages);

    return (
        <div>
            <div
                className="hero min-h-screen"
                style={{
                    backgroundImage: "url(background.png)",
                }}>
                <div className="hero-overlay bg-opacity-60"></div>
                <div className="hero-content text-neutral-content text-center">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-5xl font-bold">Welcome To SaruiMovies</h1>
                        <p className="mb-5">
                            Discover the latest and greatest in the world of cinema.
                            From trending hits to hidden gems, SaruiMovies brings you
                            a curated selection of movies that are sure to captivate
                            and entertain. Dive into the cinematic universe and find
                            your next favorite film with ease.
                        </p>
                        <button onClick={handleExploreClick} className="btn btn-primary bg-gradient-to-r from-teal-400 to-blue-500 text-white hover:bg-gradient-to-l hover:from-teal-500 hover:to-blue-400 transition-all duration-300">
                            Explore Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="my-8 p-4 flex flex-col items-center" ref={trendingRef}>
                <h2 className="text-3xl font-bold mb-4 text-center">Trending Movies</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {movies.map((movie, index) => (
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
        </div>
    );
}

export default Hero;
