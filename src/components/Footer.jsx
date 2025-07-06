import React from 'react';
import './Footer.css';
import MovieCarousel from './MovieCarousel';

const Footer = () => (
  <footer className="footer">
    <MovieCarousel />
    <div className="footer-bottom">
      <p>Copyright 2023 Grupo GM Todos os Direitos Reservados.</p>
      <p>Barato IPTV - Assista de qualquer lugar o conteúdo mais atualizado do mercado!</p>
    </div>
  </footer>
);

export default Footer; 