// Font Loader for optimized Google Fonts loading
class FontLoader {
  constructor() {
    this.loadedFonts = new Set();
    this.fontDisplay = 'swap';
  }

  // Carregar fonte com display swap
  loadFont(fontFamily, weights = [400, 500, 600, 700, 900]) {
    const fontKey = `${fontFamily}-${weights.join('-')}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Criar link para fonte
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weights.join(';')}&display=${this.fontDisplay}`;
      
      // Adicionar ao head
      document.head.appendChild(link);
      
      // Marcar como carregada
      this.loadedFonts.add(fontKey);
      
      // Resolver após carregamento
      link.onload = resolve;
      link.onerror = reject;
    });
  }

  // Carregar fonte com preload
  preloadFont(fontFamily, weights = [400, 500, 600, 700, 900]) {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weights.join(';')}&display=${this.fontDisplay}`;
    
    // Preload da fonte
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'style';
    preloadLink.href = fontUrl;
    document.head.appendChild(preloadLink);
    
    // Carregar fonte
    return this.loadFont(fontFamily, weights);
  }

  // Carregar fonte com fallback
  loadFontWithFallback(fontFamily, weights = [400, 500, 600, 700, 900], fallback = 'Arial, sans-serif') {
    return this.loadFont(fontFamily, weights).then(() => {
      // Aplicar fonte com fallback
      document.documentElement.style.setProperty('--font-family', `'${fontFamily}', ${fallback}`);
    }).catch(() => {
      // Usar fallback se falhar
      document.documentElement.style.setProperty('--font-family', fallback);
    });
  }

  // Carregar fonte após interação
  loadFontAfterInteraction(fontFamily, weights = [400, 500, 600, 700, 900]) {
    return new Promise((resolve) => {
      const events = ['click', 'scroll', 'keydown', 'touchstart'];
      let hasInteracted = false;
      
      const loadFont = () => {
        if (hasInteracted) return;
        hasInteracted = true;
        
        // Remover listeners
        events.forEach(event => document.removeEventListener(event, loadFont));
        
        // Carregar fonte
        this.loadFont(fontFamily, weights).then(resolve);
      };
      
      // Adicionar listeners
      events.forEach(event => document.addEventListener(event, loadFont, { once: true }));
      
      // Fallback: carregar após 3 segundos
      setTimeout(loadFont, 3000);
    });
  }

  // Carregar fonte quando visível
  loadFontWhenVisible(fontFamily, weights = [400, 500, 600, 700, 900], element) {
    return new Promise((resolve) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            this.loadFont(fontFamily, weights).then(resolve);
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1
      });
      
      observer.observe(element);
    });
  }

  // Inicializar fontes críticas
  initCriticalFonts() {
    // Carregar Montserrat imediatamente (fonte crítica)
    return this.preloadFont('Montserrat', [400, 500, 600, 700, 900]);
  }

  // Inicializar fontes não-críticas
  initNonCriticalFonts() {
    // Carregar fontes adicionais após interação
    return this.loadFontAfterInteraction('Roboto', [300, 400, 500, 700]);
  }
}

// Instância global
const fontLoader = new FontLoader();

// Exportar funções utilitárias
export const loadFont = (fontFamily, weights) => fontLoader.loadFont(fontFamily, weights);
export const preloadFont = (fontFamily, weights) => fontLoader.preloadFont(fontFamily, weights);
export const loadFontWithFallback = (fontFamily, weights, fallback) => fontLoader.loadFontWithFallback(fontFamily, weights, fallback);
export const loadFontAfterInteraction = (fontFamily, weights) => fontLoader.loadFontAfterInteraction(fontFamily, weights);
export const loadFontWhenVisible = (fontFamily, weights, element) => fontLoader.loadFontWhenVisible(fontFamily, weights, element);
export const initCriticalFonts = () => fontLoader.initCriticalFonts();
export const initNonCriticalFonts = () => fontLoader.initNonCriticalFonts();

export default fontLoader; 