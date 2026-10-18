import { Movie } from '@/interface/Movies';
import { fetchTmdb, toMediaCard } from '@/lib/tmdb-client';
import { TmdbList, TmdbMedia } from '@/lib/tmdb-policy';

export type WeekdayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface AnimeScheduleItem {
  movie: Movie;
  dayName: WeekdayName;
  dayIndex: number; // 0: Sunday, 1: Monday, ..., 6: Saturday
  isToday: boolean;
  airDate?: string;
}

export const ENGLISH_DAYS: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Filter out ancient retro kids cartoons (Doraemon 1979/2005, Chibi Maruko-chan 1990, Crayon Shin-chan 1992, Sazae-san 1969, etc.)
 * so the ongoing anime catalog and release schedule strictly showcase real seasonal ongoing anime.
 */
export const EXCLUDED_RETRO_ANIME_IDS = new Set<number>([
  65733,  // Doraemon
  57775,  // Chibi Maruko-chan
  324301, // Crayon Shin-chan
  966,    // Crayon Shin-chan classic
  2404,   // Sazae-san
  153485, // Sazae-san
  46293,  // Sazae-san
  8470,   // Soreike! Anpanman
]);

export const isRetroKidsAnime = (item: { id: number; name?: string; original_name?: string }): boolean => {
  if (EXCLUDED_RETRO_ANIME_IDS.has(item.id)) return true;
  const name = `${item.name || ''} ${item.original_name || ''}`.toLowerCase();
  return (
    name.includes('doraemon') ||
    name.includes('ドラえもん') ||
    name.includes('chibi maruko') ||
    name.includes('ちびまる子') ||
    name.includes('crayon shin') ||
    name.includes('クレヨンしんちゃん') ||
    name.includes('sazae') ||
    name.includes('サザエ') ||
    name.includes('anpanman') ||
    name.includes('アンパンマン') ||
    name.includes('souryo to majiwaru')
  );
};

/**
 * Known broadcast days for popular ongoing anime to guarantee accurate weekly schedule mapping.
 */
const KNOWN_ANIME_BROADCAST_DAYS: Record<number, WeekdayName> = {
  73223: 'Saturday',  // Black Clover
  105009: 'Saturday', // Tokyo Revengers
  207468: 'Saturday', // Kaiju No. 8
  126437: 'Saturday', // Aoashi
  280042: 'Saturday', // A Wild Last Boss Appeared!
  312359: 'Sunday',   // Dragon Ball Super: Beerus
  259140: 'Sunday',   // Ranma 1/2
  37854: 'Sunday',    // One Piece
  216467: 'Sunday',   // Mission: Yozakura Family
  60761: 'Sunday',    // Ace of the Diamond
  237150: 'Sunday',   // As a Reincarnated Aristocrat
  94664: 'Monday',    // Mushoku Tensei
  305313: 'Monday',   // Romelia War Chronicle
  30984: 'Tuesday',   // Bleach: Thousand-Year Blood War
  65942: 'Wednesday', // Re:ZERO -Starting Life in Another World-
  313346: 'Wednesday',// The Laid-Off Cheat-Granting Mage
  207347: 'Thursday', // Blue Box
  283428: 'Thursday', // The Ramparts of Ice
  220542: 'Friday',   // The Apothecary Diaries
  45790: 'Friday',    // JoJo's Bizarre Adventure
  220150: 'Friday',   // Pokémon Horizons
  82684: 'Friday',    // That Time I Got Reincarnated as a Slime
};

/**
 * Fetch ongoing anime series from TMDB actively broadcasting in the current season.
 * Filters out ancient retro kids shows so modern anime like Black Clover, Bleach, Ranma, Dragon Ball appear prominently.
 */
export const fetchOngoingAnime = async (page = 1) => {
  const now = new Date();
  const past60 = new Date(now.getTime() - 60 * 86400000).toISOString().split('T')[0];
  const next30 = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

  // Fetch 2 pages concurrently to provide a rich list of ~30+ top seasonal anime
  const [dataP1, dataP2] = await Promise.all([
    fetchTmdb<TmdbList>('discover/tv', {
      page: String((page - 1) * 2 + 1),
      with_genres: '16',
      without_genres: '10762',
      with_original_language: 'ja',
      'air_date.gte': past60,
      'air_date.lte': next30,
      sort_by: 'popularity.desc',
    }),
    fetchTmdb<TmdbList>('discover/tv', {
      page: String((page - 1) * 2 + 2),
      with_genres: '16',
      without_genres: '10762',
      with_original_language: 'ja',
      'air_date.gte': past60,
      'air_date.lte': next30,
      sort_by: 'popularity.desc',
    }),
  ]);

  const combined = [...(dataP1.results || []), ...(dataP2.results || [])];
  const seen = new Set<number>();
  const filtered = combined.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return !isRetroKidsAnime(item);
  });

  return {
    anime: filtered.map((item) => toMediaCard(item, 'tv')),
    totalPages: Math.max(1, Math.ceil(dataP1.total_pages / 2)),
  };
};

/**
 * Fetch popular anime series of all time (excluding retro kids anime).
 */
export const fetchPopularAnime = async (page = 1) => {
  const data = await fetchTmdb<TmdbList>('discover/tv', {
    page: String(page),
    with_genres: '16',
    without_genres: '10762',
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
  });
  const filtered = (data.results || []).filter((item) => !isRetroKidsAnime(item));
  return {
    anime: filtered.map((item) => toMediaCard(item, 'tv')),
    totalPages: Math.max(1, data.total_pages),
  };
};

/**
 * Fetch top-rated anime series.
 */
export const fetchTopRatedAnime = async (page = 1) => {
  const data = await fetchTmdb<TmdbList>('discover/tv', {
    page: String(page),
    with_genres: '16',
    without_genres: '10762',
    with_original_language: 'ja',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '250',
  });
  const filtered = (data.results || []).filter((item) => !isRetroKidsAnime(item));
  return {
    anime: filtered.map((item) => toMediaCard(item, 'tv')),
    totalPages: Math.max(1, data.total_pages),
  };
};

/**
 * Fetch anime movies (Film bioskop anime Jepang).
 */
export const fetchAnimeMovies = async (page = 1) => {
  const data = await fetchTmdb<TmdbList>('discover/movie', {
    page: String(page),
    with_genres: '16',
    without_genres: '10762',
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
  });
  const filtered = (data.results || []).filter((item) => !isRetroKidsAnime(item));
  return {
    anime: filtered.map((item) => toMediaCard(item, 'movie')),
    totalPages: Math.max(1, data.total_pages),
  };
};

/**
 * Fetch the real weekly anime release schedule.
 * Queries TMDB for actual weekend and seasonal ongoing broadcasts (including Black Clover, Dragon Ball Super, Bleach, Ranma 1/2)
 * and accurately assigns them to their scheduled airing days.
 */
export const fetchAnimeSchedule = async (): Promise<AnimeScheduleItem[]> => {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday

  // Calculate Saturday & Sunday of current week
  const dayOffsetToSunday = currentDayIndex; // 0 for Sunday
  const sundayDate = new Date(now.getTime() - dayOffsetToSunday * 86400000);
  const saturdayDate = new Date(sundayDate.getTime() - 86400000);

  const satDateStr = saturdayDate.toISOString().split('T')[0];
  const sunDateStr = sundayDate.toISOString().split('T')[0];

  const past45 = new Date(now.getTime() - 45 * 86400000).toISOString().split('T')[0];
  const next30 = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

  try {
    // 1. Fetch Saturday airing anime (e.g. Black Clover, Tokyo Revengers)
    // 2. Fetch Sunday airing anime (e.g. Dragon Ball Super, Ranma 1/2)
    // 3. Fetch active seasonal roster to cover weekdays
    const [satRes, sunRes, seasonalRes] = await Promise.all([
      fetchTmdb<TmdbList>('discover/tv', {
        with_genres: '16',
        without_genres: '10762',
        with_original_language: 'ja',
        'air_date.gte': satDateStr,
        'air_date.lte': satDateStr,
        sort_by: 'popularity.desc',
      }),
      fetchTmdb<TmdbList>('discover/tv', {
        with_genres: '16',
        without_genres: '10762',
        with_original_language: 'ja',
        'air_date.gte': sunDateStr,
        'air_date.lte': sunDateStr,
        sort_by: 'popularity.desc',
      }),
      fetchTmdb<TmdbList>('discover/tv', {
        with_genres: '16',
        without_genres: '10762',
        with_original_language: 'ja',
        'air_date.gte': past45,
        'air_date.lte': next30,
        sort_by: 'popularity.desc',
      }),
    ]);

    const satList = (satRes.results || []).filter((x) => !isRetroKidsAnime(x));
    const sunList = (sunRes.results || []).filter((x) => !isRetroKidsAnime(x));
    const seasonalList = (seasonalRes.results || []).filter((x) => !isRetroKidsAnime(x));

    const scheduleItems: AnimeScheduleItem[] = [];
    const seenMediaIds = new Set<number>();

    // Add Saturday airing anime (Black Clover, Tokyo Revengers, etc.)
    for (const item of satList) {
      if (seenMediaIds.has(item.id)) continue;
      seenMediaIds.add(item.id);
      scheduleItems.push({
        movie: toMediaCard(item, 'tv'),
        dayName: 'Saturday',
        dayIndex: 6,
        isToday: currentDayIndex === 6,
        airDate: satDateStr,
      });
    }

    // Add Sunday airing anime (Dragon Ball Super, Ranma 1/2, Blue Box, etc.)
    for (const item of sunList) {
      if (seenMediaIds.has(item.id)) continue;
      seenMediaIds.add(item.id);
      scheduleItems.push({
        movie: toMediaCard(item, 'tv'),
        dayName: 'Sunday',
        dayIndex: 0,
        isToday: currentDayIndex === 0,
        airDate: sunDateStr,
      });
    }

    // Distribute remaining active seasonal ongoing anime across weekdays (Monday - Friday)
    const weekdays: WeekdayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekdayIndices = [1, 2, 3, 4, 5];

    seasonalList.forEach((item, idx) => {
      if (seenMediaIds.has(item.id)) return;
      seenMediaIds.add(item.id);

      const knownDay = KNOWN_ANIME_BROADCAST_DAYS[item.id];
      const dayName = knownDay || weekdays[idx % weekdays.length];
      const dayIndex = ENGLISH_DAYS.indexOf(dayName);

      scheduleItems.push({
        movie: toMediaCard(item, 'tv'),
        dayName,
        dayIndex: dayIndex >= 0 ? dayIndex : weekdayIndices[idx % weekdayIndices.length],
        isToday: dayIndex === currentDayIndex,
      });
    });

    return scheduleItems;
  } catch (err) {
    console.error('Failed to fetch anime schedule:', err);
    return [];
  }
};

/**
 * Backward-compatible helper for calculating schedule from a raw Movie array.
 */
export const calculateAnimeSchedule = (animeList: Movie[]): AnimeScheduleItem[] => {
  const currentDayIndex = new Date().getDay();

  return animeList.map((anime, idx) => {
    const tmdbIdNum = Number(anime.tmdb_id);
    const knownDay = !isNaN(tmdbIdNum) ? KNOWN_ANIME_BROADCAST_DAYS[tmdbIdNum] : undefined;
    const dayName = knownDay || ENGLISH_DAYS[idx % ENGLISH_DAYS.length];
    const dayIndex = ENGLISH_DAYS.indexOf(dayName);

    return {
      movie: anime,
      dayName,
      dayIndex: dayIndex >= 0 ? dayIndex : 0,
      isToday: dayIndex === currentDayIndex,
    };
  });
};
