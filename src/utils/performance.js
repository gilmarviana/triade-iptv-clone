// Utilitário para otimizações de performance

// Performance utilities for IPTV Barato
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance monitoring
export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// Custom performance observer for image loading
export function observeImagePerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      });
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
}

// Resource timing analysis
export function analyzeResourceTiming() {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      console.warn('Slow resources detected:', slowResources);
    }
    
    return {
      totalResources: resources.length,
      slowResources: slowResources.length,
      averageLoadTime: resources.reduce((sum, resource) => sum + resource.duration, 0) / resources.length
    };
  }
  return null;
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

// Lazy loading para imagens
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

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    '/logo-iptv.png',
    '/static/css/main.css',
    '/static/js/main.js'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 
              resource.endsWith('.js') ? 'script' : 'image';
    document.head.appendChild(link);
  });
}

// Optimize font loading
export function optimizeFontLoading() {
  // Preload critical fonts
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    link.setAttribute('media', 'print');
    link.setAttribute('onload', "this.media='all'");
  });
}

// Debounce function for performance
export function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle function for performance
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
  };
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
}

// Network information
export function getNetworkInfo() {
  if ('connection' in navigator) {
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }
  return null;
}

// Performance budget monitoring
export function checkPerformanceBudget() {
  const budget = {
    fcp: 2000, // 2 seconds
    lcp: 4000, // 4 seconds
    fid: 100,  // 100ms
    cls: 0.1   // 0.1
  };
  
  return new Promise((resolve) => {
    getFCP((metric) => {
      const fcpPass = metric.value <= budget.fcp;
      console.log('FCP Budget Check:', fcpPass ? 'PASS' : 'FAIL', metric.value);
      
      getLCP((metric) => {
        const lcpPass = metric.value <= budget.lcp;
        console.log('LCP Budget Check:', lcpPass ? 'PASS' : 'FAIL', metric.value);
        
        getFID((metric) => {
          const fidPass = metric.value <= budget.fid;
          console.log('FID Budget Check:', fidPass ? 'PASS' : 'FAIL', metric.value);
          
          resolve({
            fcp: { passed: fcpPass, value: metric.value, budget: budget.fcp },
            lcp: { passed: lcpPass, value: metric.value, budget: budget.lcp },
            fid: { passed: fidPass, value: metric.value, budget: budget.fid }
          });
        });
      });
    });
  });
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  // Report web vitals
  reportWebVitals((metric) => {
    console.log('Web Vital:', metric.name, metric.value);
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'web_vital', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.value),
        non_interaction: true
      });
    }
  });
  
  // Observe image performance
  observeImagePerformance();
  
  // Analyze resource timing
  setTimeout(analyzeResourceTiming, 5000);
  
  // Check performance budget
  setTimeout(checkPerformanceBudget, 10000);
}

// Export default function for easy import
export default {
  reportWebVitals,
  observeImagePerformance,
  analyzeResourceTiming,
  createIntersectionObserver,
  loadImageWhenVisible,
  preloadCriticalResources,
  optimizeFontLoading,
  debounce,
  throttle,
  getMemoryUsage,
  getNetworkInfo,
  checkPerformanceBudget,
  initPerformanceMonitoring
}; 