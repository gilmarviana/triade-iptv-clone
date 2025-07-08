import React, { useEffect } from 'react';
import './NotFound.css';

const NotFound = () => {
  useEffect(() => {
    // Atualizar o título da página
    document.title = 'Página Não Encontrada - IPTV Barato | 404';
    
    // Prevenir cache da página 404
    if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
      window.location.reload();
    }
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query) {
        window.location.href = `/?search=${encodeURIComponent(query)}`;
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="not-found">
      <div className="not-found-container">
        <img src="/logo-iptv.png" alt="IPTV Barato" className="not-found-logo" />
        
        <div className="not-found-code">404</div>
        
        <h1 className="not-found-title">Página Não Encontrada</h1>
        
        <p className="not-found-message">
          Ops! A página que você está procurando não existe ou foi movida. 
          Não se preocupe, você ainda pode encontrar tudo o que precisa aqui!
        </p>
        
        <div className="not-found-search">
          <input 
            type="text" 
            className="not-found-search-input" 
            placeholder="O que você está procurando?" 
            onKeyPress={handleSearch}
            autoFocus
          />
        </div>
        
        <div className="not-found-buttons">
          <button 
            className="not-found-btn not-found-btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Voltar ao Início
          </button>
          <button 
            className="not-found-btn not-found-btn-secondary"
            onClick={() => scrollToSection('planos')}
          >
            Ver Planos
          </button>
        </div>
        
        <div className="not-found-popular">
          <h3>Páginas Populares</h3>
          <div className="not-found-links">
            <button 
              className="not-found-link-item"
              onClick={() => scrollToSection('planos')}
            >
              <h4>📺 Planos IPTV</h4>
              <p>A partir de R$10,00/mês</p>
            </button>
            
            <button 
              className="not-found-link-item"
              onClick={() => scrollToSection('teste-gratis')}
            >
              <h4>🎁 Teste Grátis</h4>
              <p>4 horas de teste gratuito</p>
            </button>
            
            <button 
              className="not-found-link-item"
              onClick={() => scrollToSection('filmes-em-cartaz')}
            >
              <h4>🎬 Filmes & Séries</h4>
              <p>Milhares de títulos</p>
            </button>
            
            <button 
              className="not-found-link-item"
              onClick={() => scrollToSection('jogos')}
            >
              <h4>⚽ Futebol ao Vivo</h4>
              <p>Todos os campeonatos</p>
            </button>
            
            <button 
              className="not-found-link-item"
              onClick={() => scrollToSection('faq')}
            >
              <h4>❓ Dúvidas</h4>
              <p>Perguntas frequentes</p>
            </button>
            
            <button 
              className="not-found-link-item"
              onClick={() => scrollToSection('contato')}
            >
              <h4>💬 Suporte</h4>
              <p>Atendimento 24h</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 