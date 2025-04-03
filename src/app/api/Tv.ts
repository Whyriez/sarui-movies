import { Episode, SeasonDetails, Seasons, Tv } from "@/interface/Tv";

export const fetchTv = async (page: number, category: string): Promise<{ tvSeries: Tv[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${category}?language=en-US&page=${page}`;
 
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        const tvWithDetails = data.results.map((tv: any) => ({
            imdb_id: tv.imdb_id,
            tmdb_id: tv.id,
            title: tv.name,
            mediaType: tv.media_type,
            embed_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/tv/${tv.imdb_id}`,
            embed_url_tmdb: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/tv/${tv.id}`,
            quality: tv.quality,
            details: {
                title: tv.name,
                poster_path: tv.poster_path,
                overview: tv.overview,
                release_date: tv.release_date,
            }
        }));

        tvWithDetails.sort((a: Tv, b: Tv) => {
            const dateA = new Date(a.details?.release_date ?? '');
            const dateB = new Date(b.details?.release_date ?? '');
            return dateB.getTime() - dateA.getTime();
        });

        return { tvSeries: tvWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};

export const fetchTrendingTv = async (page: number): Promise<{ tv: Tv[]; totalPages: number }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/trending/tv/day?language=en-US&page=${page}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        const tvWithDetails = data.results.map((tv: any) => ({
            imdb_id: tv.imdb_id,
            tmdb_id: tv.id,
            title: tv.title || tv.name,
            mediaType: tv.media_type,
            embed_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/tv/${tv.imdb_id}`,
            embed_url_tmdb: `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/tv/${tv.id}`,
            quality: tv.quality,
            details: {
                title: tv.title,
                poster_path: tv.poster_path,
                overview: tv.overview,
                release_date: tv.release_date,
            }
        }));

        tvWithDetails.sort((a: Tv, b: Tv) => {
            const dateA = new Date(a.details?.release_date ?? '');
            const dateB = new Date(b.details?.release_date ?? '');
            return dateB.getTime() - dateA.getTime();
        });
        

        return { tv: tvWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Failed to fetch movies", error);
        throw error;
    }
};

export const fetchTvDetails = async (tmdbId: string): Promise<{ tvDetails: TvDetails | null; seasons: Seasons[]; trailerKey: string | null }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tmdbId}?language=en-US`;
    const apiVideoUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tmdbId}/videos`;

    const headers = {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
        'Accept': 'application/json'
    };

    try {
        const [tvResponse, videosResponse] = await Promise.all([
            fetch(apiUrl, { method: 'GET', headers }),
            fetch(apiVideoUrl, { method: 'GET', headers })
        ]);
       
        if (!tvResponse.ok) {
            throw new Error('Failed to fetch TV details');
        }
        const tvDetails = await tvResponse.json();

        if (!videosResponse.ok) {
            throw new Error('Failed to fetch TV videos');
        }
        const videosData = await videosResponse.json();

        const trailer = videosData.results.find(
            (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        const trailerKey = trailer ? trailer.key : null;

        return { tvDetails, seasons: tvDetails.seasons, trailerKey };
    } catch (error) {
        console.error('Failed to fetch TV details', error);
        return { tvDetails: null, seasons: [], trailerKey: null };
    }
};

export const fetchTvEpisodeDetails = async (tmdbId: string, seasonNumber: number): Promise<{ episodes: Episode[]; seasonDetail: SeasonDetails | null; trailerKey: string | null }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?language=en-US`;
    const apiVideoUrl = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${tmdbId}/videos`;

    const headers = {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_BEARER_TOKEN}`,
        'Accept': 'application/json'
    };

    try {
        const [seasonResponse, videosResponse] = await Promise.all([
            fetch(apiUrl, { method: 'GET', headers }),
            fetch(apiVideoUrl, { method: 'GET', headers })
        ]);
   
        if (!seasonResponse.ok) {
            throw new Error('Failed to fetch season details');
        }
        const seasonDetail = await seasonResponse.json();

        if (!videosResponse.ok) {
            throw new Error('Failed to fetch TV videos');
        }
        const videosData = await videosResponse.json();

        const trailer = videosData.results.find(
            (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        const trailerKey = trailer ? trailer.key : null;

        return { episodes: seasonDetail.episodes, seasonDetail, trailerKey };
    } catch (error) {
        console.error('Failed to fetch TV episode details', error);
        return { episodes: [], seasonDetail: null, trailerKey: null };
    }
};

