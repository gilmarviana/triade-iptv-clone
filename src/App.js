import React, { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Listas from './components/Listas';
import JogosDoDia from './components/JogosDoDia';
import MovieCarousel from './components/MovieCarousel';
import Planos from './components/Planos';
import FAQ from './components/FAQ';
import Contato from './components/Contato';
import Footer from './components/Footer';
import WhatsappFloat from './components/WhatsappFloat';

// Importar utilitários de performance
import { initAnalyticsOnInteraction } from './utils/scriptLoader';
import { initPerformanceMonitoring } from './utils/performance';
import { initWebVitals } from './utils/analytics';

function App() {
  useEffect(() => {
    // Inicializar monitoramento de performance
    initPerformanceMonitoring();
    
    // Inicializar Web Vitals
    initWebVitals();
    
    // Carregar analytics após interação do usuário
    initAnalyticsOnInteraction({
      gaTrackingId: 'G-XXXXXXXXXX', // Substitua pelo seu ID real
      gtmContainerId: 'GTM-XXXXXXXX', // Substitua pelo seu ID real
      delay: 1000,
      timeout: 15000
    });
    
    // Preload de recursos críticos
    const criticalResources = [
      { href: '/logo-iptv.png', as: 'image', type: 'image/png' },
      { href: '/static/css/main.css', as: 'style' },
      { href: '/static/js/main.js', as: 'script' }
    ];
    
    // Adicionar preload hints dinamicamente
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }
      document.head.appendChild(link);
    });
    
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
    
  }, []);

  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Listas />
        <JogosDoDia />
        <MovieCarousel />
        <Planos />
        <FAQ />
        <Contato />
      </main>
      <Footer />
      <WhatsappFloat />
    </div>
  );
}

export default App;
