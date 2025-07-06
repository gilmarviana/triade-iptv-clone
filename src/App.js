import React, { Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Planos from './components/Planos';
import Listas from './components/Listas';
import './App.css';

// Lazy loading para componentes pesados
const JogosDoDia = lazy(() => import('./components/JogosDoDia'));
const FAQ = lazy(() => import('./components/FAQ'));
const Contato = lazy(() => import('./components/Contato'));
const Footer = lazy(() => import('./components/Footer'));
const WhatsappFloat = lazy(() => import('./components/WhatsappFloat'));

// Componente de loading
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '2rem',
    minHeight: '200px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #d68910',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
);

function App() {
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
