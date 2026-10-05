import { Movie } from "@/interface/Movies";
import Link from "next/link";
import Poster from "./Poster";

interface MovieCardProps {
    movie: Movie,
    type: string
}


const MovieCard: React.FC<MovieCardProps> = ({ movie, type }) => {
    const releaseDate = movie.details?.release_date;
    const isNewRelease = releaseDate ? new Date(releaseDate).getFullYear() === new Date().getFullYear() : false;

    return (
        <div className="card card-compact bg-base-100 w-auto shadow-xl">
            <figure className="w-full h-[32rem]">
                <Poster
                    path={movie.details?.poster_path}
                    alt={movie.title}
                    width={500}
                    height={750}
                    className="w-full h-full object-cover"
                />
            </figure>
            <div className="card-body">
                <h2 className="card-title flex items-center">
                    {movie.title}
                    {isNewRelease && <div className="badge badge-secondary ml-2">NEW</div>}
                </h2>
                <p className="text-sm/6  text-wrap line-clamp-2">
                    {movie.details?.overview}
                </p>
                <div className="card-actions justify-end">
                    {type === "movie" || movie.mediaType === "movie" ? (
                        <Link href={`/detail/${movie.tmdb_id}`} className="btn btn-primary">
                            Watch Now
                        </Link>
                    ) : type === "tv" || movie.mediaType === "tv" ? (
                        <Link href={`/detail/tv/${movie.tmdb_id}`} className="btn btn-primary">
                            Watch Now
                        </Link>
                    ) : (
                        <span>Unsupported media type</span>
                    )}

                </div>
            </div>
        </div>
    )
}

export default MovieCard
