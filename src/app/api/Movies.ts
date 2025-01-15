import { Movie } from "@/interface/Movies";

export const fetchMovies = async (page: number, category: string): Promise<{ movies: Movie[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${category}?language=en-US&page=${page}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        const moviesWithDetails = data.results.map((movie: any) => ({
            imdb_id: movie.imdb_id,
            tmdb_id: movie.id,
            title: movie.title,
            embed_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/movie/${movie.imdb_id}`,
            embed_url_tmdb: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/movie/${movie.id}`,
            quality: movie.quality,
            details: {
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date,
            }
        }));


        moviesWithDetails.sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.details?.release_date ?? '');
            const dateB = new Date(b.details?.release_date ?? '');
            return dateB.getTime() - dateA.getTime();
        });

        return { movies: moviesWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};

export const fetchTrendingMovies = async (page: number): Promise<{ movies: Movie[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/trending/all/day?language=en-US&page=${page}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        const moviesWithDetails = data.results.map((movie: any) => ({
            imdb_id: movie.imdb_id,
            tmdb_id: movie.id,
            title: movie.title || movie.name,
            mediaType: movie.media_type,
            embed_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/movie/${movie.imdb_id}`,
            embed_url_tmdb: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/movie/${movie.id}`,
            quality: movie.quality,
            details: {
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date,
            }
        }));

        moviesWithDetails.sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.details?.release_date ?? '');
            const dateB = new Date(b.details?.release_date ?? '');
            return dateB.getTime() - dateA.getTime();
        });
        

        return { movies: moviesWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};


export const fetchSearchResults = async (query: string, page: number): Promise<{ movies: Movie[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi?language=en-US&query=${encodeURIComponent(query)}&page=${page}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        const moviesWithDetails = data.results.map((movie: any) => ({
            imdb_id: movie.imdb_id,
            tmdb_id: movie.id,
            title: movie.title,
            mediaType: movie.media_type,
            embed_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/movie/${movie.imdb_id}`,
            embed_url_tmdb: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/movie/${movie.id}`,
            quality: movie.quality,
            details: {
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date,
            }
        }));

        moviesWithDetails.sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.details?.release_date ?? '');
            const dateB = new Date(b.details?.release_date ?? '');
            return dateB.getTime() - dateA.getTime();
        });
        

        return { movies: moviesWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};

//Detail
export const fetchMovieDetails = async (tmdbId: string): Promise<{ movieDetails: MovieDetails | null; trailerKey: string | null }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${tmdbId}?language=en-US`;
    try {
        const movieResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!movieResponse.ok) {
            throw new Error('Failed to fetch movie details');
        }
        const movieDetails = await movieResponse.json();

        const videosResponse = await fetch(
            `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${process.env.NEXT_PUBLIC_API_KEY_TMDB}`
        );
        if (!videosResponse.ok) {
            throw new Error('Failed to fetch movie videos');
        }
        const videosData = await videosResponse.json();

        const trailer = videosData.results.find(
            (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        const trailerKey = trailer ? trailer.key : null;

        return { movieDetails, trailerKey };
    } catch (error) {
        console.error('Failed to fetch movie details', error);
        return { movieDetails: null, trailerKey: null };
    }
};