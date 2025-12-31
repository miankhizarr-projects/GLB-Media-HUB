
export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  // Fix: Add backdrop_path property to support background images in the Hero component.
  backdrop_path?: string | null;
  vote_average: number;
  media_type: 'movie' | 'tv' | 'person';
  release_date?: string;
  first_air_date?: string;
  profile_path?: string;
  overview?: string;
  genre_ids?: number[];
  // Fix: Add missing vote_count property.
  vote_count?: number;
  known_for_department?: string;
  credit_id?: string;
  character?: string;
  job?: string;
  department?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}

export interface Cast {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

// New types for details page enhancement
export interface AlternativeTitle {
  iso_3166_1: string;
  title: string;
  type: string;
}

export interface Image {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface Images {
  backdrops: Image[];
  posters: Image[];
  logos: Image[];
}

export interface Keyword {
  id: number;
  name: string;
}

export interface Review {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviders {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}
// End new types

export interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  vote_average: number;
  // Fix: Add vote_count for consistency as it is available from the API.
  vote_count?: number;
  genres: Genre[];
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  tagline: string | null;
  videos?: { results: Video[] };
  credits: Credits;
  similar: { results: Media[] };
  media_type: 'movie' | 'tv';

  // New fields from append_to_response
  alternative_titles?: { titles?: AlternativeTitle[], results?: AlternativeTitle[] };
  images?: Images;
  keywords?: { keywords?: Keyword[], results?: Keyword[] };
  recommendations?: { results: Media[] };
  reviews?: { results: Review[] };
  "watch/providers"?: { results: { [countryCode: string]: WatchProviders } };
}

export interface MovieDetails extends MediaDetails {
  media_type: 'movie';
}

export interface TvDetails extends MediaDetails {
  media_type: 'tv';
}

export interface ExternalIds {
  imdb_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
  tiktok_id?: string | null;
  youtube_id?: string | null;
}

export interface PersonDetails {
    id: number;
    name: string;
    profile_path: string | null;
    biography: string;
    birthday: string | null;
    place_of_birth: string | null;
    known_for_department: string;
    combined_credits: {
        cast: Media[];
        crew: Media[];
    };
    external_ids: ExternalIds;
    images: {
        profiles: Image[];
    };
}
