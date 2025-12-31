import React from 'react';
import Hero from '../components/Hero';
import CardCarousel from '../components/CardCarousel';
import { getTrending, getDiscover, getTopRatedTv } from '../services/tmdbService';
import Genres from '../components/Genres';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Genres />
      <div className="space-y-12">
        <CardCarousel
          title="Trending Now"
          fetchFn={(page) => getTrending(page)}
          viewMoreLink="/browse/list/popular"
          viewMoreState={{ mediaType: 'movie', title: 'Trending Movies & TV' }}
        />
        <CardCarousel
          title="Anime"
          fetchFn={(page) => getDiscover('tv', { with_genres: '16', with_origin_country: 'JP' }, page)}
          viewMoreLink="/browse/discover/JP"
          viewMoreState={{ mediaType: "tv", discoverParams: { with_genres: '16' }, title: "Anime" }}
        />
        <CardCarousel
          title="Indian Movies"
          fetchFn={(page) => getDiscover('movie', { with_origin_country: 'IN' }, page)}
          viewMoreLink="/browse/discover/IN"
          viewMoreState={{ mediaType: "movie", title: "Indian Movies" }}
        />
        <CardCarousel
          title="Korean Dramas"
          fetchFn={(page) => getDiscover('tv', { with_origin_country: 'KR' }, page)}
          viewMoreLink="/browse/discover/KR"
          viewMoreState={{ mediaType: "tv", title: "Korean Dramas" }}
        />
        <CardCarousel
          title="Top Rated Series"
          fetchFn={(page) => getTopRatedTv(page)}
          viewMoreLink="/browse/list/top_rated"
          viewMoreState={{ mediaType: "tv", title: "Top Rated Series" }}
        />
      </div>
    </>
  );
};

export default HomePage;
