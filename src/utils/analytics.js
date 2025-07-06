// Utilitário para carregamento condicional de analytics
class AnalyticsManager {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadQueue = [];
  }

  // Carregar Google Analytics apenas quando necessário
  loadGoogleAnalytics() {
    if (this.isLoaded || this.isLoading) return Promise.resolve();
    
    this.isLoading = true;
    
    return new Promise((resolve) => {
      // Verificar se o usuário interagiu com a página
      const hasInteracted = this.hasUserInteracted();
      
      if (hasInteracted) {
        this.loadAnalyticsScript(resolve);
      } else {
        // Aguardar interação do usuário
        this.waitForInteraction(() => {
          this.loadAnalyticsScript(resolve);
        });
      }
    });
  }

  hasUserInteracted() {
    return (
      document.visibilityState === 'visible' &&
      (window.performance.now() > 5000 || // 5 segundos após carregamento
       document.hasFocus() ||
       navigator.userActivation.hasBeenActive)
    );
  }

  waitForInteraction(callback) {
    const events = ['click', 'scroll', 'keydown', 'touchstart'];
    const handler = () => {
      events.forEach(event => document.removeEventListener(event, handler));
      setTimeout(callback, 1000); // Delay adicional
    };
    
    events.forEach(event => document.addEventListener(event, handler, { once: true }));
    
    // Fallback: carregar após 10 segundos
    setTimeout(() => {
      events.forEach(event => document.removeEventListener(event, handler));
      callback();
    }, 10000);
  }

  loadAnalyticsScript(resolve) {
    if (typeof window === 'undefined' || window.gtag) {
      this.isLoaded = true;
      this.isLoading = false;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', {
        'page_title': 'IPTV Barato - A melhor lista IPTV do Brasil',
        'page_location': 'https://iptvbarato.site/',
        'send_page_view': false // Não enviar automaticamente
      });
      
      this.isLoaded = true;
      this.isLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      this.isLoading = false;
      resolve(); // Continuar mesmo se falhar
    };
    
    document.head.appendChild(script);
  }

  // Carregar Google Tag Manager apenas quando necessário
  loadGoogleTagManager() {
    if (typeof window === 'undefined' || window.dataLayer) return;
    
    // Carregar apenas após 5 segundos de inatividade
    setTimeout(() => {
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-XXXXXXXX');
    }, 5000);
  }

  // Enviar evento de página visualizada apenas quando necessário
  sendPageView() {
    if (window.gtag && this.isLoaded) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }
}

export const analyticsManager = new AnalyticsManager(); 