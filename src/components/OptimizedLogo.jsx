import React from 'react';

const OptimizedLogo = ({ 
  className = '', 
  alt = 'IPTV Barato Logo',
  width = 70,
  height = 78,
  priority = false 
}) => {
  // Determinar o tamanho base para seleção de imagem
  const getImageSize = () => {
    if (width <= 31) return 31;
    if (width <= 35) return 35;
    if (width <= 70) return 70;
    return 78;
  };

  const size = getImageSize();
  
  // Verificar suporte a WebP
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  const isWebPSupported = typeof window !== 'undefined' ? supportsWebP() : true;

  return (
    <picture>
      {/* WebP para navegadores que suportam */}
      {isWebPSupported && (
        <source
          srcSet={`/images/optimized/logo-iptv-${size}.webp`}
          type="image/webp"
        />
      )}
      
      {/* PNG como fallback */}
      <img
        src={`/images/optimized/logo-iptv-${size}.png`}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain'
        }}
      />
    </picture>
  );
};

export default OptimizedLogo; 