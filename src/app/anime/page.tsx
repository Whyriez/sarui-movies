'use client'
import { useState, useEffect, useRef } from "react";
import { Movie } from "@/interface/Movies";
import MovieCard from "@/components/ui/MovieCard";
import { fetchMovies } from "../api/Movies";
import Skeleton from "@/components/ui/Skeleton";

const PAGE_RANGE = 1;

function Anime() {
    // Data dummy untuk anime terbaru dan film
    const recentAnime = [
        { id: 1, title: "Attack on Titan", genre: "Action", image: "https://via.placeholder.com/150" },
        { id: 2, title: "Demon Slayer", genre: "Adventure", image: "https://via.placeholder.com/150" },
        { id: 3, title: "My Hero Academia", genre: "Action", image: "https://via.placeholder.com/150" },
        { id: 4, title: "One Piece", genre: "Adventure", image: "https://via.placeholder.com/150" },
    ];

    const movies = [
        { id: 1, title: "Your Name", genre: "Romance", image: "https://via.placeholder.com/150" },
        { id: 2, title: "Spirited Away", genre: "Fantasy", image: "https://via.placeholder.com/150" },
        { id: 3, title: "Akira", genre: "Sci-Fi", image: "https://via.placeholder.com/150" },
    ];

    return (
        <div>
            <div className="my-16 p-4 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-4 text-center">Anime</h2>
            
                <div className="mb-4">
                    <button className="btn btn-primary mx-2">Home</button>
                    <button className="btn btn-primary mx-2">Jadwal</button>
                    <button className="btn btn-primary mx-2">Genre</button>
                    <button className="btn btn-primary mx-2">Ongoing</button>
                    <button className="btn btn-primary mx-2">Completed</button>
                    <button className="btn btn-primary mx-2">Popular</button>
                </div>

                <h3 className="text-2xl font-bold mb-2">Recent Anime</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recentAnime.map(anime => (
                        <div key={anime.id} className="border rounded-lg p-4">
                            <img src={anime.image} alt={anime.title} className="w-full h-32 object-cover rounded" />
                            <h4 className="text-lg font-semibold mt-2">{anime.title}</h4>
                            <p className="text-sm text-gray-600">{anime.genre}</p>
                        </div>
                    ))}
                </div>

                <h3 className="text-2xl font-bold mt-8 mb-2">Movies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {movies.map(movie => (
                        <div key={movie.id} className="border rounded-lg p-4">
                            <img src={movie.image} alt={movie.title} className="w-full h-32 object-cover rounded" />
                            <h4 className="text-lg font-semibold mt-2">{movie.title}</h4>
                            <p className="text-sm text-gray-600">{movie.genre}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default Anime