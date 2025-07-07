# Componentes Desabilitados

Esta pasta contém componentes que foram desabilitados temporariamente.

## Arquivos Desabilitados

### JogosDoDia.jsx.disabled
- **Descrição**: Componente de exibição de jogos de futebol
- **Motivo**: Removido a pedido do cliente para focar apenas no IPTV
- **Data**: 06/07/2025
- **Para reativar**: Renomear para `JogosDoDia.jsx` e adicionar de volta ao App.js

### JogosDoDia.css.disabled
- **Descrição**: Estilos do componente de jogos
- **Motivo**: Removido junto com o componente
- **Para reativar**: Renomear para `JogosDoDia.css`

## Como Reativar

1. Renomear os arquivos removendo `.disabled`
2. Adicionar o import no App.js: `import JogosDoDia from './components/JogosDoDia';`
3. Adicionar o componente no JSX: `<JogosDoDia />`
4. Adicionar o link no Header: `<a href="#jogos">Jogos do Dia</a>` 