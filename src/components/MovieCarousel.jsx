import React, { useState, useEffect } from 'react';
import './MovieCarousel.css';
import OptimizedImage from './OptimizedImage';
import { 
  fetchNowPlaying, 
  fetchPopularMovies, 
  fetchPopularTVShows, 
  fetchUpcomingMovies,
  formatMovieData, 
  fetchMovieTrailers,
  fetchGenres,
  fetchMoviesByGenre,
  searchContent
} from '../services/imdbApi';

const MovieCarousel = () => {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [trailerLoading, setTrailerLoading] = useState(false);
  
  // Estados para categorias e filtros
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('main-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('all'); // 'all', 'movies', 'tv'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity', 'rating', 'date'

  useEffect(() => {
    fetchCategories();
    fetchContent();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      fetchContent();
    }
  }, [selectedCategory, contentType, sortBy]);

  const fetchCategories = async () => {
    try {
      const genres = await fetchGenres();
      // Categorias principais organizadas com id único
      const mainCategories = [
        { id: 'main-all', name: '🎬 Todos os Títulos', type: 'main', priority: 1 },
        { id: 'main-popular', name: '🔥 Mais Populares', type: 'main', priority: 2 },
        { id: 'main-now_playing', name: '🎭 Em Cartaz', type: 'main', priority: 3 },
        { id: 'main-upcoming', name: '📅 Próximos Lançamentos', type: 'main', priority: 4 }
      ];
      // Gêneros de filmes e séries com id único
      const movieGenres = genres.movies.map(genre => ({ ...genre, id: `movie-${genre.id}`, type: 'movie' }));
      const tvGenres = genres.tv.map(genre => ({ ...genre, id: `tv-${genre.id}`, type: 'tv' }));
      // Combinar todas as categorias e ordenar por prioridade
      const allCategories = [
        ...mainCategories,
        ...movieGenres,
        ...tvGenres
      ].sort((a, b) => a.priority - b.priority);
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      // Fallback com categorias básicas
      const fallbackCategories = [
        { id: 'main-all', name: '🎬 Todos os Títulos', type: 'main' },
        { id: 'main-popular', name: '🔥 Mais Populares', type: 'main' },
        { id: 'main-now_playing', name: '🎭 Em Cartaz', type: 'main' },
        { id: 'main-upcoming', name: '📅 Próximos Lançamentos', type: 'main' }
      ];
      setCategories(fallbackCategories);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      let results = [];

      if (selectedCategory === 'main-all') {
        if (contentType === 'all') {
          const [movies, tvShows] = await Promise.all([
            fetchPopularMovies(),
            fetchPopularTVShows()
          ]);
          results = [
            ...movies.map(m => ({ ...formatMovieData(m), _type: 'movie' })),
            ...tvShows.map(t => ({ ...formatMovieData(t), _type: 'tv' }))
          ];
        } else if (contentType === 'movies') {
          const movies = await fetchPopularMovies();
          results = movies.map(m => ({ ...formatMovieData(m), _type: 'movie' }));
        } else if (contentType === 'tv') {
          const tvShows = await fetchPopularTVShows();
          results = tvShows.map(t => ({ ...formatMovieData(t), _type: 'tv' }));
        }
      } else if (selectedCategory === 'main-now_playing') {
        const movies = await fetchNowPlaying();
        results = movies.map(m => ({ ...formatMovieData(m), _type: 'movie' }));
      } else if (selectedCategory === 'main-popular') {
        if (contentType === 'all') {
          const [movies, tvShows] = await Promise.all([
            fetchPopularMovies(),
            fetchPopularTVShows()
          ]);
          results = [
            ...movies.map(m => ({ ...formatMovieData(m), _type: 'movie' })),
            ...tvShows.map(t => ({ ...formatMovieData(t), _type: 'tv' }))
          ];
        } else if (contentType === 'movies') {
          const movies = await fetchPopularMovies();
          results = movies.map(m => ({ ...formatMovieData(m), _type: 'movie' }));
        } else if (contentType === 'tv') {
          const tvShows = await fetchPopularTVShows();
          results = tvShows.map(t => ({ ...formatMovieData(t), _type: 'tv' }));
        }
      } else if (selectedCategory === 'main-upcoming') {
        const movies = await fetchUpcomingMovies();
        results = movies.map(m => ({ ...formatMovieData(m), _type: 'movie' }));
      } else if (selectedCategory.startsWith('movie-')) {
        const genreResults = await fetchMoviesByGenre(selectedCategory.split('-')[1]);
        results = genreResults.map(m => ({ ...formatMovieData(m), _type: 'movie' }));
      } else if (selectedCategory.startsWith('tv-')) {
        const genreResults = await fetchMoviesByGenre(selectedCategory.split('-')[1]);
        results = genreResults.map(m => ({ ...formatMovieData(m), _type: 'tv' }));
      }

      // Aplicar ordenação
      results = sortResults(results, sortBy);
      
      setItems(results.slice(0, 50)); // Limita a 50 itens
      setCurrentIndex(0);
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchContent(searchQuery);
      let results = [];
      
      if (contentType === 'all') {
        results = [
          ...searchResults.movies.map(m => ({ ...formatMovieData(m), _type: 'movie' })),
          ...searchResults.tv.map(t => ({ ...formatMovieData(t), _type: 'tv' }))
        ];
      } else if (contentType === 'movies') {
        results = searchResults.movies.map(m => ({ ...formatMovieData(m), _type: 'movie' }));
      } else if (contentType === 'tv') {
        results = searchResults.tv.map(t => ({ ...formatMovieData(t), _type: 'tv' }));
      }

      results = sortResults(results, sortBy);
      setItems(results.slice(0, 50));
      setCurrentIndex(0);
    } catch (error) {
      console.error('Erro na pesquisa:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortResults = (results, sortType) => {
    switch (sortType) {
      case 'rating':
        return results.sort((a, b) => b.vote_average - a.vote_average);
      case 'date':
        return results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      case 'popularity':
      default:
        return results; // Já vem ordenado por popularidade da API
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Atualiza automaticamente a cada 8 segundos
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleTrailerClick = async () => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    setTrailerLoading(true);
    try {
      const trailers = await fetchMovieTrailers(currentItem.id);
      if (trailers && trailers.length > 0) {
        const trailer = trailers[0];
        const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}`;
        setTrailerUrl(youtubeUrl);
        setShowTrailer(true);
      } else {
        alert('Trailer não disponível para este título.');
      }
    } catch (error) {
      console.error('Erro ao buscar trailer:', error);
      alert('Erro ao carregar o trailer.');
    } finally {
      setTrailerLoading(false);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerUrl('');
  };

  const getContentTypeLabel = (type) => {
    return type === 'movie' ? '🎬 Filme' : '📺 Série';
  };

  const getPosterSrc = (item) => {
    const tmdbBase = 'https://image.tmdb.org/t/p/w500';
    if (!item?.poster_path || typeof item.poster_path !== 'string' || item.poster_path.trim() === '' || item.poster_path.includes('null')) {
      return '/images/placeholder-poster.png';
    }
    // Se vier só o caminho, monta a URL completa
    if (item.poster_path.startsWith('/')) {
      return `${tmdbBase}${item.poster_path}`;
    }
    return item.poster_path;
  };

  if (loading) {
    return (
      <div className="movie-carousel-loading">
        <div className="loading-spinner"></div>
        <p>Carregando conteúdo...</p>
      </div>
    );
  }

  const current = items[currentIndex];
  console.log('DEBUG poster_path:', current?.title, current?.poster_path);

  return (
    <>
      <div className="movie-carousel-container" id="filmes-em-cartaz">
        {/* Filtros e Busca */}
        <div className="movie-filters">
                  <div className="filters-header">
          <h2>🎬 Catálogo Completo de Filmes e Séries</h2>
          <p>Explore milhares de títulos em alta qualidade. Encontre seus filmes e séries favoritos no nosso IPTV premium!</p>
        </div>
          
          {/* Barra de Busca */}
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="🔍 Buscar filmes ou séries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                Buscar
              </button>
            </div>
          </form>

          {/* Filtros */}
          <div className="filters-controls">
            {/* Tipo de Conteúdo */}
            <div className="filter-group">
              <label htmlFor="content-type-select">Tipo:</label>
              <select 
                id="content-type-select"
                value={contentType} 
                onChange={(e) => setContentType(e.target.value)}
                className="filter-select"
                aria-label="Selecionar tipo de conteúdo"
              >
                <option value="all">Todos</option>
                <option value="movies">Apenas Filmes</option>
                <option value="tv">Apenas Séries</option>
              </select>
            </div>

            {/* Ordenação */}
            <div className="filter-group">
              <label htmlFor="sort-select">Ordenar por:</label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
                aria-label="Selecionar critério de ordenação"
              >
                <option value="popularity">Popularidade</option>
                <option value="rating">Avaliação</option>
                <option value="date">Data de Lançamento</option>
              </select>
            </div>
          </div>

          {/* Categorias */}
          <div className="categories-container">
            <div className="categories-scroll">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Resultados */}
          <div className="results-info">
            <p>
              {searchQuery ? `🔍 Resultados para "${searchQuery}": ` : ''}
              {items.length} {items.length === 1 ? 'título encontrado' : 'títulos encontrados'}
            </p>
          </div>
        </div>

        {/* Carrossel */}
        {items.length > 0 && (
          <div className="movie-carousel">
            <button className="carousel-btn prev-btn" onClick={prevSlide} aria-label="Filme anterior">
              ‹
            </button>
            <div className="carousel-slide">
              <div className="movie-card">
                <div className="movie-poster">
                  <OptimizedImage
                    src={getPosterSrc(current)}
                    alt={`Poster do ${current?._type === 'movie' ? 'filme' : 'seriado'} ${current?.title || 'Título'} - Avaliação ${current?.vote_average?.toFixed(1) || 'N/A'}`}
                    className="movie-poster-img"
                    width={300}
                    height={450}
                    priority={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="movie-overlay">
                    <div className="movie-rating">
                      ⭐ {current?.vote_average?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="movie-type">
                      {getContentTypeLabel(current?._type)}
                    </div>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{current?.title}</h3>
                  <p className="movie-original-title">{current?.original_title}</p>
                  <p className="movie-release-date">
                    📅 Lançamento: {current?.release_date ? new Date(current.release_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                  <p className="movie-overview">{current?.overview}</p>
                  <div className="movie-actions">
                    <a 
                      href={`https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!%0A%0A🎬%20Quero%20assistir:%20${encodeURIComponent(current?.title || 'Título')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="watch-btn"
                    >
                      🎥 Assistir Agora
                    </a>
                    <button 
                      className="trailer-btn" 
                      onClick={handleTrailerClick}
                      disabled={trailerLoading}
                      aria-label={trailerLoading ? 'Carregando trailer...' : `Ver trailer do ${current?._type === 'movie' ? 'filme' : 'seriado'} ${current?.title || 'Título'}`}
                    >
                      {trailerLoading ? '🔄 Carregando...' : '🎬 Ver Trailer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button className="carousel-btn next-btn" onClick={nextSlide} aria-label="Próximo filme">
              ›
            </button>
          </div>
        )}

        {/* Indicadores */}
        {items.length > 0 && (
          <div className="carousel-indicators">
            {items.slice(0, 20).map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir para o ${index + 1}º ${current?._type === 'movie' ? 'filme' : 'seriado'}`}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="movie-carousel-footer">
          <p>🎭 Assista todos esses títulos e muito mais no nosso IPTV!</p>
          <a
            href="https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!"
            target="_blank"
            rel="noopener noreferrer"
            className="carousel-whatsapp-btn"
          >
            📱 Solicitar Teste Grátis
          </a>
        </div>
      </div>

      {/* Modal do Trailer */}
      {showTrailer && (
        <div className="trailer-modal-overlay" onClick={closeTrailer}>
          <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={closeTrailer} aria-label="Fechar trailer">
              ✕
            </button>
            <div className="trailer-container">
              <iframe
                src={trailerUrl}
                title={`Trailer do ${current?._type === 'movie' ? 'filme' : 'seriado'} ${current?.title || 'Título'}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCarousel; 