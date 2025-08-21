const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static('public'));
app.use(express.static('build'));

// Rota simples para teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Rota básica para servidores
app.get('/api/servers', (req, res) => {
  const mockServers = [
    {
      id: 1,
      key: 'test',
      name: 'Servidor Teste',
      url: 'http://example.com/test.m3u',
      status: 'unknown',
      order: 1,
      isActive: true
    }
  ];
  
  res.json(mockServers);
});

// Catch-all para servir React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express rodando em http://localhost:${PORT}`);
});
