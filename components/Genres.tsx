import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovieGenres, getTvGenres } from '../services/tmdbService';
import type { Genre } from '../types';

const Genres: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const [movieGenresResponse, tvGenresResponse] = await Promise.all([
          getMovieGenres(),
          getTvGenres(),
        ]);
        
        const allGenres = new Map<number, Genre>();
        movieGenresResponse.genres.forEach(g => allGenres.set(g.id, g));
        tvGenresResponse.genres.forEach(g => allGenres.set(g.id, g));

        setGenres(Array.from(allGenres.values()).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  if (loading && genres.length === 0) {
    // Skeleton loader for genres
    return (
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6">Genres</h2>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-10 bg-brand-surface rounded-lg animate-pulse" style={{ width: `${Math.floor(Math.random() * (120 - 80 + 1)) + 80}px` }} />
          ))}
        </div>
      </section>
    );
  }

  if (genres.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">Genres</h2>
      <div className="flex flex-wrap gap-3">
        {genres.map(genre => (
          <Link
            key={genre.id}
            to={`/browse/genre/${genre.id}`}
            state={{ genreName: genre.name, mediaType: 'movie' }}
            className="px-4 py-2 bg-brand-surface hover:bg-brand-primary text-brand-text hover:text-white rounded-lg font-medium text-sm transition-colors duration-200"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Genres;