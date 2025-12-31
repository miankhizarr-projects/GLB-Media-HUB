import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import * as tmdbService from '../services/tmdbService';
import type { Media } from '../types';
import BrowseCard from '../components/BrowseCard';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

const BrowsePage: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { type, slug } = useParams<{ type: string; slug: string }>();
  
  const [media, setMedia] = useState<Media[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const mediaType = location.state?.mediaType as 'movie' | 'tv' | 'person' || 'movie';

  const generateTitle = useCallback(() => {
    if (location.state?.title) {
      setTitle(location.state.title);
      return;
    }

    let newTitle = '';
    const mediaTypeMap: { [key:string]: string } = { movie: 'Movies', tv: 'TV Shows', person: 'People' };

    if (type === 'discover' && slug) {
      const countryMap: { [key: string]: string } = { PK: 'Pakistani', IN: 'Indian', KR: 'Korean', US: 'Hollywood', TR: 'Turkish', JP: 'Japanese' };
      const discoverMediaTypeMap: { [key: string]: string } = { tv: 'Dramas', movie: 'Movies' };
      newTitle = `${countryMap[slug.toUpperCase()] || ''} ${discoverMediaTypeMap[mediaType] || ''}`;
    } else if (type === 'list' && slug) {
      const categoryMap: { [key: string]: string } = { popular: 'Popular', top_rated: 'Top Rated', upcoming: 'Upcoming' };
      newTitle = `${categoryMap[slug]} ${mediaTypeMap[mediaType]}`;
    } else if (type === 'genre') {
      const genreName = location.state?.genreName;
      newTitle = `${genreName || 'Genre'} ${mediaTypeMap[mediaType as 'movie' | 'tv']}`;
    }
    setTitle(newTitle);
  }, [mediaType, type, slug, location.state]);

  const fetchData = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    let response;
    
    try {
      if (type === 'discover' && slug && (mediaType === 'movie' || mediaType === 'tv')) {
        const params = {
            with_origin_country: slug,
            ...location.state?.discoverParams,
        };
        response = await tmdbService.getDiscover(mediaType, params, pageNum);
      } else if (type === 'genre' && slug && (mediaType === 'movie' || mediaType === 'tv')) {
        response = await tmdbService.getDiscover(mediaType, { with_genres: slug }, pageNum);
      } else if (type === 'list' && slug) {
        switch (slug) {
          case 'popular':
            response = await tmdbService.getPopular(mediaType, pageNum);
            break;
          case 'top_rated':
            if (mediaType === 'movie' || mediaType === 'tv') {
              response = await tmdbService.getTopRated(mediaType, pageNum);
            }
            break;
          case 'upcoming':
            if (mediaType === 'movie') {
              response = await tmdbService.getUpcoming(pageNum);
            }
            break;
        }
      }

      if (response) {
        const accessibleTotalPages = Math.min(response.total_pages, 500);
        setMedia(response.results);
        setTotalPages(accessibleTotalPages);
      } else {
        throw new Error("Invalid browse category or media type.");
      }
    } catch (err) {
      console.error("Failed to fetch browse data:", err);
      setError("Could not load content. Please try again later.");
    } finally {
        setLoading(false);
    }
  }, [mediaType, type, slug, location.state]);
  
  useEffect(() => {
    generateTitle();
    fetchData(currentPage);
    window.scrollTo(0, 0);
  }, [location.key, currentPage, generateTitle, fetchData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">{title}</h1>
      {loading ? (
         <div className="min-h-[50vh] flex items-center justify-center"><Spinner /></div>
      ) : error ? (
        <p className="text-center text-red-500 text-lg mt-10">{error}</p>
      ) : media.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {media.map((item) => {
              const itemMediaType = item.media_type || (item.title ? 'movie' : 'tv');
              return <BrowseCard key={item.id} media={{ ...item, media_type: itemMediaType as 'movie' | 'tv' | 'person' }} />;
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
         <p className="text-center text-brand-text-secondary text-lg mt-10">No content found for this category.</p>
      )}
    </div>
  );
};

export default BrowsePage;
