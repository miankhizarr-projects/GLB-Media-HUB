import React from 'react';
import { Link } from 'react-router-dom';
import type { Cast } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';

interface CastCardProps {
  actor: Cast;
}

const CastCard: React.FC<CastCardProps> = ({ actor }) => {
  const profilePath = actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : null;

  return (
    <Link to={`/person/${actor.id}`} className="group block text-center">
      <div className="aspect-[2/3] bg-brand-surface rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
        {profilePath ? (
          <img src={profilePath} alt={actor.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-text-secondary">
            <i className="ri-user-fill text-5xl"></i>
          </div>
        )}
      </div>
      <div className="mt-2 px-1">
        <p className="text-white font-semibold text-sm truncate">{actor.name}</p>
        <p className="text-brand-text-secondary text-xs truncate">{actor.character}</p>
      </div>
    </Link>
  );
};

export default CastCard;