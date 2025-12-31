import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrending } from '../services/tmdbService';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import type { Media } from '../types';
import Spinner from './Spinner';

const Hero: React.FC = () => {
  const [trending, setTrending] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await getTrending(1);
        setTrending(data.results.slice(0, 5)); // Take top 5 for the hero carousel
      } catch (error) {
        console.error('Failed to fetch trending media for hero:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (trending.length > 0) {
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % trending.length);
      }, 7000); // Change slide every 7 seconds

      return () => clearInterval(intervalId);
    }
  }, [trending]);

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-4">
        <Spinner />
      </div>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  const currentMedia = trending[currentIndex];
  const title = currentMedia.title || currentMedia.name;
  const mediaType = currentMedia.title ? 'movie' : 'tv';

  return (
    <section className="relative h-[50vh] md:h-[65vh] text-white -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-12">
      {/* Background Images for smooth transition */}
      {trending.map((media, index) => (
        <div
          key={media.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: media.backdrop_path ? `url(${TMDB_IMAGE_BASE_URL}${media.backdrop_path})` : '',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/70 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full container mx-auto px-8 sm:px-12 lg:px-16 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">
            {title}
          </h1>
          <p className="mt-4 text-md md:text-lg text-brand-text line-clamp-2 sm:line-clamp-3 drop-shadow-md">
            {currentMedia.overview}
          </p>
          <Link
            to={`/${mediaType}/${currentMedia.id}`}
            className="inline-block mt-6 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 shadow-lg"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {trending.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
