// Configuração da API do TMDB (The Movie Database)
// Para usar a API real, você precisará de uma chave de API gratuita em: https://www.themoviedb.org/settings/api

const API_KEY = 'e764afcdb53bf0c30f6c688621da1703'; // Substitua pela sua chave de API
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Função para buscar filmes em lançamento
export const fetchNowPlaying = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&region=BR`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar filmes em lançamento:', error);
    return [];
  }
};

// Função para buscar filmes populares
export const fetchPopularMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar filmes populares:', error);
    return [];
  }
};

// Função para buscar séries populares
export const fetchPopularTVShows = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar séries populares:', error);
    return [];
  }
};

// Função para buscar próximos lançamentos
export const fetchUpcomingMovies = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=pt-BR&region=BR`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar próximos lançamentos:', error);
    return [];
  }
};

// Função para buscar detalhes de um filme específico
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
};

// Função para buscar detalhes de uma série específica
export const fetchTVShowDetails = async (tvId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar detalhes da série:', error);
    return null;
  }
};

// Função para buscar trailers
export const fetchMovieTrailers = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=pt-BR`
    );
    const data = await response.json();
    return data.results.filter(video => video.type === 'Trailer');
  } catch (error) {
    console.error('Erro ao buscar trailers:', error);
    return [];
  }
};

// Função para formatar dados do filme
export const formatMovieData = (movie) => {
  return {
    id: movie.id,
    title: movie.title || movie.name,
    original_title: movie.original_title || movie.original_name,
    overview: movie.overview,
    poster_path: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
    backdrop_path: movie.backdrop_path ? `${IMAGE_BASE_URL}/w1280${movie.backdrop_path}` : null,
    release_date: movie.release_date || movie.first_air_date,
    vote_average: movie.vote_average,
    genre_ids: movie.genre_ids,
    media_type: movie.media_type || 'movie'
  };
};

// Função para buscar gêneros
export const fetchGenres = async () => {
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`),
      fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=pt-BR`)
    ]);
    
    const movieData = await movieGenres.json();
    const tvData = await tvGenres.json();
    
    return {
      movies: movieData.genres,
      tv: tvData.genres
    };
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    return { movies: [], tv: [] };
  }
};

// Função para buscar filmes por gênero
export const fetchMoviesByGenre = async (genreId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}&sort_by=popularity.desc`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar filmes por gênero:', error);
    return [];
  }
};

// Função para buscar séries por gênero
export const fetchTVShowsByGenre = async (genreId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}&sort_by=popularity.desc`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erro ao buscar séries por gênero:', error);
    return [];
  }
};

// Função para buscar resultados de pesquisa
export const searchContent = async (query) => {
  try {
    const [movieResults, tvResults] = await Promise.all([
      fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`),
      fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`)
    ]);
    
    const movieData = await movieResults.json();
    const tvData = await tvResults.json();
    
    return {
      movies: movieData.results,
      tv: tvData.results
    };
  } catch (error) {
    console.error('Erro na pesquisa:', error);
    return { movies: [], tv: [] };
  }
};

export default {
  fetchNowPlaying,
  fetchPopularMovies,
  fetchPopularTVShows,
  fetchUpcomingMovies,
  fetchMovieDetails,
  fetchTVShowDetails,
  fetchMovieTrailers,
  formatMovieData,
  fetchGenres,
  fetchMoviesByGenre,
  fetchTVShowsByGenre,
  searchContent
}; 