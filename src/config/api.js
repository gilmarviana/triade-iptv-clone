// Configuração das APIs
// Substitua as chaves pelas suas próprias chaves de API

export const API_CONFIG = {
  // RapidAPI - API-Football
  // Obtenha sua chave em: https://rapidapi.com/api-sports/api/api-football
  RAPIDAPI_KEY: 'YOUR_RAPIDAPI_KEY_HERE',
  
  // TMDB API (para filmes)
  // Obtenha sua chave em: https://www.themoviedb.org/settings/api
  TMDB_API_KEY: 'e764afcdb53bf0c30f6c688621da1703',
  
  // URLs das APIs
  API_FOOTBALL_BASE_URL: 'https://api-football-v1.p.rapidapi.com/v3',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p'
};

// Função para obter headers da API-Football
export const getFootballHeaders = () => ({
  'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
});

// Função para obter URL da API-Football
export const getFootballUrl = (endpoint) => {
  return `${API_CONFIG.API_FOOTBALL_BASE_URL}${endpoint}`;
};

// Função para obter URL da TMDB
export const getTMDBUrl = (endpoint) => {
  return `${API_CONFIG.TMDB_BASE_URL}${endpoint}?api_key=${API_CONFIG.TMDB_API_KEY}&language=pt-BR`;
}; 