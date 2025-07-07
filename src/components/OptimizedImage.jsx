import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/images/placeholder-poster.png',
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
    // Se vier só o caminho, monta a URL do TMDB
    if (originalSrc.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${originalSrc}`;
    }
    // Se já é uma URL do TMDB, apenas retorna
    if (originalSrc.includes('image.tmdb.org')) {
      return originalSrc;
    }
    return originalSrc;
  };

  // Função para gerar srcset responsivo
  const getSrcSet = (originalSrc) => {
    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('/images/placeholder-poster.png')) {
      return null;
    }
    if (originalSrc.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w300${originalSrc} 300w, https://image.tmdb.org/t/p/w500${originalSrc} 500w, https://image.tmdb.org/t/p/w780${originalSrc} 780w`;
    }
    if (originalSrc.includes('image.tmdb.org')) {
      // Extrair apenas o caminho após /t/p/ e garantir que só um tamanho seja usado
      const match = originalSrc.match(/\/t\/p\/(w\d+)(.+)/);
      if (match) {
        const path = match[2];
        return `https://image.tmdb.org/t/p/w300${path} 300w, https://image.tmdb.org/t/p/w500${path} 500w, https://image.tmdb.org/t/p/w780${path} 780w`;
      }
      // Se não bater, tenta pegar só o path
      const pathMatch = originalSrc.match(/\/t\/p\/(.+)/);
      if (pathMatch) {
        const path = pathMatch[1].replace(/^w\d+/, '');
        return `https://image.tmdb.org/t/p/w300/${path} 300w, https://image.tmdb.org/t/p/w500/${path} 500w, https://image.tmdb.org/t/p/w780/${path} 780w`;
      }
      return null;
    }
    return null;
  };

  const handleError = (e) => {
    if (!imageError) {
      console.warn('Erro ao carregar imagem:', imageSrc, 'src original:', src, e);
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