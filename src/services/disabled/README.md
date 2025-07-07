# Serviços Desabilitados

Esta pasta contém serviços que foram desabilitados temporariamente.

## Arquivos Desabilitados

### jogosApi.js.disabled
- **Descrição**: API para buscar dados de jogos de futebol (eFootball)
- **Motivo**: Removido a pedido do cliente para focar apenas no IPTV
- **Data**: 06/07/2025
- **Funcionalidades**:
  - Buscar jogos do dia
  - Buscar jogos ao vivo
  - Buscar jogos por liga
  - Buscar próximos jogos
  - Integração com API-Football do RapidAPI

## Como Reativar

1. Renomear o arquivo removendo `.disabled`
2. Adicionar o import no componente: `import { fetchJogosDoDia } from '../services/jogosApi';`
3. Verificar se a API key do RapidAPI ainda é válida
4. Testar as funcionalidades de busca de jogos

## Configuração da API

A API usa o serviço API-Football do RapidAPI:
- **URL Base**: https://api-football-v1.p.rapidapi.com/v3
- **Chave**: Necessária chave do RapidAPI
- **Limite**: 100 requests/dia (gratuito) 