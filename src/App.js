import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Planos from './components/Planos';
import Listas from './components/Listas';
import JogosDoDia from './components/JogosDoDia';
import FAQ from './components/FAQ';
import Contato from './components/Contato';
import Footer from './components/Footer';
import WhatsappFloat from './components/WhatsappFloat';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Planos />
      <Listas />
      <JogosDoDia />
      <FAQ />
      <Contato />
      <Footer />
      <WhatsappFloat />
    </>
  );
}

export default App;
