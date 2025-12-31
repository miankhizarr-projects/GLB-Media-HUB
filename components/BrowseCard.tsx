import React from 'react';
import { Link } from 'react-router-dom';
import type { Media } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { useFavorites } from '../context/FavoritesContext';

interface BrowseCardProps {
  media: Media;
}

const NoImage: React.FC = () => (
    <div className="w-full h-full bg-brand-bg-light flex items-center justify-center">
        <i className="ri-image-off-line text-5xl text-brand-text-secondary/20"></i>
    </div>
);

const BrowseCard: React.FC<BrowseCardProps> = ({ media }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const title = media.title || media.name;
  const posterPath = media.poster_path || media.profile_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : null;
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null;

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

  const isFav = isFavorite(media.id);

  return (
    <Link to={linkTo} className="group relative block bg-brand-surface rounded-lg overflow-hidden shadow-lg hover:shadow-brand-primary/20 hover:-translate-y-1 transition-all duration-300 h-full">
      <div className="aspect-[2/3]">
        {posterPath ? <img src={posterPath} alt={title} className="w-full h-full object-cover" loading="lazy" /> : <NoImage />}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
      
      {mediaType !== 'person' && (
        <button 
          onClick={handleFavoriteClick} 
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors duration-200 group-hover:opacity-100 ${isFav ? 'opacity-100 bg-brand-primary/80 text-white' : 'opacity-0 bg-black/50 text-white/70 hover:bg-brand-primary/80'}`}
        >
          <i className="ri-bookmark-fill text-xl"></i>
        </button>
      )}

      {rating && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-brand-primary">
          {rating}
        </div>
      )}
      
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="text-white font-semibold text-sm leading-tight truncate group-hover:whitespace-normal group-hover:line-clamp-2 transition-all">{title}</h3>
      </div>
    </Link>
  );
};

export default BrowseCard;