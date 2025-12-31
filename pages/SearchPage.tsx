import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { searchMulti } from '../services/tmdbService';
import type { Media } from '../types';
import MediaCard from '../components/MediaCard';
import Spinner from '../components/Spinner';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    // This effect synchronizes the URL with the debounced query
    // and triggers the API search.
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
      setLoading(true);
      searchMulti(debouncedQuery)
        .then((data) => {
          setResults(data.results);
        })
        .catch((error) => {
          console.error('Search failed:', error);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setResults([]);
      // Clear the query param if the input is empty
      if (searchParams.get('q')) {
        setSearchParams({}, { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, setSearchParams]);

  // Update query state if the URL changes (e.g., from header search)
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <div>
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies, TV shows, people..."
          className="w-full bg-brand-bg-light border-2 border-brand-surface rounded-full py-3 pl-12 pr-4 text-white placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-brand-text-secondary"></i>
      </div>

      {loading && <Spinner />}
      
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((media) => (
             <MediaCard key={media.id} media={media} />
          ))}
        </div>
      )}

      {!loading && debouncedQuery && results.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-brand-text-secondary">No results found for "{debouncedQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;