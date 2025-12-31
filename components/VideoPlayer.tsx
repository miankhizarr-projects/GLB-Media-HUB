
import React from 'react';

interface VideoPlayerProps {
  videoKey: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoKey }) => {
  return (
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        src={`https://www.youtube.com/embed/${videoKey}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
