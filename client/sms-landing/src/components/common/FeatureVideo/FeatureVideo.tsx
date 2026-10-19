import React, { useRef, useState, useEffect } from 'react';
import './FeatureVideo.css';

export interface FeatureVideoProps {
  videoUrl?: string;
  posterUrl?: string;
  title: string;
  badge?: string;
  aspectRatio?: string;
  className?: string;
  autoPlay?: boolean;
}

export const FeatureVideo: React.FC<FeatureVideoProps> = ({
  videoUrl,
  posterUrl,
  title,
  badge,
  aspectRatio = '16 / 9',
  className = '',
  autoPlay = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (autoPlay && videoRef.current) {
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlay, videoUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const routeLabel = badge || `canopux.org/app/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div
      ref={containerRef}
      className={`feature-browser-mockup ${className}`}
      style={{ aspectRatio }}
      onClick={togglePlay}
      role="region"
      aria-label={`${title} interactive video preview`}
    >
      {/* Top macOS/browser title bar */}
      <div className="fbm-bar">
        <div className="fbm-controls">
          <span className="fbm-dot fbm-red" />
          <span className="fbm-dot fbm-yellow" />
          <span className="fbm-dot fbm-green" />
        </div>
        <div className="fbm-address">
          <svg className="fbm-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="fbm-url">{routeLabel}</span>
        </div>
        <div className="fbm-actions">
          <span className="fbm-action-dot" />
        </div>
      </div>

      {/* Screen container */}
      <div className="fbm-viewport">
        {/* Instant WebP Poster / Skeleton */}
        {posterUrl && (
          <img
            src={posterUrl}
            alt={title}
            className={`fbm-poster ${isLoaded ? 'hidden' : ''}`}
            loading="lazy"
          />
        )}

        {/* Video Element */}
        {videoUrl && isInView && (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            autoPlay={autoPlay}
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedData={() => setIsLoaded(true)}
            onPlaying={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className={`fbm-video ${isLoaded ? 'visible' : ''}`}
          />
        )}

        {/* Ambient Backlight Glow */}
        <div className="fbm-glow" />

        {/* Hover / Status Pill */}
        <div className={`fbm-overlay-pill ${isPlaying ? 'is-playing' : 'is-paused'}`}>
          <span className="fbm-pill-icon">{isPlaying ? '❚❚' : '▶'}</span>
          <span className="fbm-pill-text">{isPlaying ? 'Looping UI Demo' : 'Paused — Click to Play'}</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureVideo;
