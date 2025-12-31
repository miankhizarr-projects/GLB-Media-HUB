import { TMDB_API_KEY, TMDB_API_BASE_URL } from '../constants';
import type { Media, MediaDetails, PersonDetails, Video, Genre } from '../types';

interface TmdbResponse<T> {
  page: number;
  results: T;
  total_pages: number;
  total_results: number;
}

interface GenreListResponse {
  genres: Genre[];
}


const fetchFromTmdb = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTrending = (page = 1): Promise<TmdbResponse<Media[]>> => {
  return fetchFromTmdb('/trending/all/week', { page: String(page) });
};

export const getDiscover = (mediaType: 'movie' | 'tv', params: Record<string, string>, page = 1): Promise<TmdbResponse<Media[]>> => {
  return fetchFromTmdb(`/discover/${mediaType}`, {
    ...params,
    page: String(page),
    sort_by: 'popularity.desc',
  });
};

export const getPopular = (mediaType: 'movie' | 'tv' | 'person', page = 1): Promise<TmdbResponse<Media[]>> => {
  return fetchFromTmdb(`/${mediaType}/popular`, { page: String(page) });
};

export const getTopRated = (mediaType: 'movie' | 'tv', page = 1): Promise<TmdbResponse<Media[]>> => {
  return fetchFromTmdb(`/${mediaType}/top_rated`, { page: String(page) });
};

// Note: Kept for backwards compatibility with existing HomePage CardCarousel
export const getTopRatedTv = (page = 1): Promise<TmdbResponse<Media[]>> => {
  return fetchFromTmdb('/tv/top_rated', { page: String(page) });
};

export const getUpcoming = (page = 1): Promise<TmdbResponse<Media[]>> => {
  return fetchFromTmdb('/movie/upcoming', { page: String(page) });
};

export const searchMulti = (query: string, page = 1): Promise<TmdbResponse<Media[]>> => {
  return fetchFromTmdb('/search/multi', { query, page: String(page) });
};

export const getMediaDetails = (mediaType: 'movie' | 'tv', id: number): Promise<MediaDetails> => {
    return fetchFromTmdb(`/${mediaType}/${id}`, {
        append_to_response: 'credits,videos,images,keywords,reviews,recommendations,watch/providers,alternative_titles,similar'
    });
};

export const getPersonDetails = (id: number): Promise<PersonDetails> => {
    return fetchFromTmdb(`/person/${id}`, {
        append_to_response: 'combined_credits,external_ids,images'
    });
};

export const getMovieGenres = (): Promise<GenreListResponse> => {
  return fetchFromTmdb('/genre/movie/list');
};

export const getTvGenres = (): Promise<GenreListResponse> => {
  return fetchFromTmdb('/genre/tv/list');
};