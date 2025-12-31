import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string;
  videoTitle?: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, videoKey, videoTitle }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isFitToScreen, setIsFitToScreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      // Reset state when closed
      setIsFitToScreen(false);
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`relative bg-brand-bg-light rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isFitToScreen ? 'w-[95vw] max-w-none' : 'w-full max-w-4xl'
        }`}
      >
        <div className="absolute -top-3 -right-3 z-20 flex items-center gap-2">
           <a
            href={`https://www.youtube.com/watch?v=${videoKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-brand-surface rounded-full text-white hover:bg-brand-primary/80 transition-colors"
            aria-label="Open on YouTube"
            title="Open on YouTube"
          >
            <i className="ri-external-link-line text-2xl"></i>
          </a>
          <button
            onClick={() => setIsFitToScreen(!isFitToScreen)}
            className="p-2 bg-brand-surface rounded-full text-white hover:bg-brand-primary/80 transition-colors"
            aria-label={isFitToScreen ? 'Exit fit to screen' : 'Fit to screen'}
            title={isFitToScreen ? 'Exit fit to screen' : 'Fit to screen'}
          >
            <i className={isFitToScreen ? 'ri-fullscreen-exit-line text-2xl' : 'ri-fullscreen-line text-2xl'}></i>
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-brand-surface rounded-full text-white hover:bg-brand-primary/80 transition-colors"
            aria-label="Close video player"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div className="aspect-w-16 aspect-h-9 bg-black">
          <VideoPlayer videoKey={videoKey} />
        </div>
        {videoTitle && (
          <div className="px-4 py-3 bg-brand-surface">
            <h3 className="text-white text-base font-semibold truncate" title={videoTitle}>{videoTitle}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;