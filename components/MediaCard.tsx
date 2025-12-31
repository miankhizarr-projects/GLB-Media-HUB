import React from 'react';
import { Link } from 'react-router-dom';
import type { Media } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { useFavorites } from '../context/FavoritesContext';

const MediaCard: React.FC<{ media: Media }> = ({ media }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const title = media.title || media.name;
  const posterPath = media.poster_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : null;
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';

  const mediaType = media.media_type === 'person' ? 'person' : (media.title ? 'movie' : 'tv');
  
  const linkTo = `/${mediaType}/${media.id}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(media.id)) {
      removeFavorite(media.id);
    } else {
      addFavorite(media.id);
    }
  };

  if (mediaType === 'person') {
    return (
        <Link to={linkTo} className="group relative block bg-brand-bg-light rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full">
            <div className="aspect-[2/3]">
                {media.profile_path ? (
                    <img src={`${TMDB_IMAGE_BASE_URL}${media.profile_path}`} alt={media.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-brand-surface flex items-center justify-center">
                        <i className="ri-image-off-line text-5xl text-brand-text-secondary"></i>
                    </div>
                )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 w-full">
                <h3 className="text-white font-bold truncate">{media.name}</h3>
                <p className="text-brand-text-secondary text-sm">{media.known_for_department}</p>
            </div>
        </Link>
    );
  }

  const isFav = isFavorite(media.id);

  return (
    <Link to={linkTo} className="group relative block bg-brand-bg-light rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full">
        <div className="aspect-[2/3]">
            {posterPath ? <img src={posterPath} alt={title} className="w-full h-full object-cover" loading="lazy" /> : (
                <div className="w-full h-full bg-brand-surface flex items-center justify-center">
                    <i className="ri-image-off-line text-5xl text-brand-text-secondary"></i>
                </div>
            )}
        </div>
        
        <div className="absolute top-2 right-2">
            <button onClick={handleFavoriteClick} aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'} className={`p-2 rounded-full transition-colors duration-200 ${isFav ? 'bg-red-500/80 text-white' : 'bg-black/60 text-white/80 hover:bg-red-500/80'}`}>
                <i className="ri-heart-fill text-xl leading-none"></i>
            </button>
        </div>

        {media.vote_average > 0 && (
            <div className="absolute top-2 left-2 bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                {rating}
            </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-white font-bold text-base truncate group-hover:whitespace-normal group-hover:line-clamp-2 transition-all">{title}</h3>
        </div>
    </Link>
  );
};

export default MediaCard;