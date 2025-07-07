/**
 * Utilitário para otimização de CSS crítico e carregamento de recursos
 */

/**
 * Carrega CSS de forma não-bloqueante
 * @param {string} href - URL do CSS
 * @param {Object} options - Opções de carregamento
 */
export function loadCSS(href, options = {}) {
  const {
    id = null,
    media = 'all',
    onload = null,
    onerror = null
  } = options;

  // Verificar se já foi carregado
  if (id && document.getElementById(id)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = media;
  
  if (id) {
    link.id = id;
  }

  if (onload) {
    link.onload = onload;
  }

  if (onerror) {
    link.onerror = onerror;
  }

  document.head.appendChild(link);
}

/**
 * Carrega CSS crítico inline
 * @param {string} css - CSS crítico
 */
export function loadCriticalCSS(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Carrega CSS não-crítico de forma otimizada
 * @param {string} href - URL do CSS
 */
export function loadNonCriticalCSS(href) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = 'style';
  
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  
  document.head.appendChild(link);
}

/**
 * Otimiza o carregamento de fontes
 * @param {string} fontUrl - URL da fonte
 * @param {Object} options - Opções da fonte
 */
export function loadFont(fontUrl, options = {}) {
  const {
    family = 'Montserrat',
    weight = '400',
    display = 'swap'
  } = options;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = fontUrl;
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  
  document.head.appendChild(link);
}

/**
 * Carrega recursos críticos de forma otimizada
 */
export function loadCriticalResources() {
  // Preload de imagens críticas
  const criticalImages = [
    '/logo-iptv.png',
    '/logo512.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });

  // Preload de scripts críticos
  const criticalScripts = [
    '/static/js/main.js',
    '/static/js/vendors.js'
  ];

  criticalScripts.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'script';
    document.head.appendChild(link);
  });
}

/**
 * Otimiza o carregamento de recursos baseado na visibilidade
 */
export function optimizeResourceLoading() {
  // Intersection Observer para carregar recursos sob demanda
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Carregar recursos quando o elemento se torna visível
        const element = entry.target;
        if (element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  // Observar imagens lazy
  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
  });
}

/**
 * Inicializa otimizações de CSS crítico
 */
export function initCriticalCSSOptimizations() {
  // Carregar recursos críticos
  loadCriticalResources();
  
  // Otimizar carregamento de recursos
  optimizeResourceLoading();
  
  // Carregar CSS não-crítico após carregamento inicial
  setTimeout(() => {
    loadNonCriticalCSS('/static/css/main.css');
  }, 100);
} 