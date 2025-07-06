# Configuração da API do IMDB/TMDB

## 📋 Sobre a API

Este projeto usa a **API do TMDB (The Movie Database)** que é gratuita e fornece dados completos sobre filmes, séries, atores e muito mais.

## 🔑 Como obter sua chave de API

1. **Acesse:** https://www.themoviedb.org/
2. **Crie uma conta gratuita**
3. **Vá em:** Settings → API
4. **Clique em:** "Create" para gerar uma nova chave de API
5. **Copie a chave** (vai parecer algo como: `1234567890abcdef1234567890abcdef`)

## ⚙️ Configuração no projeto

1. **Abra o arquivo:** `src/services/imdbApi.js`
2. **Substitua a linha:**
   ```javascript
   const API_KEY = 'YOUR_TMDB_API_KEY';
   ```
   **Por:**
   ```javascript
   const API_KEY = 'SUA_CHAVE_AQUI';
   ```

## 🎬 Como usar a API real

### 1. Atualizar o componente MovieCarousel

Substitua a função `fetchMovies` no arquivo `src/components/MovieCarousel.jsx`:

```javascript
import { fetchNowPlaying, fetchPopularMovies, formatMovieData } from '../services/imdbApi';

const fetchMovies = async () => {
  try {
    // Buscar filmes em lançamento
    const nowPlaying = await fetchNowPlaying();
    const popular = await fetchPopularMovies();
    
    // Combinar e formatar os dados
    const allMovies = [...nowPlaying, ...popular]
      .slice(0, 10) // Limitar a 10 filmes
      .map(formatMovieData);
    
    setMovies(allMovies);
    setLoading(false);
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    setLoading(false);
  }
};
```

### 2. Exemplos de uso da API

```javascript
// Buscar filmes em lançamento
const nowPlaying = await fetchNowPlaying();

// Buscar filmes populares
const popular = await fetchPopularMovies();

// Buscar séries populares
const tvShows = await fetchPopularTVShows();

// Buscar próximos lançamentos
const upcoming = await fetchUpcomingMovies();

// Buscar detalhes de um filme específico
const movieDetails = await fetchMovieDetails(123);

// Buscar trailers de um filme
const trailers = await fetchMovieTrailers(123);

// Pesquisar conteúdo
const searchResults = await searchContent('Batman');
```

## 📊 Endpoints disponíveis

### Filmes
- `fetchNowPlaying()` - Filmes em cartaz
- `fetchPopularMovies()` - Filmes populares
- `fetchUpcomingMovies()` - Próximos lançamentos
- `fetchMovieDetails(id)` - Detalhes de um filme
- `fetchMovieTrailers(id)` - Trailers de um filme

### Séries
- `fetchPopularTVShows()` - Séries populares
- `fetchTVShowDetails(id)` - Detalhes de uma série

### Gêneros
- `fetchGenres()` - Lista de gêneros
- `fetchMoviesByGenre(genreId)` - Filmes por gênero
- `fetchTVShowsByGenre(genreId)` - Séries por gênero

### Pesquisa
- `searchContent(query)` - Pesquisar filmes e séries

## 🎨 Personalização

### Adicionar mais informações ao carrossel

```javascript
// No componente MovieCarousel, você pode adicionar:
const movieDetails = await fetchMovieDetails(movie.id);
const trailers = await fetchMovieTrailers(movie.id);

// E exibir:
- Duração do filme
- Diretor
- Elenco principal
- Trailer
- Avaliações dos usuários
```

### Criar seções diferentes

```javascript
// Seção de filmes em lançamento
const nowPlayingSection = await fetchNowPlaying();

// Seção de séries populares
const tvSection = await fetchPopularTVShows();

// Seção de próximos lançamentos
const upcomingSection = await fetchUpcomingMovies();
```

## 🔒 Limitações da API gratuita

- **Rate limit:** 40 requisições por 10 segundos
- **Dados:** Acesso completo a todos os dados
- **Imagens:** URLs das imagens incluídas
- **Idioma:** Suporte a múltiplos idiomas

## 🚀 Dicas de otimização

1. **Cache os dados** para evitar requisições desnecessárias
2. **Use lazy loading** para carregar imagens conforme necessário
3. **Implemente error handling** para falhas na API
4. **Considere usar React Query** para gerenciamento de estado da API

## 📱 Exemplo de implementação completa

```javascript
import React, { useState, useEffect } from 'react';
import { fetchNowPlaying, formatMovieData } from '../services/imdbApi';

const MovieCarousel = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const nowPlaying = await fetchNowPlaying();
        const formattedMovies = nowPlaying.map(formatMovieData);
        setMovies(formattedMovies);
      } catch (err) {
        setError('Erro ao carregar filmes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {movies.map(movie => (
        <div key={movie.id}>
          <img src={movie.poster_path} alt={movie.title} />
          <h3>{movie.title}</h3>
          <p>{movie.overview}</p>
        </div>
      ))}
    </div>
  );
};
```

## 🆘 Suporte

- **Documentação oficial:** https://developers.themoviedb.org/
- **Fórum da comunidade:** https://www.themoviedb.org/talk
- **Status da API:** https://status.themoviedb.org/

---

**Nota:** A API do TMDB é gratuita e não requer pagamento. Apenas certifique-se de seguir os termos de uso e rate limits. 