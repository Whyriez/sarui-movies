'use client'
import React from "react";
import Image from "next/image";

function Anime() {
    const recentAnime = [
        { id: 1, title: "Attack on Titan", genre: "Action, Dark Fantasy", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60" },
        { id: 2, title: "Demon Slayer", genre: "Action, Supernatural", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60" },
        { id: 3, title: "My Hero Academia", genre: "Action, Sci-Fi", image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60" },
        { id: 4, title: "One Piece", genre: "Adventure, Fantasy", image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500&auto=format&fit=crop&q=60" },
    ];

    const movies = [
        { id: 1, title: "Your Name", genre: "Romance, Drama", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60" },
        { id: 2, title: "Spirited Away", genre: "Fantasy, Adventure", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60" },
        { id: 3, title: "Akira", genre: "Sci-Fi, Cyberpunk", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60" },
    ];

    return (
        <div className="bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-24 pb-16">
                <div className="flex items-end justify-between mb-8 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Anime Catalog
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Pilihan serial dan film animasi Jepang terbaik
                        </p>
                    </div>
                    <span className="text-xs text-rose-500 font-semibold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
                        Koleksi Anime
                    </span>
                </div>

                <div className="mb-10">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-4">
                        Serial Anime Populer
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {recentAnime.map(anime => (
                            <div key={anime.id} className="group relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-all cursor-pointer">
                                <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                                    <img src={anime.image} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                </div>
                                <div className="p-3">
                                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">{anime.title}</h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{anime.genre}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-4">
                        Film Anime Bioskop
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {movies.map(movie => (
                            <div key={movie.id} className="group relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-all cursor-pointer">
                                <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                                    <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                </div>
                                <div className="p-3">
                                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">{movie.title}</h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{movie.genre}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Anime;
