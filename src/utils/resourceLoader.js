// Resource Loader for non-blocking resource loading
class ResourceLoader {
  constructor() {
    this.loadedResources = new Set();
    this.loadingPromises = new Map();
  }

  // Carregar CSS de forma não-bloqueante
  loadCSS(href, options = {}) {
    if (this.loadedResources.has(href)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(href)) {
      return this.loadingPromises.get(href);
    }

    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      if (options.media) {
        link.media = options.media;
      }
      
      link.onload = () => {
        this.loadedResources.add(href);
        this.loadingPromises.delete(href);
        resolve();
      };
      
      link.onerror = () => {
        this.loadingPromises.delete(href);
        reject(new Error(`Failed to load CSS: ${href}`));
      };
      
      document.head.appendChild(link);
    });

    this.loadingPromises.set(href, promise);
    return promise;
  }

  // Carregar JavaScript de forma não-bloqueante
  loadJS(src, options = {}) {
    if (this.loadedResources.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = options.async !== false;
      script.defer = options.defer || false;
      
      if (options.crossOrigin) {
        script.crossOrigin = options.crossOrigin;
      }
      
      script.onload = () => {
        this.loadedResources.add(src);
        this.loadingPromises.delete(src);
        resolve();
      };
      
      script.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load JS: ${src}`));
      };
      
      document.head.appendChild(script);
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Carregar fonte de forma não-bloqueante
  loadFont(fontFamily, options = {}) {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${options.weights?.join(';') || '400;500;600;700'}&display=swap`;
    
    return this.loadCSS(fontUrl, {
      media: 'print',
      onload: "this.media='all'"
    });
  }

  // Carregar recursos quando visíveis (Intersection Observer)
  loadWhenVisible(element, resourceUrl, resourceType = 'image') {
    return new Promise((resolve) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            
            if (resourceType === 'image') {
              entry.target.src = resourceUrl;
              entry.target.classList.remove('lazy');
            } else if (resourceType === 'css') {
              this.loadCSS(resourceUrl).then(resolve);
            } else if (resourceType === 'js') {
              this.loadJS(resourceUrl).then(resolve);
            }
            
            resolve();
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1
      });
      
      observer.observe(element);
    });
  }

  // Carregar recursos após interação do usuário
  loadAfterInteraction(resources, events = ['click', 'scroll', 'keydown', 'touchstart']) {
    return new Promise((resolve) => {
      let hasInteracted = false;
      
      const loadResources = () => {
        if (hasInteracted) return;
        hasInteracted = true;
        
        // Remover listeners
        events.forEach(event => document.removeEventListener(event, loadResources));
        
        // Carregar recursos
        Promise.all(resources.map(resource => {
          if (resource.type === 'css') {
            return this.loadCSS(resource.url);
          } else if (resource.type === 'js') {
            return this.loadJS(resource.url);
          }
        })).then(resolve);
      };
      
      // Adicionar listeners
      events.forEach(event => document.addEventListener(event, loadResources, { once: true }));
      
      // Fallback: carregar após 5 segundos
      setTimeout(loadResources, 5000);
    });
  }

  // Carregar recursos críticos imediatamente
  loadCritical(resources) {
    return Promise.all(resources.map(resource => {
      if (resource.type === 'css') {
        return this.loadCSS(resource.url);
      } else if (resource.type === 'js') {
        return this.loadJS(resource.url);
      }
    }));
  }

  // Preload de recursos
  preloadResource(href, as = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  // Carregar Google Fonts de forma otimizada
  loadGoogleFonts(fonts) {
    const fontPromises = fonts.map(font => 
      this.loadFont(font.family, { weights: font.weights })
    );
    
    return Promise.all(fontPromises);
  }

  // Carregar analytics de forma não-bloqueante
  loadAnalytics(analyticsConfig) {
    return this.loadAfterInteraction([
      { type: 'js', url: analyticsConfig.gtagUrl },
      { type: 'js', url: analyticsConfig.gtmUrl }
    ]);
  }
}

// Instância global
const resourceLoader = new ResourceLoader();

// Exportar funções utilitárias
export const loadCSS = (href, options) => resourceLoader.loadCSS(href, options);
export const loadJS = (src, options) => resourceLoader.loadJS(src, options);
export const loadFont = (fontFamily, options) => resourceLoader.loadFont(fontFamily, options);
export const loadWhenVisible = (element, url, type) => resourceLoader.loadWhenVisible(element, url, type);
export const loadAfterInteraction = (resources, events) => resourceLoader.loadAfterInteraction(resources, events);
export const loadCritical = (resources) => resourceLoader.loadCritical(resources);
export const preloadResource = (href, as) => resourceLoader.preloadResource(href, as);
export const loadGoogleFonts = (fonts) => resourceLoader.loadGoogleFonts(fonts);
export const loadAnalytics = (config) => resourceLoader.loadAnalytics(config);

export default resourceLoader; 