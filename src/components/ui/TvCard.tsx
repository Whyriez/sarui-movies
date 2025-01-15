import { Tv } from "@/interface/Tv";
import Link from "next/link";
import Image from "next/image";

interface TvCardProps {
    tv: Tv;
}

const MovieCard: React.FC<TvCardProps> = ({ tv }) => {
    const releaseDate = tv.details?.release_date;
    const isNewRelease = releaseDate ? new Date(releaseDate).getFullYear() === 2024 : false;

    return (
        <div className="card card-compact bg-base-100 w-auto shadow-xl">
            <figure className="w-full h-[32rem]">
                <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_TMDB}/t/p/w500/${tv.details?.poster_path}`}
                    alt={tv.title}
                    width={500}
                    height={750}
                    className="w-full h-full object-cover"
                />
                {/* <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_TMDB}/t/p/w500/${movie.details?.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
            /> */}
            </figure>
            <div className="card-body">
                <h2 className="card-title flex items-center">
                    {tv.title}
                    {isNewRelease && <div className="badge badge-secondary ml-2">NEW</div>}
                </h2>
                <p className="text-sm/6  text-wrap line-clamp-2">
                    {tv.details?.overview}
                </p>
                <div className="card-actions justify-end">
                    <Link href={`/detail/tv/${tv.tmdb_id}`} className="btn btn-primary">Watch Now</Link>
                </div>
            </div>
        </div>
    )
}

export default MovieCard
