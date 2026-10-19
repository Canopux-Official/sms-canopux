import React, { useEffect } from 'react';
import './VideoModal.css';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="vm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="vm-header">
          <div className="vm-title-wrap">
            <span className="vm-badge">Live Platform Tour</span>
            <h3 className="vm-title">{title}</h3>
          </div>
          <button className="vm-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div className="vm-video-frame">
          <video
            src={videoUrl}
            autoPlay
            controls
            playsInline
            className="vm-video"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
