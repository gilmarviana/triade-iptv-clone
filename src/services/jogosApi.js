// Serviço para buscar dados de jogos usando API-Football do RapidAPI
// https://rapidapi.com/api-sports/api/api-football

const API_FOOTBALL_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';
const API_KEY = '4783667607msh49644e6d84da9b7p1899f2jsneecaba4eb3f8'; // Substitua pela sua chave do RapidAPI

// Headers para a API do RapidAPI
const getHeaders = () => ({
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
});

// Função para buscar jogos do dia
export const fetchJogosDoDia = async (data = null) => {
  const hoje = data || new Date().toISOString().split('T')[0];
  
  try {
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?date=${hoje}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    return formatJogos(responseData.response);
  } catch (error) {
    console.error('Erro ao buscar jogos do dia:', error);
    // Fallback para dados mockados
    return getMockJogos(hoje);
  }
};

// Função para buscar jogos ao vivo
export const fetchJogosAoVivo = async () => {
  try {
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?live=all`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    return formatJogos(responseData.response);
  } catch (error) {
    console.error('Erro ao buscar jogos ao vivo:', error);
    return [];
  }
};

// Função para buscar jogos por liga (melhorada)
export const fetchJogosPorLiga = async (leagueId, season = null) => {
  try {
    const temporada = season || getTemporadaCorreta(leagueId);
    console.log('Buscando jogos por liga:', leagueId, 'temporada:', temporada);
    
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${temporada}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Jogos da liga encontrados:', responseData.response?.length || 0);
    
    const jogosFormatados = formatJogos(responseData.response);
    
    // Ordenar por data decrescente (mais recentes primeiro)
    return jogosFormatados.sort((a, b) => new Date(b.data) - new Date(a.data));
  } catch (error) {
    console.error('Erro ao buscar jogos por liga:', error);
    return [];
  }
};

// Função para buscar jogos por time
export const fetchJogosPorTime = async (teamId, season = 2024) => {
  try {
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?team=${teamId}&season=${season}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    return formatJogos(responseData.response);
  } catch (error) {
    console.error('Erro ao buscar jogos por time:', error);
    return [];
  }
};

// Função para buscar ligas disponíveis
export const fetchLigasDisponiveis = async () => {
  try {
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/leagues`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.response.map(liga => ({
      id: liga.league.id,
      nome: liga.league.name,
      pais: liga.country.name,
      logo: liga.league.logo,
      bandeira: liga.country.flag
    }));
  } catch (error) {
    console.error('Erro ao buscar ligas:', error);
    return [];
  }
};

// Função para buscar times por liga
export const fetchTimesPorLiga = async (leagueId, season = 2024) => {
  try {
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/teams?league=${leagueId}&season=${season}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.response.map(time => ({
      id: time.team.id,
      nome: time.team.name,
      logo: time.team.logo,
      pais: time.team.country
    }));
  } catch (error) {
    console.error('Erro ao buscar times:', error);
    return [];
  }
};

// Função para buscar detalhes de um jogo específico
export const fetchDetalhesJogo = async (fixtureId) => {
  try {
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?id=${fixtureId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    return formatJogo(responseData.response[0]);
  } catch (error) {
    console.error('Erro ao buscar detalhes do jogo:', error);
    return null;
  }
};

// Função para formatar jogos da API
const formatJogos = (jogos) => {
  return jogos.map(jogo => formatJogo(jogo));
};

// Função para traduzir o período/status longo da API para português
const traduzirPeriodo = (periodo) => {
  if (!periodo) return '';
  const map = {
    'Not Started': 'Agendado',
    'First Half': 'Primeiro Tempo',
    'Halftime': 'Intervalo',
    'Second Half': 'Segundo Tempo',
    'Match Finished': 'Finalizado',
    'Extra Time': 'Prorrogação',
    'Penalty In Progress': 'Pênaltis',
    'Match Suspended': 'Suspenso',
    'Match Abandoned': 'Abandonado',
    'Match Postponed': 'Adiado',
    'Match Cancelled': 'Cancelado',
    'Match Interrupted': 'Interrompido',
    'Match Awarded': 'Vitória Técnica',
    'After Penalty': 'Finalizado (Pênaltis)',
    'Break Time': 'Intervalo',
    'To be defined': 'A definir',
    'Time to be defined': 'A definir',
    '': '',
  };
  return map[periodo] || periodo;
};

// Função para formatar um jogo individual
const formatJogo = (jogo) => {
  return {
    id: jogo.fixture.id,
    timeCasa: jogo.teams.home.name,
    timeVisitante: jogo.teams.away.name,
    logoCasa: jogo.teams.home.logo,
    logoVisitante: jogo.teams.away.logo,
    scoreCasa: jogo.goals.home,
    scoreVisitante: jogo.goals.away,
    horario: formatHorario(jogo.fixture.date),
    data: jogo.fixture.date.split('T')[0],
    status: getStatusJogo(jogo.fixture.status.short),
    campeonato: jogo.league.name,
    pais: jogo.league.country,
    logoCampeonato: jogo.league.logo,
    estadio: jogo.fixture.venue?.name || 'Não informado',
    cidade: jogo.fixture.venue?.city || 'Não informado',
    rodada: jogo.league.round,
    temporada: jogo.league.season,
    canal: getCanalFromLeague(jogo.league.name),
    minuto: jogo.fixture.status.elapsed,
    periodo: traduzirPeriodo(jogo.fixture.status.long)
  };
};

// Função para formatar horário
const formatHorario = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  } catch (error) {
    return 'TBD';
  }
};

// Função para determinar status do jogo
const getStatusJogo = (status) => {
  const statusMap = {
    'NS': 'Agendado',
    '1H': 'Primeiro Tempo',
    'HT': 'Intervalo',
    '2H': 'Segundo Tempo',
    'FT': 'Finalizado',
    'AET': 'Finalizado (Prorrogação)',
    'PEN': 'Finalizado (Pênaltis)',
    'BT': 'Intervalo',
    'SUSP': 'Suspenso',
    'INT': 'Interrompido',
    'PST': 'Adiado',
    'CANC': 'Cancelado',
    'ABD': 'Abandonado',
    'AWD': 'Vitória Técnica',
    'WO': 'Vitória Técnica',
    'LIVE': 'Ao Vivo'
  };
  
  return statusMap[status] || 'Agendado';
};

// Função para determinar canal baseado na liga
const getCanalFromLeague = (leagueName) => {
  const leagueNameLower = leagueName.toLowerCase();
  
  if (leagueNameLower.includes('brasileirão') || leagueNameLower.includes('brasileiro')) {
    return 'Globo/SporTV';
  } else if (leagueNameLower.includes('libertadores')) {
    return 'SporTV';
  } else if (leagueNameLower.includes('copa do brasil')) {
    return 'SporTV';
  } else if (leagueNameLower.includes('premier league')) {
    return 'ESPN';
  } else if (leagueNameLower.includes('champions league')) {
    return 'TNT Sports';
  } else if (leagueNameLower.includes('la liga')) {
    return 'ESPN';
  } else if (leagueNameLower.includes('bundesliga')) {
    return 'ESPN';
  } else if (leagueNameLower.includes('serie a')) {
    return 'ESPN';
  } else if (leagueNameLower.includes('ligue 1')) {
    return 'ESPN';
  } else if (leagueNameLower.includes('copa america')) {
    return 'Globo/SporTV';
  } else if (leagueNameLower.includes('world cup') || leagueNameLower.includes('copa do mundo')) {
    return 'Globo/SporTV';
  } else {
    return 'Verificar Programação';
  }
};

// Função para buscar todos os jogos (últimos 7 dias + próximos 30 dias)
export const fetchTodosJogos = async () => {
  try {
    const todosJogos = [];
    const hoje = new Date();
    
    // Busca jogos dos últimos 7 dias e próximos 30 dias
    for (let i = -7; i <= 30; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];
      
      try {
        const jogosDoDia = await fetchJogosDoDia(dataStr);
        todosJogos.push(...jogosDoDia);
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`Erro ao buscar jogos de ${dataStr}:`, error.message);
        continue;
      }
    }
    
    // Remove duplicatas baseado no ID do jogo
    const jogosUnicos = todosJogos.filter((jogo, index, self) => 
      index === self.findIndex(j => j.id === jogo.id)
    );
    
    return jogosUnicos;
  } catch (error) {
    console.error('Erro ao buscar todos os jogos:', error);
    throw error;
  }
};

// Função para buscar jogos por período
export const fetchJogosPorPeriodo = async (periodo) => {
  try {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    
    switch (periodo) {
      case 'hoje':
        return await fetchJogosDoDia(hojeStr);
      case 'amanha':
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);
        const amanhaStr = amanha.toISOString().split('T')[0];
        return await fetchJogosDoDia(amanhaStr);
      case 'semana':
        const jogosSemana = [];
        for (let i = 0; i < 7; i++) {
          const data = new Date(hoje);
          data.setDate(hoje.getDate() + i);
          const dataStr = data.toISOString().split('T')[0];
          const jogosDoDia = await fetchJogosDoDia(dataStr);
          jogosSemana.push(...jogosDoDia);
        }
        return jogosSemana;
      case 'ao-vivo':
        return await fetchJogosAoVivo();
      default:
        return await fetchTodosJogos();
    }
  } catch (error) {
    console.error('Erro ao buscar jogos por período:', error);
    throw error;
  }
};

// Função para buscar jogos por campeonato
export const fetchJogosPorCampeonato = async (leagueId) => {
  try {
    return await fetchJogosPorLiga(leagueId);
  } catch (error) {
    console.error('Erro ao buscar jogos por campeonato:', error);
    throw error;
  }
};

// Função para buscar canais disponíveis
export const fetchCanaisDisponiveis = async () => {
  try {
    const todosJogos = await fetchTodosJogos();
    const canais = new Set();
    
    todosJogos.forEach(jogo => canais.add(jogo.canal));
    
    return Array.from(canais);
  } catch (error) {
    console.error('Erro ao buscar canais:', error);
    throw error;
  }
};

// Função para buscar campeonatos disponíveis
export const fetchCampeonatosDisponiveis = async () => {
  try {
    return await fetchLigasDisponiveis();
  } catch (error) {
    console.error('Erro ao buscar campeonatos:', error);
    throw error;
  }
};

// Função de teste para liga específica
export const testLiga15 = async () => {
  console.log('=== TESTE LIGA 15 (Mundial de Clubes) ===');
  
  // Testar diferentes temporadas
  const temporadas = [2024, 2025, 2023];
  
  for (const season of temporadas) {
    console.log(`\n--- Testando temporada ${season} ---`);
    
    try {
      // Testar rodadas
      const rodadas = await fetchRodadasLiga('15', season);
      console.log(`Rodadas encontradas (${season}):`, rodadas.length);
      
      // Testar próximos jogos
      const proximosJogos = await fetchProximosJogosLiga('15', season);
      console.log(`Próximos jogos encontrados (${season}):`, proximosJogos.length);
      
      // Testar próximo jogo
      const proximoJogo = await fetchProximoJogoLiga('15', season);
      console.log(`Próximo jogo encontrado (${season}):`, proximoJogo ? 'SIM' : 'NÃO');
      
      if (proximoJogo) {
        console.log('Detalhes do próximo jogo:', proximoJogo);
      }
      
      // Se encontrou dados, usar esta temporada
      if (rodadas.length > 0 || proximosJogos.length > 0) {
        console.log(`✅ Temporada ${season} tem dados!`);
        return season;
      }
      
    } catch (error) {
      console.error(`Erro na temporada ${season}:`, error);
    }
  }
  
  console.log('❌ Nenhuma temporada encontrou dados');
  return 2024; // fallback
};

// Função para obter a temporada correta para cada liga
const getTemporadaCorreta = (leagueId) => {
  // Todas as ligas principais estão usando 2025 como temporada atual
  return 2025;
};

// Função para buscar rodadas de uma liga (melhorada)
export const fetchRodadasLiga = async (leagueId, season = null) => {
  try {
    const temporada = season || getTemporadaCorreta(leagueId);
    console.log('Buscando rodadas para liga:', leagueId, 'temporada:', temporada);
    
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures/rounds?league=${leagueId}&season=${temporada}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Resposta da API para rodadas:', responseData);
    
    // Verificar se a resposta tem dados
    if (!responseData.response || responseData.response.length === 0) {
      console.log('Nenhuma rodada encontrada para a liga:', leagueId);
      // Fallback: buscar jogos da liga e extrair rodadas
      const jogosLiga = await fetchJogosPorLiga(leagueId, temporada);
      const rodadasUnicas = [...new Set(jogosLiga.map(jogo => jogo.rodada).filter(Boolean))];
      console.log('Rodadas extraídas dos jogos:', rodadasUnicas);
      
      return rodadasUnicas.map((rodada, index) => ({
        id: rodada,
        nome: rodada,
        numero: index + 1
      }));
    }

    // Filtrar e formatar as rodadas
    const rodadas = responseData.response
      .filter(rodada => rodada && rodada.trim() !== '')
      .map((rodada, index) => ({
        id: rodada,
        nome: rodada,
        numero: index + 1
      }));

    console.log('Rodadas encontradas:', rodadas);
    return rodadas;
  } catch (error) {
    console.error('Erro ao buscar rodadas da liga:', error);
    // Fallback: criar rodadas básicas se a API falhar
    return Array.from({ length: 38 }, (_, i) => ({
      id: `Regular Season - ${i + 1}`,
      nome: `Rodada ${i + 1}`,
      numero: i + 1
    }));
  }
};

// Função para buscar próximos jogos de uma liga (melhorada)
export const fetchProximosJogosLiga = async (leagueId, season = null) => {
  try {
    const temporada = season || getTemporadaCorreta(leagueId);
    console.log('Buscando próximos jogos para liga:', leagueId, 'temporada:', temporada);
    
    const hoje = new Date().toISOString().split('T')[0];
    console.log('Data de hoje:', hoje);
    
    // Primeiro, tentar buscar jogos futuros com status FS
    let response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${temporada}&from=${hoje}&status=FS`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    let responseData = await response.json();
    console.log('Jogos FS encontrados:', responseData.response?.length || 0);
    
    let jogosFuturos = responseData.response || [];
    
    // Se não encontrou jogos FS, buscar todos os jogos futuros
    if (jogosFuturos.length === 0) {
      console.log('Nenhum jogo FS encontrado, buscando todos os jogos futuros...');
      
      response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${temporada}&from=${hoje}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      responseData = await response.json();
      console.log('Todos os jogos futuros encontrados:', responseData.response?.length || 0);
      
      jogosFuturos = responseData.response || [];
    }
    
    // Filtrar apenas jogos futuros
    const jogosFiltrados = jogosFuturos.filter(jogo => {
      const dataJogo = new Date(jogo.fixture.date);
      const agora = new Date();
      return dataJogo > agora;
    });
    
    console.log('Jogos futuros filtrados:', jogosFiltrados.length);
    
    return formatJogos(jogosFiltrados);
  } catch (error) {
    console.error('Erro ao buscar próximos jogos da liga:', error);
    return [];
  }
};

// Função para buscar o próximo jogo de uma liga (melhorada)
export const fetchProximoJogoLiga = async (leagueId, season = null) => {
  try {
    const temporada = season || getTemporadaCorreta(leagueId);
    console.log('Buscando próximo jogo para liga:', leagueId, 'temporada:', temporada);
    
    const hoje = new Date().toISOString().split('T')[0];
    console.log('Data de hoje:', hoje);
    
    // Primeiro, tentar buscar jogos futuros com status FS
    let response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${temporada}&from=${hoje}&status=FS`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    let responseData = await response.json();
    console.log('Jogos FS encontrados para próximo jogo:', responseData.response?.length || 0);
    
    let jogosFuturos = responseData.response || [];
    
    // Se não encontrou jogos FS, buscar todos os jogos futuros
    if (jogosFuturos.length === 0) {
      console.log('Nenhum jogo FS encontrado, buscando todos os jogos futuros...');
      
      response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${temporada}&from=${hoje}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      responseData = await response.json();
      console.log('Todos os jogos futuros encontrados para próximo jogo:', responseData.response?.length || 0);
      
      jogosFuturos = responseData.response || [];
    }
    
    // Filtrar apenas jogos futuros e ordenar por data
    const jogosFiltrados = jogosFuturos
      .filter(jogo => {
        const dataJogo = new Date(jogo.fixture.date);
        const agora = new Date();
        return dataJogo > agora;
      })
      .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
    
    console.log('Próximo jogo encontrado:', jogosFiltrados.length > 0 ? jogosFiltrados[0] : 'Nenhum');
    
    if (jogosFiltrados.length > 0) {
      // Retorna o próximo jogo (primeiro da lista ordenada por data)
      return formatJogo(jogosFiltrados[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar próximo jogo da liga:', error);
    return null;
  }
};

// Função para buscar jogos por rodada (melhorada)
export const fetchJogosPorRodada = async (leagueId, rodada, season = null) => {
  try {
    const temporada = season || getTemporadaCorreta(leagueId);
    console.log('Buscando jogos por rodada:', rodada, 'liga:', leagueId, 'temporada:', temporada);
    
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${temporada}&round=${rodada}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Jogos da rodada encontrados:', responseData.response?.length || 0);
    
    const jogosFormatados = formatJogos(responseData.response);
    
    // Ordenar por data decrescente (mais recentes primeiro)
    return jogosFormatados.sort((a, b) => new Date(b.data) - new Date(a.data));
  } catch (error) {
    console.error('Erro ao buscar jogos por rodada:', error);
    return [];
  }
};

// Função para buscar a rodada atual de uma liga (com jogos agendados ou ao vivo)
export const fetchRodadaAtualLiga = async (leagueId, season = null) => {
  try {
    const temporada = season || getTemporadaCorreta(leagueId);
    console.log('Buscando rodada atual para liga:', leagueId, 'temporada:', temporada);
    const hoje = new Date().toISOString().split('T')[0];
    // Buscar todos os jogos futuros (status NS ou LIVE)
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${temporada}&from=${hoje}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    const responseData = await response.json();
    const jogosFuturos = (responseData.response || []).filter(jogo => {
      const status = jogo.fixture.status.short;
      return status === 'NS' || status === 'LIVE' || status === '1H' || status === 'HT' || status === '2H';
    });
    // Agrupar por rodada e pegar a de menor número (ou a mais próxima do presente)
    if (jogosFuturos.length > 0) {
      // Agrupar por rodada
      const rodadasMap = {};
      jogosFuturos.forEach(jogo => {
        const rodada = jogo.league.round;
        if (!rodadasMap[rodada]) rodadasMap[rodada] = [];
        rodadasMap[rodada].push(jogo);
      });
      // Ordenar as rodadas por número extraído do nome (ex: 'Regular Season - 13' => 13)
      const rodadasOrdenadas = Object.keys(rodadasMap).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '999');
        const numB = parseInt(b.match(/\d+/)?.[0] || '999');
        return numA - numB;
      });
      const rodadaMaisProxima = rodadasOrdenadas[0];
      return {
        rodada: rodadaMaisProxima,
        jogos: formatJogos(rodadasMap[rodadaMaisProxima])
      };
    }
    // Se não encontrou jogos relevantes, buscar a próxima rodada da lista
    const rodadas = await fetchRodadasLiga(leagueId, temporada);
    if (rodadas.length > 0) {
      return {
        rodada: rodadas[0].id,
        jogos: []
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar rodada atual da liga:', error);
    return null;
  }
};

// Dados mockados como fallback
const getMockJogos = (date) => {
  const mockJogos = {
    [new Date().toISOString().split('T')[0]]: [
      {
        id: 1,
        timeCasa: 'Flamengo',
        timeVisitante: 'Palmeiras',
        horario: '16:00',
        campeonato: 'Brasileirão Série A',
        canal: 'Globo',
        status: 'Agendado',
        logoCasa: 'https://via.placeholder.com/40x40/ff0000/ffffff?text=FLA',
        logoVisitante: 'https://via.placeholder.com/40x40/00ff00/ffffff?text=PAL',
        scoreCasa: '',
        scoreVisitante: '',
        data: date
      }
    ]
  };
  
  return mockJogos[date] || [];
};

export default {
  fetchJogosDoDia,
  fetchJogosAoVivo,
  fetchJogosPorLiga,
  fetchJogosPorTime,
  fetchLigasDisponiveis,
  fetchTimesPorLiga,
  fetchDetalhesJogo,
  fetchTodosJogos,
  fetchJogosPorPeriodo,
  fetchJogosPorCampeonato,
  fetchCanaisDisponiveis,
  fetchCampeonatosDisponiveis,
  fetchRodadasLiga,
  fetchJogosPorRodada,
  fetchProximoJogoLiga,
  fetchProximosJogosLiga,
  testLiga15,
  fetchRodadaAtualLiga
}; 