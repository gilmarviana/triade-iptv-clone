/**
 * Utilitário para carregamento otimizado de scripts
 * Carrega scripts sob demanda para melhorar performance
 */

// Cache de scripts já carregados
const loadedScripts = new Set();

/**
 * Carrega um script de forma assíncrona
 * @param {string} src - URL do script
 * @param {Object} options - Opções de carregamento
 * @returns {Promise} Promise que resolve quando o script é carregado
 */
export function loadScript(src, options = {}) {
  const {
    async = true,
    defer = false,
    id = null,
    timeout = 10000
  } = options;

  // Verificar se já foi carregado
  if (id && loadedScripts.has(id)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    if (id) {
      script.id = id;
    }

    // Timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      reject(new Error(`Script load timeout: ${src}`));
    }, timeout);

    script.onload = () => {
      clearTimeout(timeoutId);
      if (id) {
        loadedScripts.add(id);
      }
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Carrega Google Analytics de forma otimizada
 * @param {string} trackingId - ID do Google Analytics
 * @returns {Promise} Promise que resolve quando o GA é carregado
 */
export function loadGoogleAnalytics(trackingId) {
  return loadScript(
    `https://www.googletagmanager.com/gtag/js?id=${trackingId}`,
    { id: 'google-analytics', async: true }
  ).then(() => {
    // Inicializar GA
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', trackingId, {
      'page_title': 'IPTV Barato - A melhor lista IPTV do Brasil',
      'page_location': window.location.href,
      'send_page_view': false
    });
  });
}

/**
 * Carrega Google Tag Manager de forma otimizada
 * @param {string} containerId - ID do container GTM (ex: GTM-5FJ948RV)
 * @returns {Promise} Promise que resolve quando o GTM é carregado
 */
export function loadGoogleTagManager(containerId) {
  return new Promise((resolve) => {
    // Verificar se já foi carregado
    if (document.getElementById('gtm-script')) {
      resolve();
      return;
    }

    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Função GTM com carregamento otimizado
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.defer=true;
      j.id='gtm-script';
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      
      // Adicionar timeout para evitar carregamento infinito
      const timeoutId = setTimeout(() => {
        console.warn('GTM load timeout');
        resolve();
      }, 5000);
      
      j.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      j.onerror = () => {
        clearTimeout(timeoutId);
        console.warn('GTM load failed');
        resolve();
      };
      
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',containerId);
  });
}

/**
 * Carrega analytics após interação do usuário
 * @param {Object} config - Configuração dos analytics
 */
export function initAnalyticsOnInteraction(config = {}) {
  const {
    gaTrackingId = null,
    gtmContainerId = null,
    delay = 2000, // Aumentado para 2 segundos
    timeout = 30000 // Aumentado para 30 segundos
  } = config;

  // Verificar se já foi inicializado
  if (window.analyticsInitialized) return;
  window.analyticsInitialized = true;

  let hasInteracted = false;
  const events = ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'];

  function loadAnalytics() {
    if (hasInteracted) return;
    hasInteracted = true;

    // Remover listeners
    events.forEach(event => {
      document.removeEventListener(event, loadAnalytics);
    });

    // Carregar analytics com delay maior para melhor performance
    setTimeout(async () => {
      try {
        if (gaTrackingId) {
          await loadGoogleAnalytics(gaTrackingId);
        }
        
        if (gtmContainerId) {
          setTimeout(() => {
            loadGoogleTagManager(gtmContainerId);
          }, 5000); // Aumentado para 5 segundos
        }
      } catch (error) {
        console.warn('Failed to load analytics:', error);
      }
    }, delay);
  }

  // Adicionar listeners para interação
  events.forEach(event => {
    document.addEventListener(event, loadAnalytics, { once: true });
  });

  // Fallback: carregar após timeout
  setTimeout(loadAnalytics, timeout);
}

/**
 * Carrega um recurso CSS de forma não-bloqueante
 * @param {string} href - URL do CSS
 * @param {Object} options - Opções de carregamento
 */
export function loadCSS(href, options = {}) {
  const {
    id = null,
    media = 'all',
    onload = null
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

  document.head.appendChild(link);
}

/**
 * Preload de recursos críticos
 * @param {Array} resources - Lista de recursos para preload
 */
export function preloadResources(resources = []) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as || 'fetch';
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin;
    }
    
    document.head.appendChild(link);
  });
}

export default {
  loadScript,
  loadGoogleAnalytics,
  loadGoogleTagManager,
  initAnalyticsOnInteraction,
  loadCSS,
  preloadResources
}; 