import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Media } from '../types';
import MediaListItem from './MediaListItem';
import Spinner from './Spinner';

interface CardCarouselProps {
  title: string;
  fetchFn: (page: number) => Promise<{ results: Media[]; total_pages: number }>;
  viewMoreLink?: string;
  viewMoreState?: object;
}

const CardCarousel: React.FC<CardCarouselProps> = ({ title, fetchFn, viewMoreLink, viewMoreState }) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true);
        const data = await fetchFn(1);
        // Take the top 12 items for a 4x3 grid on large screens
        setMedia(data.results.slice(0, 12));
      } catch (error) {
        console.error(`Failed to fetch ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, title]);

  if (loading && media.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{title}</h2>
        <Spinner />
      </div>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-2">
        {media.map((item) => (
          <MediaListItem key={item.id} media={item} />
        ))}
      </div>
       {viewMoreLink && (
        <div className="text-right mt-4">
          <Link
            to={viewMoreLink}
            state={viewMoreState}
            className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
          >
            View more ›
          </Link>
        </div>
      )}
    </section>
  );
};

export default CardCarousel;
