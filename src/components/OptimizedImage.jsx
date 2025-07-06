import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://via.placeholder.com/300x450/666/fff?text=Imagem',
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  width,
  height,
  priority = false,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Função para gerar URLs otimizadas
  const getOptimizedSrc = (originalSrc, format = 'webp') => {
    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('https://via.placeholder.com')) {
      return originalSrc;
    }
    
    // Para imagens do TMDB, usar tamanhos otimizados
    if (originalSrc.includes('image.tmdb.org')) {
      const baseUrl = originalSrc.split('/t/p/')[0];
      const path = originalSrc.split('/t/p/')[1];
      const size = width && width <= 300 ? 'w300' : 'w500';
      return `${baseUrl}/t/p/${size}${path}`;
    }
    
    return originalSrc;
  };

  // Função para gerar srcset responsivo
  const getSrcSet = (originalSrc) => {
    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('https://via.placeholder.com')) {
      return null;
    }
    
    if (originalSrc.includes('image.tmdb.org')) {
      const baseUrl = originalSrc.split('/t/p/')[0];
      const path = originalSrc.split('/t/p/')[1];
      return `${baseUrl}/t/p/w300${path} 300w, ${baseUrl}/t/p/w500${path} 500w, ${baseUrl}/t/p/w780${path} 780w`;
    }
    
    return null;
  };

  const handleError = () => {
    if (!imageError) {
      setImageSrc(fallbackSrc);
      setImageError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    setImageSrc(getOptimizedSrc(src));
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className || ''} ${isLoaded ? 'loaded' : 'loading'}`}
      loading={priority ? 'eager' : 'lazy'}
      sizes={sizes}
      srcSet={getSrcSet(src)}
      width={width}
      height={height}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default OptimizedImage; 