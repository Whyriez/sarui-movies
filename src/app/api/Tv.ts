import { Tv } from "@/interface/Tv";

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