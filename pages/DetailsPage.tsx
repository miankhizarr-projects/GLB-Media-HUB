import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMediaDetails } from '../services/tmdbService';
import type { MediaDetails, Cast, Video, WatchProviders, Images, Review, Keyword, Media } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import Spinner from '../components/Spinner';
import MediaCard from '../components/MediaCard';
import TrailerModal from '../components/TrailerModal';
import { useFavorites } from '../context/FavoritesContext';
import CastCard from '../components/CastCard';

// --- NEW SUB-COMPONENTS ---

// --- NEW IMAGE MODAL COMPONENT ---
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageTitle: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, imageTitle }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[60] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div ref={modalRef} className="relative w-full max-w-5xl h-full max-h-[90vh] bg-transparent flex flex-col items-center justify-center">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-brand-bg-light rounded-full text-white hover:bg-brand-surface transition-colors sm:top-0 sm:right-0"
          aria-label="Close image viewer"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>
        <img src={imageUrl} alt={imageTitle} className="max-w-full max-h-full object-contain rounded-lg" />
      </div>
    </div>
  );
};

const WatchProviderSection: React.FC<{ providers: WatchProviders }> = ({ providers }) => {
  const hasProviders = providers.flatrate || providers.rent || providers.buy;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-white mb-4">Where to Watch</h2>
      {!hasProviders ? (
         <p className="text-brand-text-secondary">Not available for streaming, rent, or purchase in this region.</p>
      ) : (
        <div className="bg-brand-surface p-4 rounded-lg">
          {providers.flatrate && providers.flatrate.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-brand-text mb-2">Streaming</h3>
              <div className="flex flex-wrap gap-3">
                {providers.flatrate.map(p => <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="w-12 h-12 rounded-md" />)}
              </div>
            </div>
          )}
          {providers.rent && providers.rent.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-brand-text mb-2">Rent</h3>
              <div className="flex flex-wrap gap-3">
                {providers.rent.map(p => <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="w-12 h-12 rounded-md" />)}
              </div>
            </div>
          )}
          {providers.buy && providers.buy.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Buy</h3>
              <div className="flex flex-wrap gap-3">
                {providers.buy.map(p => <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="w-12 h-12 rounded-md" />)}
              </div>
            </div>
          )}
           <p className="text-xs text-brand-text-secondary mt-4">Provider data from JustWatch.</p>
        </div>
      )}
    </div>
  );
};

const ImageGallery: React.FC<{ images: Images, title: string, onImageClick: (imageUrl: string) => void }> = ({ images, title, onImageClick }) => {
    const [activeTab, setActiveTab] = useState<'backdrops' | 'posters'>('backdrops');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const tabs = [
        { key: 'backdrops', name: `Backdrops (${images.backdrops.length})`, data: images.backdrops },
        { key: 'posters', name: `Posters (${images.posters.length})`, data: images.posters },
    ];
    const activeData = activeTab === 'backdrops' ? images.backdrops : images.posters;

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">Media</h2>
            <div className="border-b border-brand-surface mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.name} onClick={() => setActiveTab(tab.key as any)}
                            className={`${ activeTab === tab.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-secondary hover:text-white hover:border-gray-500' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        > {tab.name} </button>
                    ))}
                </nav>
            </div>
            <div className="relative group">
                 <button onClick={() => handleScroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1/2 hidden sm:block" aria-label="Scroll left">
                    <i className="ri-arrow-left-s-line text-2xl"></i>
                </button>
                <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-4 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 no-scrollbar">
                    {activeData.map((image, index) => (
                        <button key={index} onClick={() => onImageClick(`${TMDB_IMAGE_BASE_URL}${image.file_path}`)}
                           className={`flex-shrink-0 rounded-lg overflow-hidden shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${activeTab === 'backdrops' ? 'w-80 aspect-video' : 'w-40 aspect-[2/3]'}`}>
                            <img src={`${TMDB_IMAGE_BASE_URL}${image.file_path}`} alt={`${title} ${activeTab.slice(0, -1)}`} className="w-full h-full object-cover"/>
                        </button>
                    ))}
                </div>
                <button onClick={() => handleScroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/2 hidden sm:block" aria-label="Scroll right">
                    <i className="ri-arrow-right-s-line text-2xl"></i>
                </button>
            </div>
        </div>
    );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { author_details, content, created_at } = review;

    let avatarUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' /%3E%3C/svg%3E";
    if (author_details.avatar_path) {
        if (author_details.avatar_path.startsWith('/')) {
            avatarUrl = `${TMDB_IMAGE_BASE_URL}${author_details.avatar_path}`;
        } else {
            avatarUrl = `https://www.gravatar.com/avatar/${author_details.avatar_path}`;
        }
    }
    const formattedDate = new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const needsTruncation = content.length > 400;

    return (
        <div className="bg-brand-surface p-4 sm:p-6 rounded-lg">
            <div className="flex items-center mb-4">
                <img src={avatarUrl} alt={author_details.username} className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                    <p className="font-semibold text-white">{author_details.name || author_details.username}</p>
                    <p className="text-sm text-brand-text-secondary">{formattedDate}</p>
                </div>
                {author_details.rating && (
                    <div className="ml-auto flex items-center gap-1 bg-brand-bg-light px-2 py-1 rounded-full text-sm">
                        <i className="ri-star-fill text-base text-yellow-400"></i>
                        <span className="font-bold text-white">{author_details.rating}</span>
                        <span className="text-brand-text-secondary">/ 10</span>
                    </div>
                )}
            </div>
            <div className="text-brand-text leading-relaxed prose prose-invert prose-sm max-w-none">
                 <p className={!isExpanded && needsTruncation ? 'line-clamp-6' : ''}>{content}</p>
                 {needsTruncation && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-brand-primary font-semibold hover:underline mt-2">
                        {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                )}
            </div>
        </div>
    );
}

const ReviewsSection: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
    const [showAll, setShowAll] = useState(false);
    const reviewsToShow = showAll ? reviews : reviews.slice(0, 3);
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">Reviews</h2>
            <div className="space-y-6">
                {reviewsToShow.map(review => <ReviewCard key={review.id} review={review} />)}
            </div>
            {reviews.length > 3 && (
                <div className="text-center mt-8">
                    <button onClick={() => setShowAll(!showAll)} className="bg-brand-surface hover:bg-brand-bg-light text-white font-bold py-2 px-6 rounded-full transition-colors">
                        {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                    </button>
                </div>
            )}
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const DetailsPage: React.FC = () => {
  const { mediaType, id } = useParams<{ mediaType: 'movie' | 'tv'; id: string }>();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showAllCast, setShowAllCast] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (mediaType && id) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          setShowAllCast(false);
          
          const mediaId = parseInt(id, 10);
          if (isNaN(mediaId)) {
            setError("Invalid media ID.");
            setLoading(false);
            return;
          }
          if (mediaType !== 'movie' && mediaType !== 'tv') {
            setError("Invalid media type.");
            setLoading(false);
            return;
          }
          
          const detailsData = await getMediaDetails(mediaType, mediaId);
          setDetails(detailsData);
          
          const videos = detailsData.videos?.results || [];
          const officialTrailer = videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer');
          const fallbackTrailer = videos.find(v => v.site === 'YouTube') || videos[0];
          setTrailer(officialTrailer || fallbackTrailer || null);

        } catch (err) {
          setError('Failed to fetch details. Please try again later.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
      window.scrollTo(0, 0);
    }
  }, [mediaType, id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (error) return <p className="text-center text-red-500 text-lg mt-10">{error}</p>;
  if (!details) return <p className="text-center text-brand-text-secondary text-lg mt-10">No details available.</p>;

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]);
  const isFav = isFavorite(details.id);

  const handleFavoriteClick = () => {
    if (isFav) removeFavorite(details.id);
    else addFavorite(details.id);
  };

  const castToDisplay = showAllCast ? details.credits.cast : details.credits.cast.slice(0, 10);

  const watchProviders = details['watch/providers']?.results?.US;
  const recommendations: Media[] = (details.recommendations?.results && details.recommendations.results.length > 0) ? details.recommendations.results : details.similar.results;
  const keywords: Keyword[] = details.keywords?.keywords || details.keywords?.results || [];
  const reviews: Review[] = details.reviews?.results || [];
  const images = details.images;

  return (
    <>
      {/* Backdrop Section */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 h-[50vh] md:h-[60vh] lg:h-[70vh]">
        {details.backdrop_path && (
          <img src={`${TMDB_IMAGE_BASE_URL}${details.backdrop_path}`} alt={`${title} backdrop`} className="w-full h-full object-cover"/>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/70 to-transparent"></div>
      </div>

      {/* Main Details Section */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-32 md:-mt-48">
        <div className="md:flex md:space-x-8 items-end">
          <div className="flex-shrink-0 w-4/5 sm:w-1/2 md:w-1/3 max-w-xs mx-auto md:mx-0">
            {details.poster_path ? (
              <img src={`${TMDB_IMAGE_BASE_URL}${details.poster_path}`} alt={title} className="rounded-lg shadow-2xl w-full"/>
            ) : (
               <div className="aspect-[2/3] bg-brand-surface rounded-lg flex items-center justify-center">
                 <i className="ri-movie-2-line text-7xl text-brand-text-secondary"></i>
               </div>
            )}
          </div>
          <div className="mt-6 md:mt-0 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{title}</h1>
            <p className="text-lg text-brand-text-secondary mt-1">{details.tagline}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-brand-text-secondary mt-4">
              <span>{year}</span>
              {details.genres.length > 0 && <span>•</span>}
              <span>{details.genres.map(g => g.name).join(', ')}</span>
              {runtime && <span>•</span>}
              {runtime && <span>{runtime} min</span>}
            </div>
          </div>
        </div>

        {/* Actions & Overview */}
        <div className="md:flex md:space-x-8 items-start mt-8">
          <div className="flex-shrink-0 md:w-1/3 max-w-xs mx-auto md:mx-0 flex flex-col items-center space-y-4">
              {trailer && (
                <button onClick={() => setIsTrailerOpen(true)} className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                  <i className="ri-play-fill text-2xl"></i> Play Trailer
                </button>
              )}
              <button onClick={handleFavoriteClick} className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-colors ${ isFav ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-brand-surface text-white hover:bg-brand-bg-light' }`}>
                <i className="ri-heart-fill text-2xl"></i> {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
               {details.vote_average > 0 && (
                <div className="text-center pt-2">
                    <p className="text-brand-text-secondary text-sm">RATING</p>
                    <p className="text-3xl font-bold text-white">{details.vote_average.toFixed(1)} <span className="text-lg">/ 10</span></p>
                    <p className="text-brand-text-secondary text-xs">{details.vote_count?.toLocaleString()} votes</p>
                </div>
               )}
          </div>
          <div className="mt-8 md:mt-0">
            <h2 className="text-2xl font-semibold text-white mb-2">Overview</h2>
            <p className="text-brand-text leading-relaxed">{details.overview || 'No overview available.'}</p>
            {keywords.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                        {keywords.map(k => <span key={k.id} className="px-3 py-1 bg-brand-surface text-brand-text-secondary text-sm rounded-full">{k.name}</span>)}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Where to Watch Section */}
      {watchProviders && <WatchProviderSection providers={watchProviders} />}
      
      {/* Cast Section */}
      {details.credits?.cast && details.credits.cast.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">Top Billed Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                {castToDisplay.map((actor: Cast) => <CastCard key={actor.id} actor={actor} />)}
            </div>
            {details.credits.cast.length > 10 && !showAllCast && (
                <div className="text-center mt-8">
                    <button onClick={() => setShowAllCast(true)} className="bg-brand-surface hover:bg-brand-bg-light text-white font-bold py-2 px-6 rounded-full transition-colors">
                        See More
                    </button>
                </div>
            )}
        </div>
      )}

      {/* Media Gallery Section */}
      {images && (images.backdrops.length > 0 || images.posters.length > 0) && (
          <ImageGallery images={images} title={title ?? ''} onImageClick={handleImageClick} />
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && <ReviewsSection reviews={reviews} />}

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">Recommendations</h2>
            <div className="relative group">
                <button onClick={() => handleScroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1/2" aria-label="Scroll left">
                    <i className="ri-arrow-left-s-line text-2xl"></i>
                </button>
                <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-4 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 no-scrollbar">
                    {recommendations.map(media => (
                        <div key={media.id} className="flex-shrink-0 w-40 sm:w-48 md:w-56">
                            <MediaCard media={{...media, media_type: mediaType ?? 'movie' }} />
                        </div>
                    ))}
                </div>
                <button onClick={() => handleScroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/2" aria-label="Scroll right">
                    <i className="ri-arrow-right-s-line text-2xl"></i>
                </button>
            </div>
        </div>
      )}

      {trailer && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          videoKey={trailer.key}
          videoTitle={trailer.name}
        />
      )}

      <ImageModal 
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImageUrl}
        imageTitle={`${title} image`}
      />
    </>
  );
};

export default DetailsPage;