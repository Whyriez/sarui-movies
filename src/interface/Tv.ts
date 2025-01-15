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

export interface Seasons {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_count: number;
    poster_path: string;
    season_number: string;
}

export interface Episode {
    air_date: string;
    crew: CrewMember[];
    episode_number: number;
    guest_stars: GuestStar[];
    name: string;
    overview: string;
    id: number;
    production_code: string;
    runtime: number;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
}

export interface CrewMember {

}

export interface GuestStar {

}

export interface SeasonDetails {
    air_date: string,
    name: string;
    overview: string;
    id: number;
    poster_path: string;
    season_number: number;
    vote_average: number;
}