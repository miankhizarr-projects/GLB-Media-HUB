
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-bg-light mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-brand-text-secondary">
        <p>&copy; {new Date().getFullYear()} Global Media Hub. All rights reserved.</p>
        <p className="mt-2 text-sm">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
