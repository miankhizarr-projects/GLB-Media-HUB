import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { searchMulti } from '../services/tmdbService';
import type { Media } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';

// Dropdown Items
const movieItems = [
  { name: "Indian", path: "/browse/discover/IN", state: { mediaType: "movie", title: "Indian Movies" } },
  { name: "Pakistani", path: "/browse/discover/PK", state: { mediaType: "movie", title: "Pakistani Movies" } },
  { name: "Hollywood", path: "/browse/discover/US", state: { mediaType: "movie", title: "Hollywood Movies" } },
];
const dramaItems = [
  { name: "Indian", path: "/browse/discover/IN", state: { mediaType: "tv", title: "Indian Dramas" } },
  { name: "Pakistani", path: "/browse/discover/PK", state: { mediaType: "tv", title: "Pakistani Dramas" } },
  { name: "Korean", path: "/browse/discover/KR", state: { mediaType: "tv", title: "Korean Dramas" } },
  { name: "Turkish", path: "/browse/discover/TR", state: { mediaType: "tv", title: "Turkish Dramas" } },
];

// Main Nav Links
const navLinks = [
  { name: "Home", path: "/" },
  { name: "Top Rated", path: "/browse/list/top_rated", state: { mediaType: "movie", title: "Top Rated Movies" } },
  { name: "Upcoming", path: "/browse/list/upcoming", state: { mediaType: "movie", title: "Upcoming Movies" } },
  { name: "Anime", path: "/browse/discover/JP", state: { mediaType: "tv", discoverParams: { with_genres: '16' }, title: "Anime" } },
];

const SearchBar: React.FC<{ onSearch: () => void }> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Media[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      searchMulti(debouncedQuery).then(data => {
        const filteredSuggestions = data.results
          .filter(item => item.media_type !== 'person')
          .slice(0, 7); // Show up to 7 suggestions
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      }).catch(console.error);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      onSearch(); // Close mobile search bar after search
    }
  };

  const handleSuggestionClick = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    onSearch();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Search..."
          className="w-full sm:w-48 bg-brand-surface rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
          autoComplete="off"
        />
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xl text-brand-text-secondary"></i>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full sm:w-96 bg-brand-bg-light rounded-md shadow-lg z-20 overflow-hidden border border-brand-surface">
          <ul className="divide-y divide-brand-surface">
            {suggestions.map(media => {
              const title = media.title || media.name;
              const posterPath = media.poster_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z' /%3E%3C/svg%3E`;
              const mediaType = media.media_type === 'person' ? 'person' : (media.title ? 'movie' : 'tv');

              return (
                <li key={media.id}>
                  <Link
                    to={`/${mediaType}/${media.id}`}
                    onClick={handleSuggestionClick}
                    className="flex items-center p-2 hover:bg-brand-surface transition-colors"
                  >
                    <img
                      src={posterPath}
                      alt={title ?? 'Poster'}
                      className="w-10 h-14 object-cover rounded-sm mr-4 bg-brand-surface"
                    />
                    <span className="text-sm text-white font-medium line-clamp-2">{title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};


const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Close menus on route change
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  const activeLinkClass = 'text-brand-secondary';
  const inactiveLinkClass = 'text-brand-text hover:text-white';

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-lg md:text-base font-medium transition-colors whitespace-nowrap py-2 ${isActive ? activeLinkClass : inactiveLinkClass}`;
  
  const toggleMobileDropdown = (name: string) => {
    setOpenMobileDropdown(openMobileDropdown === name ? null : name);
  };

  return (
    <header className="bg-gradient-to-b from-brand-bg to-transparent sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {!isMobileSearchOpen && (
            <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white flex-shrink-0 mr-6">
              <i className="ri-film-fill text-3xl text-brand-secondary"></i>
              <span className="hidden sm:inline">Global Media Hub</span>
            </Link>
          )}

          {isMobileSearchOpen && (
            <div className="md:hidden w-full">
              <SearchBar onSearch={() => setIsMobileSearchOpen(false)} />
            </div>
          )}
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-5">
            {navLinks.map(link => (
              <NavLink key={link.name} to={link.path} state={link.state} className={getLinkClass}>{link.name}</NavLink>
            ))}
            {/* Movies Dropdown */}
            <div className="relative group">
              <button className={`${inactiveLinkClass} flex items-center gap-1 text-base font-medium`}>Movies <i className="ri-arrow-down-s-line"></i></button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-10">
                <div className="bg-brand-bg-light rounded-md shadow-lg">
                  {movieItems.map(item => <NavLink key={item.name} to={item.path} state={item.state} className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-surface hover:text-white w-full text-left">{item.name}</NavLink>)}
                </div>
              </div>
            </div>
            {/* Dramas Dropdown */}
             <div className="relative group">
              <button className={`${inactiveLinkClass} flex items-center gap-1 text-base font-medium`}>Dramas <i className="ri-arrow-down-s-line"></i></button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-10">
                <div className="bg-brand-bg-light rounded-md shadow-lg">
                    {dramaItems.map(item => <NavLink key={item.name} to={item.path} state={item.state} className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-surface hover:text-white w-full text-left">{item.name}</NavLink>)}
                </div>
              </div>
            </div>
             <SearchBar onSearch={() => {}} />
          </nav>
          
          {/* Mobile Toggles */}
          <div className="md:hidden flex items-center">
            {!isMenuOpen && <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className={`${inactiveLinkClass} mr-4`}><i className="ri-search-line text-2xl"></i></button>}
            {!isMobileSearchOpen && <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={inactiveLinkClass}><i className={`text-2xl ${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i></button>}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-brand-bg-light/95 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 flex flex-col items-start space-y-1 absolute w-full shadow-lg">
            {navLinks.map(link => <NavLink key={link.name} to={link.path} state={link.state} className={getLinkClass}>{link.name}</NavLink>)}
            {/* Mobile Movies Dropdown */}
            <div>
              <button onClick={() => toggleMobileDropdown('movies')} className={`${inactiveLinkClass} w-full flex justify-between items-center text-lg md:text-base font-medium py-2`}>Movies <i className={`ri-arrow-down-s-line text-xl transition-transform ${openMobileDropdown === 'movies' ? 'rotate-180' : ''}`}></i></button>
              {openMobileDropdown === 'movies' && <div className="pl-4 pb-2 flex flex-col items-start">{movieItems.map(item => <NavLink key={item.name} to={item.path} state={item.state} className={`${getLinkClass({isActive: false})} !text-base`}>{item.name}</NavLink>)}</div>}
            </div>
            {/* Mobile Dramas Dropdown */}
            <div>
              <button onClick={() => toggleMobileDropdown('dramas')} className={`${inactiveLinkClass} w-full flex justify-between items-center text-lg md:text-base font-medium py-2`}>Dramas <i className={`ri-arrow-down-s-line text-xl transition-transform ${openMobileDropdown === 'dramas' ? 'rotate-180' : ''}`}></i></button>
              {openMobileDropdown === 'dramas' && <div className="pl-4 pb-2 flex flex-col items-start">{dramaItems.map(item => <NavLink key={item.name} to={item.path} state={item.state} className={`${getLinkClass({isActive: false})} !text-base`}>{item.name}</NavLink>)}</div>}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;