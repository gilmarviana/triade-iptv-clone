import React from 'react';
import './Header.css';
import OptimizedLogo from './OptimizedLogo';

const Header = () => (
  <header className="header">
    <div className="header__logo">
      <OptimizedLogo 
        className="header__logo-img" 
        alt="Logo Barato IPTV"
        width={40}
        height={45}
        priority={true}
      />
      <span className="header__logo-text">Logo Barato IPTV</span>
    </div>
    <nav className="header__nav">
      <a href="#inicio">Início</a>
      <a href="#planos">Planos</a>
      <a href="#listas">Listas</a>
      <a href="/conteudo.html">Conteúdo</a>
      <a href="#filmes-em-cartaz">Filmes em Cartaz</a>
      <a href="#faq">FAQ</a>
      <a href="#contato">Contato</a>
    </nav>
    <a href="https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!" className="header__teste-btn" target="_blank" rel="noopener noreferrer">Teste Agora</a>
  </header>
);

export default Header; 