import { Movie } from "@/interface/Movies";

export const fetchMovies = async (page: number, category: string): Promise<{ movies: Movie[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${category}?api_key=${process.env.NEXT_PUBLIC_API_KEY_TMDB}&language=en-US&page=${page}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const moviesWithDetails = data.results.map((movie: any) => ({
            imdb_id: movie.imdb_id,
            tmdb_id: movie.id,
            title: movie.title,
            embed_url: `https://vidsrc.xyz/embed/movie/${movie.imdb_id}`,
            embed_url_tmdb: `https://vidsrc.xyz/embed/movie/${movie.id}`,
            quality: movie.quality,
            details: {
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date,
            }
        }));

        moviesWithDetails.sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.details.release_date);
            const dateB = new Date(b.details.release_date);
            return dateB.getTime() - dateA.getTime();
        });

        return { movies: moviesWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};

export const fetchTrendingMovies = async (page: number): Promise<{ movies: Movie[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_API_KEY_TMDB}&page=${page}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const moviesWithDetails = data.results.map((movie: any) => ({
            imdb_id: movie.imdb_id,
            tmdb_id: movie.id,
            title: movie.title,
            embed_url: `https://vidsrc.xyz/embed/movie/${movie.imdb_id}`,
            embed_url_tmdb: `https://vidsrc.xyz/embed/movie/${movie.id}`,
            quality: movie.quality,
            details: {
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date,
            }
        }));

        moviesWithDetails.sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.details.release_date);
            const dateB = new Date(b.details.release_date);
            return dateB.getTime() - dateA.getTime();
        });

        return { movies: moviesWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};


export const fetchSearchResults = async (query: string, page: number): Promise<{ movies: Movie[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_API_KEY_TMDB}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const moviesWithDetails = data.results.map((movie: any) => ({
            imdb_id: movie.imdb_id,
            tmdb_id: movie.id,
            title: movie.title,
            embed_url: `https://vidsrc.xyz/embed/movie/${movie.imdb_id}`,
            embed_url_tmdb: `https://vidsrc.xyz/embed/movie/${movie.id}`,
            quality: movie.quality,
            details: {
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date,
            }
        }));

        moviesWithDetails.sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.details.release_date);
            const dateB = new Date(b.details.release_date);
            return dateB.getTime() - dateA.getTime();
        });

        return { movies: moviesWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};