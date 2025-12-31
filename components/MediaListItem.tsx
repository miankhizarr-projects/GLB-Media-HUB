import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Media } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { useFavorites } from '../context/FavoritesContext';

const NoImage: React.FC<{className?: string}> = ({className = ''}) => (
    <div className={`w-full h-full bg-brand-surface flex items-center justify-center ${className}`}>
        <i className="ri-image-off-line text-3xl text-brand-text-secondary"></i>
    </div>
);

interface MediaListItemProps {
  media: Media;
}

const MediaListItem: React.FC<MediaListItemProps> = ({ media }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const title = media.title || media.name;
  const posterPath = media.poster_path || media.profile_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path || media.profile_path}` : null;
  const mediaType = media.media_type === 'person' ? 'person' : (media.title ? 'movie' : 'tv');
  const linkTo = `/${mediaType}/${media.id}`;

  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState<'right' | 'left'>('right');
  const itemRef = useRef<HTMLAnchorElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const POPUP_WIDTH = 320; // Corresponds to w-80 in Tailwind (20rem)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            
            // Check if showing on the right would overflow the viewport
            const overflowsRight = rect.right + POPUP_WIDTH > window.innerWidth;
            // Check if there's enough space on the left to show it there instead
            const hasSpaceOnLeft = rect.left > POPUP_WIDTH;

            if (overflowsRight && hasSpaceOnLeft) {
                setPopupPosition('left');
            } else {
                setPopupPosition('right');
            }
        }
        setIsHovered(true);
    }, 200); // 200ms delay to show, as requested
  };

  const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
      }
      setIsHovered(false);
  };


  if (mediaType === 'person') {
    return (
      <Link to={linkTo} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-brand-surface/50 transition-colors duration-200">
        <div className="w-16 flex-shrink-0">
          <div className="aspect-[2/3] bg-brand-surface rounded-md overflow-hidden shadow-lg">
            {posterPath ? (
              <img src={posterPath} alt={title} className="w-full h-full object-cover" loading="lazy" />
            ) : <NoImage />}
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          <p className="text-sm text-brand-text-secondary mt-2">{media.known_for_department}</p>
        </div>
      </Link>
    );
  }
  
  const isFav = isFavorite(media.id);
  const year = media.release_date?.substring(0, 4) || media.first_air_date?.substring(0, 4);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(media.id);
    } else {
      addFavorite(media.id);
    }
  };

  const mockCC = media.vote_average ? Math.round(media.vote_average * 100) + Math.round(media.vote_average) : 'N/A';
  const popularity = media.vote_count ?? 0;

  return (
    <div 
      className="relative my-1" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      <Link to={linkTo} className="block rounded-lg" aria-label={title} ref={itemRef}>
        {/* Default visible content */}
        <div className={`flex items-start space-x-3 p-2 rounded-lg ${isHovered ? 'bg-brand-surface/50' : ''} transition-colors duration-200`}>
          <div className="w-16 flex-shrink-0">
            <div className="aspect-[2/3] bg-brand-surface rounded-md overflow-hidden shadow-lg">
              {posterPath ? (
                <img src={posterPath} alt={title} className="w-full h-full object-cover" loading="lazy" />
              ) : <NoImage />}
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className={`text-white font-semibold truncate ${isHovered ? 'text-wrap line-clamp-2' : ''}`}>{title}</h3>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-brand-text-secondary mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20 font-medium">
                CC {mockCC}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20 font-medium">
                <i className="ri-thumb-up-fill text-sm"></i>
                {popularity.toLocaleString()}
              </span>
              <span>•</span>
              <span className="uppercase font-semibold tracking-wider">{mediaType}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Popup Card on hover */}
      <div 
        className={`absolute top-1/2 w-80 z-20
                    transition-all duration-300 ease-in-out
                    transform -translate-y-1/2
                    ${popupPosition === 'right' 
                        ? 'left-full ml-2 -translate-x-1/4' 
                        : 'right-full mr-2 translate-x-1/4'
                    }
                    ${isHovered 
                        ? 'opacity-100 visible scale-100' 
                        : 'opacity-0 invisible scale-95'
                    }
                    ${isHovered ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div className="bg-brand-bg-light rounded-lg shadow-2xl flex flex-col overflow-hidden h-full">
              <div className="relative aspect-video flex-shrink-0">
                  {media.backdrop_path ? (
                      <img src={`${TMDB_IMAGE_BASE_URL}${media.backdrop_path}`} alt={title} className="w-full h-full object-cover" />
                  ) : posterPath ? (
                       <img src={posterPath} alt={title} className="w-full h-full object-cover" />
                  ) : (
                      <NoImage className="!text-5xl" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg-light to-transparent"></div>
              </div>

              <div className="p-3 flex-grow flex flex-col justify-between">
                  <div>
                      <h3 className="font-bold text-base line-clamp-2 text-white">{title}</h3>
                      <div className="flex items-center gap-2 text-xs text-brand-text-secondary mt-1">
                          {year && <span>{year}</span>}
                          {year && media.vote_average > 0 && <span>•</span>}
                          {media.vote_average > 0 && (
                              <div className="flex items-center gap-1">
                                  <i className="ri-star-fill text-yellow-400"></i>
                                  <span>{media.vote_average.toFixed(1)}</span>
                              </div>
                          )}
                      </div>
                      <p className="text-xs text-brand-text mt-2 line-clamp-3">
                          {media.overview || 'No overview available.'}
                      </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-surface/50">
                      <Link to={linkTo} className="bg-brand-primary text-white font-bold py-1.5 px-4 rounded-full text-xs hover:bg-brand-secondary transition-colors">
                          See
                      </Link>
                      <button onClick={handleFavoriteClick} aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'} className={`p-2 rounded-full transition-colors duration-200 ${isFav ? 'text-red-500' : 'text-white/70 hover:text-red-500'}`}>
                          <i className={`ri-heart-${isFav ? 'fill' : 'line'} text-xl`}></i>
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default MediaListItem;