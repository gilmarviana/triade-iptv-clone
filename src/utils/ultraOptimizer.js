/**
 * Utilitário para otimização ultra-agressiva do carregamento
 */

/**
 * Carrega recursos de forma ultra-otimizada
 */
export function ultraOptimizeLoading() {
  // Carregar CSS não-crítico de forma não-bloqueante
  function loadNonCriticalCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/css/main.css';
    link.media = 'print';
    link.onload = function() {
      this.media = 'all';
    };
    document.head.appendChild(link);
  }

  // Carregar fontes de forma não-bloqueante
  function loadFonts() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap';
    document.head.appendChild(link);
  }

  // Carregar recursos após renderização inicial
  setTimeout(() => {
    loadNonCriticalCSS();
    loadFonts();
  }, 50);
}

/**
 * Otimiza o carregamento de imagens
 */
export function optimizeImageLoading() {
  // Intersection Observer para lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  // Observar imagens lazy
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Otimiza o carregamento de componentes
 */
export function optimizeComponentLoading() {
  // Intersection Observer para componentes
  const componentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const component = entry.target;
        // Carregar recursos específicos do componente
        if (component.dataset.resources) {
          const resources = JSON.parse(component.dataset.resources);
          resources.forEach(resource => {
            if (resource.type === 'css') {
              loadCSS(resource.href);
            } else if (resource.type === 'js') {
              loadScript(resource.href);
            }
          });
        }
      }
    });
  }, {
    rootMargin: '100px'
  });

  // Observar componentes que precisam de recursos
  document.querySelectorAll('[data-resources]').forEach(component => {
    componentObserver.observe(component);
  });
}

/**
 * Carrega CSS de forma não-bloqueante
 */
function loadCSS(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Carrega script de forma não-bloqueante
 */
function loadScript(src) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Inicializa todas as otimizações
 */
export function initUltraOptimizations() {
  // Otimizar carregamento de recursos
  ultraOptimizeLoading();
  
  // Otimizar carregamento de imagens
  optimizeImageLoading();
  
  // Otimizar carregamento de componentes
  optimizeComponentLoading();
} 