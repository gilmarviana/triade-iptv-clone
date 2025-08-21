/**
 * API Client para substituir localStorage
 * Gerencia dados do usuário, favoritos, histórico via banco de dados
 */

class DatabaseAPI {
  constructor() {
    this.baseURL = window.location.origin;
    this.sessionId = this.getSessionId();
  }

  // Gerenciar ID de sessão
  getSessionId() {
    let sessionId = localStorage.getItem('db_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('db_session_id', sessionId);
    }
    return sessionId;
  }

  // Fazer requisições com headers de sessão
  async makeRequest(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': this.sessionId,
        ...options.headers
      }
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    // Atualizar session ID se fornecido pelo servidor
    const newSessionId = response.headers.get('X-Session-Id');
    if (newSessionId && newSessionId !== this.sessionId) {
      this.sessionId = newSessionId;
      localStorage.setItem('db_session_id', newSessionId);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // APIs de Usuário
  async getUserProfile() {
    return this.makeRequest('/api/user/profile');
  }

  async updatePreferences(preferences) {
    return this.makeRequest('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences })
    });
  }

  // APIs de Favoritos
  async getFavorites() {
    return this.makeRequest('/api/user/favorites');
  }

  async addToFavorites(contentType, contentId) {
    return this.makeRequest('/api/user/favorites', {
      method: 'POST',
      body: JSON.stringify({ contentType, contentId })
    });
  }

  async removeFromFavorites(favoriteId) {
    return this.makeRequest(`/api/user/favorites/${favoriteId}`, {
      method: 'DELETE'
    });
  }

  // Verificar se um item está nos favoritos
  async isFavorite(contentType, contentId) {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => {
        if (contentType === 'channel') return fav.channelId === contentId;
        if (contentType === 'movie') return fav.movieId === contentId;
        if (contentType === 'series') return fav.seriesId === contentId;
        return false;
      });
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  }

  // APIs de Histórico
  async getWatchHistory(limit = 50) {
    return this.makeRequest(`/api/user/history?limit=${limit}`);
  }

  async addToHistory(contentType, contentId, duration, totalDuration, progress, lastPosition) {
    return this.makeRequest('/api/user/history', {
      method: 'POST',
      body: JSON.stringify({
        contentType,
        contentId,
        duration,
        totalDuration,
        progress,
        lastPosition
      })
    });
  }

  // APIs de Pesquisa
  async getSearchHistory() {
    return this.makeRequest('/api/user/search-history');
  }

  async addToSearchHistory(query, resultCount = 0) {
    return this.makeRequest('/api/user/search-history', {
      method: 'POST',
      body: JSON.stringify({ query, resultCount })
    });
  }

  // APIs de Conteúdo
  async getChannels(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/api/channels?${params}`);
  }

  async getMovies(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/api/movies?${params}`);
  }

  async getSeries(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.makeRequest(`/api/series?${params}`);
  }

  async getServers() {
    return this.makeRequest('/api/servers');
  }

  // Métodos de compatibilidade com localStorage
  // Para facilitar a migração de código existente

  async setItem(key, value) {
    const preferences = await this.getUserProfile().then(p => p.preferences).catch(() => ({}));
    preferences[key] = value;
    return this.updatePreferences(preferences);
  }

  async getItem(key, defaultValue = null) {
    try {
      const profile = await this.getUserProfile();
      return profile.preferences[key] ?? defaultValue;
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      return defaultValue;
    }
  }

  async removeItem(key) {
    const preferences = await this.getUserProfile().then(p => p.preferences).catch(() => ({}));
    delete preferences[key];
    return this.updatePreferences(preferences);
  }

  async clear() {
    return this.updatePreferences({});
  }

  // Métodos utilitários
  async savePlayerProgress(contentType, contentId, currentTime, duration) {
    const progress = duration > 0 ? currentTime / duration : 0;
    return this.addToHistory(contentType, contentId, currentTime, duration, progress, currentTime);
  }

  async getPlayerProgress(contentType, contentId) {
    try {
      const history = await this.getWatchHistory(1);
      const entry = history.find(h => {
        if (contentType === 'channel') return h.channelId === contentId;
        if (contentType === 'movie') return h.movieId === contentId;
        if (contentType === 'series') return h.seriesId === contentId;
        return false;
      });
      return entry ? entry.lastPosition || 0 : 0;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return 0;
    }
  }

  // Salvar configurações de qualidade preferida
  async saveQualityPreference(quality) {
    return this.setItem('preferredQuality', quality);
  }

  async getQualityPreference() {
    return this.getItem('preferredQuality', 'HD');
  }

  // Salvar último servidor usado
  async saveLastServer(serverId) {
    return this.setItem('lastServerId', serverId);
  }

  async getLastServer() {
    return this.getItem('lastServerId');
  }

  // Salvar configurações de volume
  async saveVolumeSettings(volume, muted = false) {
    return this.setItem('volumeSettings', { volume, muted });
  }

  async getVolumeSettings() {
    return this.getItem('volumeSettings', { volume: 1.0, muted: false });
  }

  // Salvar filtros de busca recentes
  async saveRecentFilters(filters) {
    const recent = await this.getItem('recentFilters', []);
    recent.unshift(filters);
    const unique = recent.filter((item, index, self) => 
      index === self.findIndex(t => JSON.stringify(t) === JSON.stringify(item))
    ).slice(0, 10); // Manter apenas os 10 mais recentes
    
    return this.setItem('recentFilters', unique);
  }

  async getRecentFilters() {
    return this.getItem('recentFilters', []);
  }
}

// Instância global da API
window.dbAPI = new DatabaseAPI();

// Compatibilidade com código existente que usa localStorage
window.dbStorage = {
  setItem: (key, value) => window.dbAPI.setItem(key, value),
  getItem: (key, defaultValue) => window.dbAPI.getItem(key, defaultValue),
  removeItem: (key) => window.dbAPI.removeItem(key),
  clear: () => window.dbAPI.clear()
};

console.log('✅ DatabaseAPI inicializada - localStorage substituído por banco de dados');
