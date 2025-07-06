import React, { useState } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://via.placeholder.com/300x450/666/fff?text=Imagem',
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    if (!imageError) {
      setImageSrc(fallbackSrc);
      setImageError(true);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      sizes={sizes}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage; 