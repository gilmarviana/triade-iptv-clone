import React, { useState, useEffect } from 'react';
import { 
  fetchJogosDoDia, 
  fetchJogosPorLiga, 
  fetchJogosPorRodada, 
  fetchProximosJogosLiga, 
  fetchProximoJogoLiga,
  fetchRodadasLiga as fetchRodadasLigaAPI,
  fetchRodadaAtualLiga
} from '../services/jogosApi';
import './JogosDoDia.css';

const JogosDoDia = () => {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLeague, setSelectedLeague] = useState('hoje'); // 'hoje', 'ao-vivo', ou ID da liga
  const [sortBy, setSortBy] = useState('horario'); // 'data', 'horario', 'campeonato'
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jogosPerPage] = useState(6);
  const [filterByLeague, setFilterByLeague] = useState('todos'); // Filtro para jogos de hoje/ao vivo
  const [selectedRound, setSelectedRound] = useState('todos'); // 'proximos', 'data', 'rodada', 'todos'
  const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [proximoJogo, setProximoJogo] = useState(null);
  const [rodadas, setRodadas] = useState([]);
  const [selectedRodada, setSelectedRodada] = useState('');
  const [loadingRodadas, setLoadingRodadas] = useState(false);

  // Lista dos principais campeonatos brasileiros e internacionais
  const principaisLigas = [
    { id: 'hoje', nome: '🎯 Jogos de Hoje', pais: 'Brasil' },
    { id: 'ao-vivo', nome: '🔴 Jogos Ao Vivo', pais: 'América do Sul' },
    { id: '71', nome: '🇧🇷 Brasileirão Série A', pais: 'Brasil' },
    { id: '72', nome: '🇧🇷 Brasileirão Série B', pais: 'Brasil' },
    { id: '73', nome: '🇧🇷 Copa do Brasil', pais: 'Brasil' },
    { id: '13', nome: '🏆 Libertadores', pais: 'América do Sul' },
    { id: '14', nome: '🏆 Sul-Americana', pais: 'América do Sul' },
    { id: '15', nome: '🌍 Mundial de Clubes FIFA', pais: 'Mundial' },
    { id: '39', nome: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', pais: 'Inglaterra' },
    { id: '140', nome: '🇪🇸 La Liga', pais: 'Espanha' },
    { id: '78', nome: '🇩🇪 Bundesliga', pais: 'Alemanha' },
    { id: '135', nome: '🇮🇹 Serie A', pais: 'Itália' },
    { id: '61', nome: '🇫🇷 Ligue 1', pais: 'França' },
    { id: '2', nome: '🏆 Champions League', pais: 'Europa' },
    { id: '3', nome: '🏆 Europa League', pais: 'Europa' }
  ];

  // Lista de campeonatos para filtro (sem 'hoje' e 'ao-vivo')
  const ligasParaFiltro = principaisLigas.filter(liga => liga.id !== 'hoje' && liga.id !== 'ao-vivo');

  useEffect(() => {
    fetchJogos();
    setCurrentPage(1); // Reset para primeira página quando mudar filtros
  }, [selectedDate, selectedLeague, sortBy, filterByLeague, selectedRound, roundDate, selectedRodada]);

  // Buscar jogos automaticamente quando selecionar uma rodada
  useEffect(() => {
    if (selectedRound === 'rodada' && selectedRodada && selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo') {
      console.log('Rodada selecionada:', selectedRodada);
      fetchJogos();
    }
  }, [selectedRodada, selectedRound]);

  // Buscar próximo jogo e rodadas quando selecionar um campeonato específico
  useEffect(() => {
    if (selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo') {
      console.log('Campeonato selecionado:', selectedLeague);
      
      // Buscar rodadas e rodada atual automaticamente
      fetchRodadasLiga();
      
      // Buscar próximo jogo
      fetchProximoJogo();
    } else {
      setProximoJogo(null);
      setRodadas([]);
      setSelectedRodada('');
      setSelectedRound('proximos');
    }
  }, [selectedLeague]);

  // Auto-refresh para jogos ao vivo
  useEffect(() => {
    let interval;
    if (autoRefresh && selectedLeague === 'ao-vivo') {
      interval = setInterval(() => {
        fetchJogos();
      }, 30000); // Atualiza a cada 30 segundos
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedLeague]);

  const fetchProximoJogo = async () => {
    try {
      console.log('=== BUSCANDO PRÓXIMO JOGO ===');
      console.log('Liga selecionada:', selectedLeague);
      
      const proximo = await fetchProximoJogoLiga(selectedLeague);
      console.log('Próximo jogo encontrado:', proximo);
      setProximoJogo(proximo);
    } catch (error) {
      console.error('Erro ao buscar próximo jogo:', error);
      setProximoJogo(null);
    }
  };

  const fetchRodadasLiga = async () => {
    setLoadingRodadas(true);
    try {
      console.log('=== BUSCANDO RODADAS ===');
      console.log('Liga selecionada:', selectedLeague);
      
      // Primeiro, buscar a rodada atual com jogos relevantes
      const rodadaAtual = await fetchRodadaAtualLiga(selectedLeague);
      console.log('Rodada atual encontrada:', rodadaAtual);
      
      // Buscar todas as rodadas disponíveis
      const rodadasData = await fetchRodadasLigaAPI(selectedLeague);
      console.log('Rodadas carregadas:', rodadasData);
      
      if (rodadasData && rodadasData.length > 0) {
        setRodadas(rodadasData);
        
        // Se encontrou uma rodada atual com jogos, selecionar ela
        if (rodadaAtual && rodadaAtual.rodada) {
          setSelectedRodada(rodadaAtual.rodada);
          console.log('Rodada atual selecionada:', rodadaAtual.rodada);
          
          // Se há jogos na rodada atual, exibir eles
          if (rodadaAtual.jogos && rodadaAtual.jogos.length > 0) {
            console.log('Jogos da rodada atual:', rodadaAtual.jogos.length);
            setJogos(rodadaAtual.jogos);
            setSelectedRound('rodada');
            setCurrentPage(1);
          }
        } else {
          // Se não encontrou rodada atual, selecionar a primeira
          setSelectedRodada(rodadasData[0].id);
          console.log('Primeira rodada selecionada:', rodadasData[0].id);
        }
        
        console.log('Total de rodadas:', rodadasData.length);
      } else {
        console.log('Nenhuma rodada encontrada');
        setRodadas([]);
        setSelectedRodada('');
      }
    } catch (error) {
      console.error('Erro ao buscar rodadas:', error);
      setRodadas([]);
      setSelectedRodada('');
    } finally {
      setLoadingRodadas(false);
    }
  };

  const fetchJogos = async () => {
    if (!selectedLeague) return;
    
    setLoading(true);
    try {
      let jogosData = [];
      
      if (selectedRound === 'proximos') {
        // Buscar próximos jogos da liga (status FS)
        jogosData = await fetchProximosJogosLiga(selectedLeague);
      } else if (selectedRound === 'data') {
        // Buscar jogos por data específica
        jogosData = await fetchJogosDoDia(roundDate);
      } else if (selectedRound === 'rodada' && selectedRodada) {
        // Buscar jogos por rodada específica
        jogosData = await fetchJogosPorRodada(selectedLeague, selectedRodada);
      } else {
        // Buscar todos os jogos da liga
        jogosData = await fetchJogosPorLiga(selectedLeague);
      }
      setAutoRefresh(false);
      
      // Ordenar por data decrescente (mais recentes primeiro)
      const jogosOrdenados = jogosData.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      setJogos(jogosOrdenados);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      setJogos([]);
    } finally {
      setLoading(false);
    }
  };

  const sortJogos = (jogos, sortType) => {
    switch (sortType) {
      case 'data':
        return jogos.sort((a, b) => new Date(a.data) - new Date(b.data));
      case 'horario':
        return jogos.sort((a, b) => a.horario.localeCompare(b.horario));
      case 'campeonato':
        return jogos.sort((a, b) => a.campeonato.localeCompare(b.campeonato));
      default:
        return jogos;
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleRoundDateChange = (e) => {
    setRoundDate(e.target.value);
  };

  const handleRodadaChange = (e) => {
    setSelectedRodada(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Agendado':
        return '#ffb300';
      case 'Primeiro Tempo':
      case 'Segundo Tempo':
      case 'Ao Vivo':
        return '#ff4444';
      case 'Intervalo':
        return '#ff8800';
      case 'Finalizado':
        return '#00aa00';
      default:
        return '#666666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const getSelectedLeagueName = () => {
    const league = principaisLigas.find(l => l.id === selectedLeague);
    return league ? league.nome : 'Selecionar Campeonato';
  };

  const truncateTeamName = (name, max = 12) => {
    if (!name) return '';
    return name.length > max ? name.slice(0, max - 1) + '…' : name;
  };

  // Lógica de paginação
  const indexOfLastJogo = currentPage * jogosPerPage;
  const indexOfFirstJogo = indexOfLastJogo - jogosPerPage;
  const currentJogos = jogos.slice(indexOfFirstJogo, indexOfLastJogo);
  const totalPages = Math.ceil(jogos.length / jogosPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="jogos-loading">
        <div className="loading-spinner"></div>
        <p>
          {selectedLeague === 'ao-vivo' 
            ? 'Carregando jogos ao vivo...' 
            : 'Carregando jogos...'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="jogos-container" id="jogos">
      <div className="jogos-header">
        <h2>⚽ Jogos de Futebol</h2>
        <p>Confira os principais campeonatos com placares em tempo real</p>
      </div>

      <div className="jogos-controls">
        <div className="league-selector">
          <label htmlFor="league-select">Campeonato:</label>
          <select 
            id="league-select"
            value={selectedLeague} 
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="league-select"
            aria-label="Selecionar campeonato"
          >
            {principaisLigas.map(liga => (
              <option key={liga.id} value={liga.id}>
                {liga.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por campeonato para jogos de hoje/ao vivo */}
        {(selectedLeague === 'hoje' || selectedLeague === 'ao-vivo') && (
          <div className="filter-selector">
            <label htmlFor="filter-select">Filtrar por:</label>
            <select 
              id="filter-select"
              value={filterByLeague} 
              onChange={(e) => setFilterByLeague(e.target.value)}
              className="filter-select"
              aria-label="Filtrar por campeonato"
            >
              <option value="todos">Todos os Campeonatos</option>
              {ligasParaFiltro.map(liga => (
                <option key={liga.id} value={liga.id}>
                  {liga.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por rodada/data para campeonatos específicos */}
        {selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && (
          <div className="round-selector">
            <label htmlFor="round-select">Período:</label>
            <select 
              id="round-select"
              value={selectedRound} 
              onChange={(e) => setSelectedRound(e.target.value)}
              className="round-select"
              aria-label="Selecionar período"
            >
              <option value="proximos">Próximos Jogos (FS)</option>
              <option value="rodada">Por Rodada</option>
              <option value="data">Por Data</option>
              <option value="todos">Todos os Jogos</option>
            </select>
          </div>
        )}

        {/* Seletor de rodada */}
        {selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && selectedRound === 'rodada' && (
          <div className="rodada-selector">
            <label htmlFor="rodada-select">Rodada:</label>
            <select 
              id="rodada-select"
              value={selectedRodada} 
              onChange={handleRodadaChange}
              className="rodada-select"
              disabled={loadingRodadas}
              aria-label="Selecionar rodada"
            >
              {loadingRodadas ? (
                <option>Carregando rodadas...</option>
              ) : rodadas.length === 0 ? (
                <option>Nenhuma rodada encontrada</option>
              ) : (
                rodadas.map(rodada => (
                  <option key={rodada.id} value={rodada.id}>
                    {rodada.nome}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Seletor de data para rodada */}
        {selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && selectedRound === 'data' && (
          <div className="round-date-selector">
            <label htmlFor="round-date-input">Data:</label>
            <input
              id="round-date-input"
              type="date"
              value={roundDate}
              onChange={handleRoundDateChange}
              className="round-date-input"
              aria-label="Selecionar data"
            />
          </div>
        )}

        <div className="sort-selector">
          <label htmlFor="sort-select">Ordenar por:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Selecionar critério de ordenação"
          >
            <option value="horario">Horário</option>
            <option value="data">Data</option>
            <option value="campeonato">Campeonato</option>
          </select>
        </div>

        {selectedLeague === 'hoje' && (
          <div className="date-selector">
            <label htmlFor="date-picker">Data:</label>
            <input
              type="date"
              id="date-picker"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-input"
            />
          </div>
        )}

        {selectedLeague === 'ao-vivo' && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Atualização Automática</span>
          </div>
        )}
      </div>

      <div className="selected-league-info">
        <h3>{getSelectedLeagueName()}</h3>
        {selectedLeague === 'hoje' && (
          <p>📅 {formatDate(selectedDate)}</p>
        )}
        {selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && selectedRound === 'data' && (
          <p>📅 {formatDate(roundDate)}</p>
        )}
        {selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && selectedRound === 'proximos' && (
          <p>🔮 Próximos Jogos (Agendados)</p>
        )}
        {selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && selectedRound === 'rodada' && selectedRodada && (
          <p>🏆 Rodada: {selectedRodada}</p>
        )}
        {selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && selectedRound === 'todos' && (
          <p>📋 Todos os Jogos</p>
        )}
      </div>

      {/* Próximo Jogo */}
      {proximoJogo && selectedLeague !== 'hoje' && selectedLeague !== 'ao-vivo' && (
        <div className="proximo-jogo-section">
          <h3>🎯 Próximo Jogo</h3>
          <div className="proximo-jogo-card">
            <div className="jogo-header">
              <div className="campeonato-info">
                <img 
                  src={proximoJogo.logoCampeonato} 
                  alt={`Logo do campeonato ${proximoJogo.campeonato}`}
                  className="campeonato-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="campeonato">{proximoJogo.campeonato}</span>
              </div>
              <span 
                className="status"
                style={{ backgroundColor: getStatusColor(proximoJogo.status) }}
              >
                {proximoJogo.status}
              </span>
            </div>
            
            <div className="jogo-times">
              <div className="time time-casa">
                <img 
                  src={proximoJogo.logoCasa} 
                  alt={`Logo do time ${proximoJogo.timeCasa}`}
                  className="time-logo"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/40x40/666/fff?text=${proximoJogo.timeCasa.substring(0, 3).toUpperCase()}`;
                  }}
                />
                <span className="time-nome" title={proximoJogo.timeCasa}>{truncateTeamName(proximoJogo.timeCasa)}</span>
              </div>
              
              <div className="jogo-vs">
                <span className="vs-text">VS</span>
                <span className="horario">{proximoJogo.horario}</span>
                <span className="data-proximo">{formatDate(proximoJogo.data)}</span>
              </div>
              
              <div className="time time-visitante">
                <span className="time-nome" title={proximoJogo.timeVisitante}>{truncateTeamName(proximoJogo.timeVisitante)}</span>
                <img 
                  src={proximoJogo.logoVisitante} 
                  alt={`Logo do time ${proximoJogo.timeVisitante}`}
                  className="time-logo"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/40x40/666/fff?text=${proximoJogo.timeVisitante.substring(0, 3).toUpperCase()}`;
                  }}
                />
              </div>
            </div>
            
            <div className="jogo-info">
              <div className="jogo-estadio">
                <span className="estadio-label">🏟️ Estádio:</span>
                <span className="estadio-nome">{proximoJogo.estadio}</span>
              </div>
            </div>
            
            <div className="jogo-actions">
              <a
                href={`https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!%0A%0A⚽%20Quero%20assistir:%20${proximoJogo.timeCasa}%20x%20${proximoJogo.timeVisitante}%20(${proximoJogo.canal})`}
                target="_blank"
                rel="noopener noreferrer"
                className="assistir-btn proximo-jogo-btn"
              >
                📺 Assistir Próximo Jogo
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="jogos-error">
          <p>{error}</p>
          <button onClick={fetchJogos} className="retry-btn">
            Tentar Novamente
          </button>
        </div>
      )}

      {jogos.length === 0 && !error && (
        <div className="jogos-empty">
          <div className="empty-icon">⚽</div>
          <h3>Nenhum jogo encontrado</h3>
          <p>
            {selectedLeague === 'ao-vivo' 
              ? 'Não há jogos acontecendo agora.' 
              : 'Não há jogos programados para este campeonato.'
            }
          </p>
        </div>
      )}

      {jogos.length > 0 && (
        <div className="jogos-info-summary">
          <p>📊 Mostrando {indexOfFirstJogo + 1}-{Math.min(indexOfLastJogo, jogos.length)} de {jogos.length} jogos</p>
        </div>
      )}

      {jogos.length > 0 && (
        <div className="jogos-grid">
          {currentJogos.map((jogo) => (
            <div key={jogo.id} className="jogo-card">
              <div className="jogo-header">
                <div className="campeonato-info">
                  <img 
                    src={jogo.logoCampeonato} 
                    alt={`Logo do campeonato ${jogo.campeonato}`}
                    className="campeonato-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="campeonato">{jogo.campeonato}</span>
                </div>
                <span 
                  className="status"
                  style={{ backgroundColor: getStatusColor(jogo.status) }}
                >
                  {jogo.status}
                  {jogo.minuto && jogo.status.includes('Tempo') && (
                    <span className="minuto"> {jogo.minuto}'</span>
                  )}
                </span>
              </div>
              <div className="jogo-times placar-centralizado">
                <div className="time time-casa">
                  <img 
                    src={jogo.logoCasa} 
                    alt={`Logo do time ${jogo.timeCasa}`}
                    className="time-logo"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/40x40/666/fff?text=${jogo.timeCasa.substring(0, 3).toUpperCase()}`;
                    }}
                  />
                  <span className="time-nome" title={jogo.timeCasa}>{truncateTeamName(jogo.timeCasa)}</span>
                </div>
                <div className="score-bloco">
                  {jogo.scoreCasa !== null && jogo.scoreVisitante !== null ? (
                    <>
                      <span className="score-text">{jogo.scoreCasa} <span className="hifen">-</span> {jogo.scoreVisitante}</span>
                      <span className="period-text">{jogo.periodo}</span>
                    </>
                  ) : (
                    <>
                      <span className="vs-text">VS</span>
                      <span className="horario">{jogo.horario}</span>
                    </>
                  )}
                  <span className="data-partida">{formatDateShort(jogo.data)}</span>
                </div>
                <div className="time time-visitante">
                  <span className="time-nome" title={jogo.timeVisitante}>{truncateTeamName(jogo.timeVisitante)}</span>
                  <img 
                    src={jogo.logoVisitante} 
                    alt={`Logo do time ${jogo.timeVisitante}`}
                    className="time-logo"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/40x40/666/fff?text=${jogo.timeVisitante.substring(0, 3).toUpperCase()}`;
                    }}
                  />
                </div>
              </div>
              <div className="jogo-info alinhado">
                <div className="jogo-canal">
                  <span className="canal-label">📺 Canal:</span>
                  <span className="canal-nome">{jogo.canal}</span>
                </div>
              </div>
              <div className="jogo-actions centralizado">
                <a
                  href={`https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!%0A%0A⚽%20Quero%20assistir:%20${jogo.timeCasa}%20x%20${jogo.timeVisitante}%20(${jogo.canal})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="assistir-btn"
                >
                  📺 Assistir Jogo
                </a>
              </div>
              <div className="jogo-estadio estadio-abaixo">
                <span className="estadio-label">🏟️ Estádio:</span>
                <span className="estadio-nome">{jogo.estadio}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {jogos.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="pagination-btn prev-btn"
          >
            ← Anterior
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              // Mostrar apenas algumas páginas para não sobrecarregar
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return <span key={pageNumber} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
          </div>
          
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="pagination-btn next-btn"
          >
            Próxima →
          </button>
        </div>
      )}

      <div className="jogos-footer">
        
        <a
          href="https://api.whatsapp.com/send?phone=5519998305956&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!%20Quero%20assistir%20os%20jogos%20em%20tempo%20real!"
          target="_blank"
          rel="noopener noreferrer"
          className="jogos-whatsapp-btn"
        >
          📱 Solicitar Teste Grátis
        </a>
      </div>
    </div>
  );
};

export default JogosDoDia; 