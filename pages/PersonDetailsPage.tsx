import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPersonDetails } from '../services/tmdbService';
import type { PersonDetails, Media, Image } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import Spinner from '../components/Spinner';
import MediaCard from '../components/MediaCard';

// --- IMAGE MODAL ---
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[60] p-4" onClick={() => onClose()} role="dialog" aria-modal="true">
      <div ref={modalRef} className="relative w-full max-w-5xl h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-2 -right-2 z-10 p-2 bg-brand-bg-light rounded-full text-white hover:bg-brand-surface" aria-label="Close image viewer">
          <i className="ri-close-line text-2xl"></i>
        </button>
        <img src={imageUrl} alt="Profile" className="max-w-full max-h-full object-contain rounded-lg mx-auto" />
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const PersonDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const knownForRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const personId = parseInt(id, 10);
          if (isNaN(personId)) {
            setError("Invalid person ID.");
            setLoading(false);
            return;
          }
          const data = await getPersonDetails(personId);
          setPerson(data);
        } catch (err) {
          setError(`Failed to fetch person's details. Please try again later.`);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
      window.scrollTo(0,0);
    }
  }, [id]);

  const knownFor = useMemo(() => {
    if (!person?.combined_credits?.cast) return [];
    return [...person.combined_credits.cast]
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
      .slice(0, 10);
  }, [person]);

  const filmography = useMemo(() => {
    if (!person) return { acting: [], crew: new Map() };
    const { cast, crew } = person.combined_credits;

    const sortedCast = [...cast].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date;
      const dateB = b.release_date || b.first_air_date;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    const crewByDept = new Map<string, Media[]>();
    crew.forEach(credit => {
      if (credit.department) {
        if (!crewByDept.has(credit.department)) {
          crewByDept.set(credit.department, []);
        }
        crewByDept.get(credit.department)!.push(credit);
      }
    });

     crewByDept.forEach((credits, dept) => {
        credits.sort((a, b) => {
            const dateA = a.release_date || a.first_air_date;
            const dateB = b.release_date || b.first_air_date;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    });

    return { acting: sortedCast, crew: crewByDept };
  }, [person]);

  const [activeTab, setActiveTab] = useState('Acting');
  useEffect(() => {
    setActiveTab('Acting'); // Reset tab on person change
  }, [person]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (error) return <p className="text-center text-red-500 text-lg mt-10">{error}</p>;
  if (!person) return <p className="text-center text-brand-text-secondary text-lg mt-10">No details available.</p>;

  const crewTabs = Array.from(filmography.crew.keys());
  
  const socialLinks = [
    { key: 'imdb_id', url: `https://www.imdb.com/name/${person.external_ids.imdb_id}`, name: 'IMDb' },
    { key: 'twitter_id', url: `https://twitter.com/${person.external_ids.twitter_id}`, name: 'Twitter' },
    { key: 'instagram_id', url: `https://instagram.com/${person.external_ids.instagram_id}`, name: 'Instagram' },
    { key: 'facebook_id', url: `https://facebook.com/${person.external_ids.facebook_id}`, name: 'Facebook' },
  ].filter(link => person.external_ids[link.key as keyof typeof person.external_ids]);


  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:flex md:space-x-8">
        {/* Left Column */}
        <div className="md:w-1/3 flex-shrink-0">
          <div className="w-4/5 sm:w-1/2 md:w-full max-w-sm mx-auto">
            {person.profile_path ? (
              <img src={`${TMDB_IMAGE_BASE_URL}${person.profile_path}`} alt={person.name} className="rounded-lg shadow-2xl w-full"/>
            ) : (
              <div className="aspect-[2/3] bg-brand-surface rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-7xl text-brand-text-secondary"></i>
              </div>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-6 flex justify-center md:justify-start flex-wrap gap-3">
                {socialLinks.map(link => (
                    <a key={link.key} href={link.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-surface hover:bg-brand-bg-light text-brand-text text-sm font-semibold rounded-full transition-colors">
                        {link.name}
                    </a>
                ))}
            </div>
          )}
          <div className="mt-6 space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Personal Info</h3>
            <p><strong className="font-semibold text-brand-text-secondary">Known For:</strong> {person.known_for_department}</p>
            {person.birthday && <p><strong className="font-semibold text-brand-text-secondary">Born:</strong> {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
            {person.place_of_birth && <p><strong className="font-semibold text-brand-text-secondary">Place of Birth:</strong> {person.place_of_birth}</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className="md:w-2/3 mt-8 md:mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center md:text-left">{person.name}</h1>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Biography</h2>
          <p className="text-brand-text leading-relaxed prose prose-invert max-w-none">{person.biography || 'No biography available.'}</p>

          {knownFor.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-white mb-4">Known For</h2>
              <div className="relative group">
                <button onClick={() => handleScroll(knownForRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden sm:block"><i className="ri-arrow-left-s-line text-2xl"></i></button>
                <div ref={knownForRef} className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar -mx-4 px-4">
                  {knownFor.map(media => (
                    <div key={`${media.id}-${media.credit_id}`} className="flex-shrink-0 w-36 sm:w-40 md:w-44">
                      <MediaCard media={{...media, media_type: media.media_type || (media.title ? 'movie' : 'tv')}} />
                    </div>
                  ))}
                </div>
                <button onClick={() => handleScroll(knownForRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden sm:block"><i className="ri-arrow-right-s-line text-2xl"></i></button>
              </div>
            </div>
          )}
          
          {person.images.profiles.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-white mb-4">Photos</h2>
              <div className="relative group">
                 <button onClick={() => handleScroll(photosRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden sm:block"><i className="ri-arrow-left-s-line text-2xl"></i></button>
                <div ref={photosRef} className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar -mx-4 px-4">
                  {person.images.profiles.map((img: Image, idx: number) => (
                    <button key={idx} className="flex-shrink-0 w-32 aspect-[2/3] rounded-lg overflow-hidden shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" onClick={() => setSelectedImageUrl(`${TMDB_IMAGE_BASE_URL}${img.file_path}`)}>
                      <img src={`${TMDB_IMAGE_BASE_URL}${img.file_path}`} alt={`${person.name} profile ${idx+1}`} className="w-full h-full object-cover"/>
                    </button>
                  ))}
                </div>
                <button onClick={() => handleScroll(photosRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden sm:block"><i className="ri-arrow-right-s-line text-2xl"></i></button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Filmography Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-3xl font-bold text-white mb-6">Filmography</h2>
        <div className="border-b border-brand-surface mb-4">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {['Acting', ...crewTabs].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`${ activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-secondary hover:text-white hover:border-gray-500' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    > {tab} ({tab === 'Acting' ? filmography.acting.length : filmography.crew.get(tab)?.length}) </button>
                ))}
            </nav>
        </div>
        <div className="bg-brand-surface/50 rounded-lg overflow-hidden">
            {(activeTab === 'Acting' ? filmography.acting : filmography.crew.get(activeTab) || []).map((credit, index) => {
                const year = credit.release_date?.substring(0,4) || credit.first_air_date?.substring(0,4) || '----';
                const title = credit.title || credit.name;
                const role = credit.character || credit.job;
                const mediaType = credit.media_type || (credit.title ? 'movie' : 'tv');
                return (
                    <Link key={`${credit.id}-${credit.credit_id}-${index}`} to={`/${mediaType}/${credit.id}`} className={`flex items-center p-3 text-sm transition-colors hover:bg-brand-surface ${index !== 0 ? 'border-t border-brand-bg-light' : ''}`}>
                        <span className="w-12 font-semibold text-brand-text-secondary">{year}</span>
                        <span className="flex-1 font-bold text-white truncate pr-4">{title}</span>
                        {role && <span className="text-brand-text-secondary text-right truncate">{role}</span>}
                    </Link>
                )
            })}
        </div>
      </div>

      <ImageModal isOpen={!!selectedImageUrl} onClose={() => setSelectedImageUrl(null)} imageUrl={selectedImageUrl}/>
    </>
  );
};

export default PersonDetailsPage;