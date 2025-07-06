import React, { useState, useEffect, useRef } from 'react';
import './Listas.css';

const items = [
  {
    titulo: 'Canais de TV ⭐',
    texto: 'Todos canais ao vivo como: Telecine, HBO, Space, Megapix, BBB, etc. Canais de futebol como: Premier, Sportv, ESPN, etc. Painel de filmes e séries contendo todo conteúdo dos Streamings como: Netflix, Prime Video, HBO Max, Disney, etc.'
  },
  {
    titulo: 'Lista de Esportes ⚽',
    texto: 'Não perca mais nenhum jogo do seu time favorito, aqui você tem acesso à todos os canais de esportes, com a melhor lista IPTV premium de futebol ao vivo, incluindo o melhor dos canais de esporte.'
  },
  {
    titulo: 'Lista de Filme 🎥',
    texto: 'Se você prefere assistir os melhores filmes da atualidade, nós temos uma lista IPTV perfeita pra você. Tudo com os melhores canais de filmes sem travamentos e com qualidade premium.'
  },
  {
    titulo: 'Lista de Séries 🎥',
    texto: 'Se você prefere mesmo é acompanhar suas séries favoritas, nós temos uma lista IPTV perfeita pra você. Tudo com os melhores canais de séries sem travamentos e com qualidade premium.'
  },
  {
    titulo: 'Canais 24horas ⭐',
    texto: 'Se você gosta de assistir Filmes, Series, Desenhos, Animes em sequência temos a melhor lista pra você.'
  },
  {
    titulo: 'Qualidade HD, FHD, 4K⭐',
    texto: 'Nossa lista iptv possui o maior conteúdo com canais HD/FHD/4K do mercado, oferecendo uma experiência completa, sem travamentos, para todos os dispositivos.'
  },
];

function getClonedItems(arr, visibleCount) {
  // Clona os primeiros e últimos itens para efeito de loop
  const prefix = arr.slice(-visibleCount);
  const suffix = arr.slice(0, visibleCount);
  return [...prefix, ...arr, ...suffix];
}

const Listas = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const visibleCount = isMobile ? 1 : 3;
  const total = items.length;
  const clonedItems = getClonedItems(items, visibleCount);
  const [index, setIndex] = useState(visibleCount); // começa no primeiro item real
  const trackRef = useRef();
  const transitioning = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Quando muda o visibleCount (tela), reposiciona o index
  useEffect(() => {
    setIndex(visibleCount);
  }, [visibleCount]);

  const goTo = (i) => {
    if (transitioning.current) return;
    setIndex(i);
  };

  const prev = () => {
    if (transitioning.current) return;
    setIndex((i) => i - 1);
  };
  const next = () => {
    if (transitioning.current) return;
    setIndex((i) => i + 1);
  };

  // Efeito de loop: ao chegar nos clones, reseta sem animação
  useEffect(() => {
    if (!trackRef.current) return;
    transitioning.current = true;
    const handle = setTimeout(() => {
      transitioning.current = false;
      if (index === 0) {
        setIndex(total);
      } else if (index === total + visibleCount) {
        setIndex(visibleCount);
      }
    }, 510); // ligeiramente maior que o transition
    return () => clearTimeout(handle);
  }, [index, total, visibleCount]);

  const getTranslate = () => {
    return -(index * (100 / clonedItems.length));
  };

  // Dots: um para cada "página" real
  const dotCount = total;

  return (
    <section className="listas" id="listas">
      <h2>Principais Listas</h2>
      <div className="carousel carousel--multi">
        <button className="carousel__arrow left" onClick={prev} aria-label="Anterior">&#8592;</button>
        <div className="carousel__viewport">
          <div
            className="carousel__track"
            ref={trackRef}
            style={{
              width: `${(100 / visibleCount) * clonedItems.length}%`,
              transform: `translateX(${getTranslate()}%)`,
              transition: 'transform 0.5s cubic-bezier(0.4,0.2,0.2,1)'
            }}
          >
            {clonedItems.map((item, idx) => (
              <div
                className="carousel__item"
                key={idx + '-' + item.titulo}
                style={{ width: `${100 / clonedItems.length}%` }}
              >
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
        <button className="carousel__arrow right" onClick={next} aria-label="Próximo">&#8594;</button>
      </div>
      <div className="carousel__dots">
        {Array.from({ length: dotCount }).map((_, i) => (
          <span key={i} className={i === ((index - visibleCount + total) % total) ? 'active' : ''} onClick={() => goTo(i + visibleCount)}></span>
        ))}
      </div>
    </section>
  );
};

export default Listas; 