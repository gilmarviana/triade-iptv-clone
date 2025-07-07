/**
 * Utilitário para otimização de imagens
 */

/**
 * Verifica se o navegador suporta WebP
 */
export function supportsWebP() {
  if (typeof window === 'undefined') return true;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Retorna a URL da imagem otimizada baseada no tamanho
 */
export function getOptimizedImageUrl(baseName, width, height) {
  const size = Math.max(width, height);
  const isWebPSupported = supportsWebP();
  
  if (isWebPSupported) {
    return `/images/optimized/${baseName}-${size}.webp`;
  }
  
  return `/images/optimized/${baseName}-${size}.png`;
}

/**
 * Cria um elemento picture com fallback
 */
export function createOptimizedPicture(baseName, width, height, className, alt) {
  const size = Math.max(width, height);
  const isWebPSupported = supportsWebP();
  
  return (
    <picture>
      {isWebPSupported && (
        <source
          srcSet={`/images/optimized/${baseName}-${size}.webp`}
          type="image/webp"
        />
      )}
      <img
        src={`/images/optimized/${baseName}-${size}.png`}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain'
        }}
      />
    </picture>
  );
}

/**
 * Otimiza todas as imagens na página
 */
export function optimizeAllImages() {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll('img[data-optimize]');
  
  images.forEach(img => {
    const baseName = img.dataset.baseName || 'logo-iptv';
    const width = parseInt(img.dataset.width) || 70;
    const height = parseInt(img.dataset.height) || 78;
    
    const optimizedUrl = getOptimizedImageUrl(baseName, width, height);
    img.src = optimizedUrl;
  });
} 