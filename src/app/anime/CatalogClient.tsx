'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/interface/Movies';
import TvCard from '@/components/ui/TvCard';
import MovieCard from '@/components/ui/MovieCard';
import Skeleton from '@/components/ui/Skeleton';
import {
  fetchOngoingAnime,
  fetchPopularAnime,
  fetchTopRatedAnime,
  fetchAnimeMovies,
  fetchAnimeSchedule,
  calculateAnimeSchedule,
  AnimeScheduleItem,
} from '../api/Anime';
import { Calendar, Play, Sparkles, Flame, Star, Film, Radio } from 'lucide-react';

const DAYS = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayType = (typeof DAYS)[number];

const ENGLISH_DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AnimeCatalog() {
  const [ongoing, setOngoing] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [schedule, setSchedule] = useState<AnimeScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayType>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const todayIndex = new Date().getDay();
  const todayName = ENGLISH_DAYS_ORDER[todayIndex];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const loadAnimeData = async () => {
      try {
        const [ongoingRes, scheduleItems, popularRes, topRatedRes, moviesRes] = await Promise.all([
          fetchOngoingAnime(1),
          fetchAnimeSchedule(),
          fetchPopularAnime(1),
          fetchTopRatedAnime(1),
          fetchAnimeMovies(1),
        ]);

        if (!active) return;

        setOngoing(ongoingRes.anime);
        setSchedule(scheduleItems);
        setPopular(popularRes.anime);
        setTopRated(topRatedRes.anime);
        setMovies(moviesRes.anime);
      } catch {
        if (!active) return;
        setError('Failed to load anime catalog from TMDB. Please check your internet connection.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAnimeData();
    return () => {
      active = false;
    };
  }, []);

  // Filter schedule based on selected day
  const filteredSchedule = selectedDay === 'All'
    ? schedule
    : schedule.filter((item) => item.dayName === selectedDay);

  // Featured Hero Anime (Top ongoing anime)
  const featured = ongoing[0] || popular[0];
  const featuredBackdrop = featured?.details?.backdrop_path
    ? `${(process.env.NEXT_PUBLIC_IMAGE_TMDB || 'https://image.tmdb.org').replace(/\/$/, '')}/t/p/original${featured.details.backdrop_path}`
    : null;

  return (
    <div className="bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-200">
      {/* 1. SPOTLIGHT BILLBOARD HERO */}
      {featured && (
        <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[72vh] overflow-hidden">
          {featuredBackdrop && (
            <Image
              src={featuredBackdrop}
              alt={featured.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-105 transition-all duration-1000 ease-out"
            />
          )}

          {/* Cinematic Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/20 to-black/50 dark:from-[#09090b] dark:via-[#09090b]/40 dark:to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/60 to-transparent dark:from-[#09090b] dark:via-[#09090b]/80 dark:to-transparent sm:w-3/4" />

          {/* Billboard Content */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col justify-end pb-10 sm:pb-14 z-20">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold tracking-widest text-rose-500 uppercase bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Anime Spotlight
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ongoing Series
                </span>
                {featured.details?.vote_average && (
                  <span className="text-[11px] font-semibold text-amber-400 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                    ★ {featured.details.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight drop-shadow-md">
                {featured.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
                {featured.details?.overview || 'Top anime series with captivating animation and thrilling seasonal episodes.'}
              </p>

              <div className="pt-2">
                <Link
                  href={`/detail/tv/${featured.tmdb_id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-xl shadow-rose-950/40 transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={16} className="fill-current" />
                  <span>Watch This Anime</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 space-y-14">
        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-zinc-900 border border-red-200 dark:border-red-500/20 text-center max-w-md mx-auto my-8">
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 2. ANIME RELEASE SCHEDULE SECTION */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <Calendar size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Anime Release Schedule
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Weekly new episode broadcasts based on official release dates
              </p>
            </div>

            {/* Current day indicator */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Today: <strong className="text-rose-600 dark:text-rose-400 font-bold">{todayName}</strong>
              </span>
            </div>
          </div>

          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isTodayDay = day === todayName;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{day}</span>
                  {isTodayDay && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-rose-500/10 text-rose-500'}`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Schedule Grid */}
          {loading ? (
            <Skeleton count={5} />
          ) : filteredSchedule.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm">No anime scheduled on {selectedDay}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {filteredSchedule.slice(0, 30).map((item, idx) => (
                <div key={`${item.movie.tmdb_id}-${idx}`} className="relative flex flex-col">
                  <TvCard tv={item.movie} />
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] flex items-center gap-1 ${
                      item.isToday
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      <Calendar size={10} />
                      {item.isToday ? 'Released Today!' : `Every ${item.dayName}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. ONGOING ANIME */}
        <section>
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Radio size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Ongoing Anime
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Anime series currently broadcasting new episodes this season
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              This Season
            </span>
          </div>

          {loading ? (
            <Skeleton count={10} />
          ) : ongoing.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">No ongoing anime series found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {ongoing.map((anime) => (
                <TvCard key={anime.tmdb_id} tv={anime} />
              ))}
            </div>
          )}
        </section>

        {/* 4. MOST POPULAR ANIME */}
        <section>
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Flame size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Most Popular Anime
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Series with the highest viewership and community fanbase
              </p>
            </div>
          </div>

          {loading ? (
            <Skeleton count={10} />
          ) : popular.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">No popular anime found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {popular.map((anime) => (
                <TvCard key={anime.tmdb_id} tv={anime} />
              ))}
            </div>
          )}
        </section>

        {/* 5. ANIME MOVIES */}
        <section>
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  <Film size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Anime Movies
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Theatrical animated feature films from acclaimed studios and creators
              </p>
            </div>
          </div>

          {loading ? (
            <Skeleton count={10} />
          ) : movies.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">No anime movies found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {movies.map((movie) => (
                <MovieCard key={movie.tmdb_id} movie={movie} type="movie" />
              ))}
            </div>
          )}
        </section>

        {/* 6. TOP RATED ANIME */}
        <section>
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Star size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Top Rated Anime
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Acclaimed animation masterpieces with the highest user review scores
              </p>
            </div>
          </div>

          {loading ? (
            <Skeleton count={10} />
          ) : topRated.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">No top-rated anime found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {topRated.map((anime) => (
                <TvCard key={anime.tmdb_id} tv={anime} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
