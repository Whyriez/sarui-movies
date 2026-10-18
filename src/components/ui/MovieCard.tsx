import { Movie } from "@/interface/Movies";
import Link from "next/link";
import Poster from "./Poster";

interface MovieCardProps {
    movie: Movie;
    type: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, type }) => {
    const releaseDate = movie.details?.release_date;
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;
    const rating = movie.details?.vote_average ? movie.details.vote_average.toFixed(1) : null;
    const isMovie = type === "movie" || movie.mediaType === "movie";
    const detailHref = isMovie ? `/detail/${movie.tmdb_id}` : `/detail/tv/${movie.tmdb_id}`;

    return (
        <Link href={detailHref} className="group relative flex flex-col cursor-pointer">
            {/* Cinematic Poster Canvas */}
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-md group-hover:shadow-2xl group-hover:border-rose-500/30 dark:group-hover:border-white/20 transition-all duration-300">
                <Poster
                    path={movie.details?.poster_path}
                    alt={movie.title}
                    width={500}
                    height={750}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Floating Rating & Year Pill */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-1">
                    {rating && (
                        <span className="badge badge-sm font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-white/10 shadow-sm text-[11px]">
                            ★ {rating}
                        </span>
                    )}
                    {releaseYear && (
                        <span className="badge badge-sm font-medium bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 shadow-sm ml-auto text-[11px]">
                            {releaseYear}
                        </span>
                    )}
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Clean Understated Metadata */}
            <div className="pt-2 px-0.5">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1 leading-snug">
                    {movie.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    <span>{releaseYear || 'Film'}</span>
                    <span className="uppercase text-[9px] tracking-wider text-zinc-600 dark:text-zinc-300 font-bold bg-zinc-200/80 dark:bg-zinc-800/90 px-1.5 py-0.5 rounded border border-zinc-300/60 dark:border-white/5">
                        {isMovie ? 'Film' : 'Series'}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
