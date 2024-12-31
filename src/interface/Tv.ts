export interface Tv {
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
        overview: string;
        release_date: string;
    };
}