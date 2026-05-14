import { Platform } from 'react-native';

import type { AppThemePreference } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { HistoryRepository } from '@/repositories/historyRepository';
import { MovieRepository } from '@/repositories/movieRepository';
import { RatingsRepository } from '@/repositories/ratingsRepository';
import { SyncQueueRepository, type SyncEntityType, type SyncOperation } from '@/repositories/syncQueueRepository';
import { UserRepository } from '@/repositories/userRepository';
import { WishlistRepository } from '@/repositories/wishlistRepository';
import { currentUser, UserService } from './user';

type RemoteProfile = {
  theme_preference: AppThemePreference;
};

type RemoteMovie = {
  tmdb_id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  genres: (string | number)[];
};

type RemoteWishlist = {
  movie_id: number;
  added_at: string;
};

type RemoteHistory = {
  movie_id: number;
  watched_at: string;
};

type RemoteRating = {
  movie_id: number;
  rating: number;
  updated_at: string;
};

const isWeb = Platform.OS === 'web';

let isInitialized = false;
let syncPromise: Promise<void> | null = null;

export const SyncService = {
  async initialize(): Promise<void> {
    if (isWeb || isInitialized) {
      return;
    }

    isInitialized = true;
    supabase.auth.onAuthStateChange(() => {
      void SyncService.syncIfPossible();
    });

    await SyncService.syncIfPossible();
  },

  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> {
    if (isWeb) {
      return;
    }

    const userId = UserService.getCurrentUserId();
    await SyncQueueRepository.enqueue(userId, entityType, entityId, operation, payload);
    void SyncService.syncIfPossible();
  },

  async syncIfPossible(): Promise<void> {
    if (isWeb) {
      return;
    }

    if (syncPromise) {
      return syncPromise;
    }

    syncPromise = performSync()
      .catch((error) => {
        console.warn('[SyncService] Sync skipped due to error:', error);
      })
      .finally(() => {
        syncPromise = null;
      });

    return syncPromise;
  },
};

async function performSync(): Promise<void> {
  const sessionUser = await getSupabaseUser();

  if (!sessionUser) {
    return;
  }

  await UserService.updateSupabaseIdentity(sessionUser.id, sessionUser.email ?? null);

  const linkedUser = UserService.getCurrentUser();
  const remoteSnapshot = await fetchRemoteSnapshot(sessionUser.id);

  if (!linkedUser.last_sync_at) {
    await mergeRemoteIntoLocal(linkedUser.id, remoteSnapshot);
    await pushFullLocalSnapshot(linkedUser.id, sessionUser.id);
  } else {
    await flushQueue(linkedUser.id, sessionUser.id);
  }

  const refreshedSnapshot = await fetchRemoteSnapshot(sessionUser.id);
  await replaceLocalFromRemote(linkedUser.id, refreshedSnapshot);
  await UserService.updateLastSyncAt(Math.floor(Date.now() / 1000));
}

async function getSupabaseUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.warn('[SyncService] Unable to read Supabase auth user:', error.message);
      return null;
    }

    return data.user ?? null;
  } catch (error) {
    console.warn('[SyncService] Supabase auth lookup failed:', error);
    return null;
  }
}

async function fetchRemoteSnapshot(supabaseUserId: string) {
  const [{ data: profileRows, error: profileError }, { data: wishlistRows, error: wishlistError }, { data: historyRows, error: historyError }, { data: ratingsRows, error: ratingsError }] =
    await Promise.all([
      supabase.from('profiles').select('theme_preference').eq('id', supabaseUserId).limit(1),
      supabase.from('wishlist').select('movie_id, added_at').eq('user_id', supabaseUserId),
      supabase.from('history').select('movie_id, watched_at').eq('user_id', supabaseUserId),
      supabase.from('ratings').select('movie_id, rating, updated_at').eq('user_id', supabaseUserId),
    ]);

  if (profileError) throw new Error(profileError.message);
  if (wishlistError) throw new Error(wishlistError.message);
  if (historyError) throw new Error(historyError.message);
  if (ratingsError) throw new Error(ratingsError.message);

  const movieIds = Array.from(
    new Set([
      ...(wishlistRows ?? []).map((row) => row.movie_id),
      ...(historyRows ?? []).map((row) => row.movie_id),
      ...(ratingsRows ?? []).map((row) => row.movie_id),
    ])
  );

  let movieRows: RemoteMovie[] = [];

  if (movieIds.length > 0) {
    const { data, error } = await supabase
      .from('movies_cache')
      .select('tmdb_id, title, overview, poster_path, release_date, vote_average, genres')
      .in('tmdb_id', movieIds);

    if (error) throw new Error(error.message);
    movieRows = (data ?? []) as RemoteMovie[];
  }

  return {
    profile: (profileRows?.[0] as RemoteProfile | undefined) ?? null,
    movies: movieRows,
    wishlist: (wishlistRows ?? []) as RemoteWishlist[],
    history: (historyRows ?? []) as RemoteHistory[],
    ratings: (ratingsRows ?? []) as RemoteRating[],
  };
}

async function mergeRemoteIntoLocal(
  localUserId: string,
  snapshot: Awaited<ReturnType<typeof fetchRemoteSnapshot>>
): Promise<void> {
  for (const movie of snapshot.movies) {
    await MovieRepository.insert({
      id: movie.tmdb_id,
      title: movie.title,
      overview: movie.overview ?? undefined,
      poster_path: movie.poster_path ?? undefined,
      release_date: movie.release_date ?? undefined,
      vote_average: movie.vote_average ?? undefined,
      genres: movie.genres ?? [],
    });
  }

  for (const row of snapshot.wishlist) {
    const exists = await WishlistRepository.exists(row.movie_id, localUserId);
    if (!exists) {
      await WishlistRepository.addWithTimestamp(row.movie_id, localUserId, toUnix(row.added_at));
    }
  }

  const localHistory = await HistoryRepository.getAll(localUserId);
  const localHistoryIds = new Set(localHistory.map((row) => row.movie_id));

  for (const row of snapshot.history) {
    if (!localHistoryIds.has(row.movie_id)) {
      await HistoryRepository.addWithTimestamp(row.movie_id, localUserId, toUnix(row.watched_at));
    }
  }

  for (const row of snapshot.ratings) {
    await RatingsRepository.upsert(row.movie_id, row.rating, localUserId, toUnix(row.updated_at));
  }

  if (snapshot.profile?.theme_preference) {
    await UserRepository.updateThemePreference(localUserId, snapshot.profile.theme_preference);
    if (currentUser?.id === localUserId) {
      currentUser.theme_preference = snapshot.profile.theme_preference;
    }
  }
}

async function replaceLocalFromRemote(
  localUserId: string,
  snapshot: Awaited<ReturnType<typeof fetchRemoteSnapshot>>
): Promise<void> {
  for (const movie of snapshot.movies) {
    await MovieRepository.insert({
      id: movie.tmdb_id,
      title: movie.title,
      overview: movie.overview ?? undefined,
      poster_path: movie.poster_path ?? undefined,
      release_date: movie.release_date ?? undefined,
      vote_average: movie.vote_average ?? undefined,
      genres: movie.genres ?? [],
    });
  }

  await WishlistRepository.clearAll(localUserId);
  await HistoryRepository.clearAll(localUserId);
  await RatingsRepository.clearAll(localUserId);

  for (const row of snapshot.wishlist) {
    await WishlistRepository.addWithTimestamp(row.movie_id, localUserId, toUnix(row.added_at));
  }

  for (const row of snapshot.history) {
    await HistoryRepository.addWithTimestamp(row.movie_id, localUserId, toUnix(row.watched_at));
  }

  for (const row of snapshot.ratings) {
    await RatingsRepository.upsert(row.movie_id, row.rating, localUserId, toUnix(row.updated_at));
  }

  if (snapshot.profile?.theme_preference) {
    await UserRepository.updateThemePreference(localUserId, snapshot.profile.theme_preference);
    if (currentUser?.id === localUserId) {
      currentUser.theme_preference = snapshot.profile.theme_preference;
    }
  }
}

async function pushFullLocalSnapshot(localUserId: string, supabaseUserId: string): Promise<void> {
  const user = UserService.getCurrentUser();
  await upsertRemoteProfile(supabaseUserId, user.theme_preference);

  const wishlist = await WishlistRepository.getAll(localUserId);
  const history = await HistoryRepository.getAll(localUserId);
  const ratings = await RatingsRepository.getAll(localUserId);

  for (const item of wishlist) {
    await ensureRemoteMovie(item.movie_id);
    await upsertRemoteWishlist(supabaseUserId, item.movie_id, item.added_at);
  }

  for (const item of history) {
    await ensureRemoteMovie(item.movie_id);
    await upsertRemoteHistory(supabaseUserId, item.movie_id, item.watched_at);
  }

  for (const item of ratings) {
    await ensureRemoteMovie(item.movie_id);
    await upsertRemoteRating(supabaseUserId, item.movie_id, item.rating, item.timestamp);
  }
}

async function flushQueue(localUserId: string, supabaseUserId: string): Promise<void> {
  const pendingItems = await SyncQueueRepository.getPending(localUserId);

  for (const item of pendingItems) {
    try {
      const payload = JSON.parse(item.payload_json);

      if (item.entity_type === 'profile') {
        await upsertRemoteProfile(supabaseUserId, payload.themePreference);
      }

      if (item.entity_type === 'wishlist') {
        if (item.operation === 'delete') {
          await deleteRemoteWishlist(supabaseUserId, payload.movieId);
        } else {
          await ensureRemoteMovie(payload.movieId);
          await upsertRemoteWishlist(supabaseUserId, payload.movieId, payload.addedAt);
        }
      }

      if (item.entity_type === 'history') {
        if (item.operation === 'delete') {
          await deleteRemoteHistory(supabaseUserId, payload.movieId);
        } else {
          await ensureRemoteMovie(payload.movieId);
          await upsertRemoteHistory(supabaseUserId, payload.movieId, payload.watchedAt);
        }
      }

      if (item.entity_type === 'rating') {
        if (item.operation === 'delete') {
          await deleteRemoteRating(supabaseUserId, payload.movieId);
        } else {
          await ensureRemoteMovie(payload.movieId);
          await upsertRemoteRating(supabaseUserId, payload.movieId, payload.rating, payload.timestamp);
        }
      }

      await SyncQueueRepository.remove(item.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await SyncQueueRepository.markFailed(item.id, message);
    }
  }
}

async function ensureRemoteMovie(movieId: number): Promise<void> {
  const movie = await MovieRepository.getById(movieId);

  if (!movie) {
    return;
  }

  const genres = normalizeGenres(movie.genres);

  const { error } = await supabase.from('movies_cache').upsert(
    {
      tmdb_id: movie.id,
      title: movie.title,
      overview: movie.overview ?? null,
      poster_path: movie.poster_path ?? null,
      release_date: movie.release_date ?? null,
      vote_average: movie.vote_average ?? null,
      genres,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'tmdb_id',
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertRemoteProfile(
  supabaseUserId: string,
  themePreference: AppThemePreference
): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: supabaseUserId,
      theme_preference: themePreference,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertRemoteWishlist(supabaseUserId: string, movieId: number, addedAt: number): Promise<void> {
  const { error } = await supabase.from('wishlist').upsert(
    {
      user_id: supabaseUserId,
      movie_id: movieId,
      added_at: new Date(addedAt * 1000).toISOString(),
    },
    { onConflict: 'user_id,movie_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteRemoteWishlist(supabaseUserId: string, movieId: number): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', supabaseUserId)
    .eq('movie_id', movieId);

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertRemoteHistory(supabaseUserId: string, movieId: number, watchedAt: number): Promise<void> {
  const { error } = await supabase.from('history').upsert(
    {
      user_id: supabaseUserId,
      movie_id: movieId,
      watched_at: new Date(watchedAt * 1000).toISOString(),
    },
    { onConflict: 'user_id,movie_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteRemoteHistory(supabaseUserId: string, movieId: number): Promise<void> {
  const { error } = await supabase
    .from('history')
    .delete()
    .eq('user_id', supabaseUserId)
    .eq('movie_id', movieId);

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertRemoteRating(
  supabaseUserId: string,
  movieId: number,
  rating: number,
  timestamp: number
): Promise<void> {
  const { error } = await supabase.from('ratings').upsert(
    {
      user_id: supabaseUserId,
      movie_id: movieId,
      rating,
      updated_at: new Date(timestamp * 1000).toISOString(),
    },
    { onConflict: 'user_id,movie_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteRemoteRating(supabaseUserId: string, movieId: number): Promise<void> {
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('user_id', supabaseUserId)
    .eq('movie_id', movieId);

  if (error) {
    throw new Error(error.message);
  }
}

function toUnix(value: string): number {
  return Math.floor(new Date(value).getTime() / 1000);
}

function normalizeGenres(genres: string | (string | number)[] | undefined): (string | number)[] {
  if (!genres) {
    return [];
  }

  if (Array.isArray(genres)) {
    return genres;
  }

  try {
    const parsed = JSON.parse(genres);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
