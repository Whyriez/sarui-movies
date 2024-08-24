import { Movie } from "@/interface/Movies";
import Link from "next/link";
import Image from "next/image";

interface MovieCardProps {
    movie: Movie;
}


const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    const releaseDate = movie.details?.release_date;
    const isNewRelease = releaseDate ? new Date(releaseDate).getFullYear() === 2024 : false;

    return (
        <div className="card card-compact bg-base-100 w-auto shadow-xl">
            <figure className="w-full h-[32rem]">
                <Image
                    src={`https://image.tmdb.org/t/p/w500/${movie.details?.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                {/* <img
                src={`https://image.tmdb.org/t/p/w500/${movie.details?.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
            /> */}
            </figure>
            <div className="card-body">
                <h2 className="card-title flex items-center">
                    {movie.title}
                    {isNewRelease && <div className="badge badge-secondary ml-2">NEW</div>}
                </h2>
                <p className="text-sm/6 text-gray-600 text-wrap line-clamp-2">
                    {movie.details?.overview}
                </p>
                <div className="card-actions justify-end">
                    <Link href={`detail/${movie.tmdb_id}`} className="btn btn-primary">Watch Now</Link>
                </div>
            </div>
        </div>
    )
}

export default MovieCard
