// Utilitário para otimizações de performance

// Debounce para evitar chamadas excessivas
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle para limitar a frequência de execução
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Intersection Observer para lazy loading
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Preload de recursos críticos
export function preloadResource(href, as = 'script') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

// Carregamento condicional de imagens
export function loadImageWhenVisible(imgElement, src) {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  observer.observe(imgElement);
}

// Otimização de scroll
export function optimizeScroll(callback) {
  let ticking = false;
  
  function update() {
    callback();
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }
  
  return requestTick;
}

// Cache de funções caras
export function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Carregamento progressivo de dados
export function progressiveLoad(items, batchSize = 10, delay = 100) {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;
    
    function loadBatch() {
      const batch = items.slice(index, index + batchSize);
      results.push(...batch);
      index += batchSize;
      
      if (index < items.length) {
        setTimeout(loadBatch, delay);
      } else {
        resolve(results);
      }
    }
    
    loadBatch();
  });
} 