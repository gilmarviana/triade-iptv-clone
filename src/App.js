import React, { Suspense, lazy, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Planos from './components/Planos';
import Listas from './components/Listas';
import { initPerformanceMonitoring } from './utils/performance';
import { loadAfterInteraction } from './utils/resourceLoader';
import { initCriticalFonts, initNonCriticalFonts } from './utils/fontLoader';
import './App.css';

// Lazy loading para componentes pesados com carregamento otimizado
const JogosDoDia = lazy(() => 
  import('./components/JogosDoDia').then(module => {
    // Carregar recursos não-críticos após interação
    loadAfterInteraction([
      { type: 'css', url: '/static/css/jogos.css' }
    ]);
    return module;
  })
);

const FAQ = lazy(() => 
  import('./components/FAQ').then(module => {
    // Carregar recursos não-críticos após interação
    loadAfterInteraction([
      { type: 'css', url: '/static/css/faq.css' }
    ]);
    return module;
  })
);

const Contato = lazy(() => 
  import('./components/Contato').then(module => {
    // Carregar recursos não-críticos após interação
    loadAfterInteraction([
      { type: 'css', url: '/static/css/contato.css' }
    ]);
    return module;
  })
);

const Footer = lazy(() => 
  import('./components/Footer').then(module => {
    // Carregar recursos não-críticos após interação
    loadAfterInteraction([
      { type: 'css', url: '/static/css/footer.css' }
    ]);
    return module;
  })
);

const WhatsappFloat = lazy(() => 
  import('./components/WhatsappFloat').then(module => {
    // Carregar recursos não-críticos após interação
    loadAfterInteraction([
      { type: 'css', url: '/static/css/whatsapp.css' }
    ]);
    return module;
  })
);

// Componente de loading otimizado
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '2rem',
    minHeight: '200px'
  }}>
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  // Initialize performance monitoring and font loading
  useEffect(() => {
    // Inicializar monitoramento de performance
    initPerformanceMonitoring();
    
    // Inicializar fontes críticas imediatamente
    initCriticalFonts();
    
    // Inicializar fontes não-críticas após interação
    initNonCriticalFonts();
    
    // Carregar recursos não-críticos após interação
    loadAfterInteraction([
      { type: 'js', url: '/static/js/analytics.js' },
      { type: 'js', url: '/static/js/tracking.js' }
    ]);
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <Planos />
      <Listas />
      
      <Suspense fallback={<LoadingSpinner />}>
        <JogosDoDia />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <FAQ />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Contato />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
      
      <Suspense fallback={null}>
        <WhatsappFloat />
      </Suspense>
    </>
  );
}

export default App;
