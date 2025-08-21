const express = require('express');
const app = express();
const PORT = 3003;

app.get('/test', (req, res) => {
  res.json({ message: 'Servidor de teste funcionando!' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
  console.log(`🔍 Endereço: ${server.address().address}:${server.address().port}`);
});

server.on('error', (error) => {
  console.error('❌ Erro:', error);
});
