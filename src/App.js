import React, { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Listas from './components/Listas';


import Planos from './components/Planos';
import FAQ from './components/FAQ';
import Contato from './components/Contato';
import Footer from './components/Footer';
import WhatsappFloat from './components/WhatsappFloat';
import GTMLoader from './components/GTMLoader';

// Importar utilitários de performance
import { initAnalyticsOnInteraction } from './utils/scriptLoader';
import { initPerformanceMonitoring } from './utils/performance';
import { initUltraOptimizations } from './utils/ultraOptimizer';
import { optimizeAllImages } from './utils/imageOptimizer';

function App() {
  useEffect(() => {
    // Inicializar monitoramento de performance
    initPerformanceMonitoring();
    
    // Inicializar otimizações ultra-agressivas
    initUltraOptimizations();
    
    // Otimizar imagens
    optimizeAllImages();
    
    // Lazy load de componentes não críticos
    const loadNonCriticalComponents = () => {
      // Carregar componentes que não são visíveis imediatamente
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Componente se tornou visível, pode carregar recursos adicionais
            console.log('Componente visível:', entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      // Observar seções que podem ser carregadas sob demanda
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        observer.observe(section);
      });
    };
    
    // Carregar componentes não críticos após o carregamento inicial
    setTimeout(loadNonCriticalComponents, 2000);
    
    // Carregar analytics após interação do usuário
    initAnalyticsOnInteraction({
      gaTrackingId: 'G-349785401', // ID real do Google Analytics
      gtmContainerId: 'GTM-5FJ948RV', // ID real do GTM
      delay: 1000,
      timeout: 15000
    });
  }, []);

  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Listas />
        <Planos />
        <FAQ />
        <Contato />
      </main>
      <Footer />
      <WhatsappFloat />
      <GTMLoader />
    </div>
  );
}

export default App;
