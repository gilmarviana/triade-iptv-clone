import React from 'react';
import './Hero.css';

const whatsappLink = "https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!";

const Hero = () => (
  <section className="hero" id="inicio">
    <h1>A Melhor lista de canais, filmes e séries.</h1>
    <p>Teste agora mesmo a melhor lista de canais, filmes e séries do Brasil, 12 horas 100% grátis</p>
    <a href={whatsappLink} className="hero__btn" target="_blank" rel="noopener noreferrer">Teste Agora</a>
    <div className="hero__promo">PROMOÇÃO IPTV Barato</div>
  </section>
);

export default Hero;