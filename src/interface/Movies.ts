export interface Movie {
    imdb_id: string;
    tmdb_id: string;
    title: string;
    mediaType: string;
    embed_url: string;
    embed_url_tmdb: string;
    quality: string;
    details?: {
        title: string;
        poster_path: string;
        backdrop_path?: string;
        overview: string;
        release_date: string;
        vote_average?: number;
    };
}