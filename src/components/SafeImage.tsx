import React, { useState } from 'react';
import { APP_CONFIG } from '@/config/app.config';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackSrc?: string;
}

/**
 * Composant Image avec fallback automatique
 * Utilise une image de secours si l'image principale ne charge pas
 */
const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc = APP_CONFIG.images.fallbackPlaceholder,
  ...props 
}) => {
  // Use fallback immediately if src is null, undefined, or empty string
  const initialSrc = src && src.trim() !== '' ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  // Update image source when prop changes
  React.useEffect(() => {
    const newSrc = src && src.trim() !== '' ? src : fallbackSrc;
    setImgSrc(newSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
};

export default SafeImage;
