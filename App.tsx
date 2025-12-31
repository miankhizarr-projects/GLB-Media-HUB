import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailsPage from './pages/DetailsPage';
import PersonDetailsPage from './pages/PersonDetailsPage';
import { FavoritesProvider } from './context/FavoritesContext';
import BrowsePage from './pages/BrowsePage';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Show the back button only if not on the homepage AND there's a history to go back to.
  // The initial location in a session has a key of 'default'.
  if (location.pathname === '/' || location.key === 'default') {
    return null;
  }

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-20 left-5 z-50 w-10 h-10 bg-brand-surface/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-surface transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
      aria-label="Go back"
      title="Go back"
    >
      <i className="ri-arrow-left-line text-2xl"></i>
    </button>
  );
};

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-5 right-5 z-50 w-10 h-10 bg-brand-surface/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-surface transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
      }`}
      aria-label="Go to top"
      title="Go to top"
    >
      <i className="ri-arrow-up-line text-2xl"></i>
    </button>
  );
};


const App: React.FC = () => {
  return (
    <FavoritesProvider>
      <div className="bg-brand-bg min-h-screen text-brand-text">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/:mediaType/:id" element={<DetailsPage />} />
            <Route path="/person/:id" element={<PersonDetailsPage />} />
            {/* Simplified browse routes */}
            <Route path="/browse/:type/:slug" element={<BrowsePage />} />
          </Routes>
        </main>
        <Footer />
        <BackButton />
        <ScrollToTopButton />
      </div>
    </FavoritesProvider>
  );
};

export default App;