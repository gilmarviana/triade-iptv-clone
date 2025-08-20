const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('build'));

// Inicializar servidores padrão
async function initializeDefaultServers() {
  const count = await prisma.server.count();
  
  if (count === 0) {
    console.log('Inicializando servidores padrão...');
    
    const defaultServers = [
      {
        key: 'lunar',
        name: '🌙 Padrão Lunar',
        url: 'http://nplaylunar.shop/get.php?username=98809226&password=12506682&type=m3u_plus&output=mpegts'
      },
      {
        key: 'solar',
        name: '☀️ Padrão Solar',
        url: 'http://nplaysolar.shop/get.php?username=43136813&password=28414831&type=m3u_plus&output=mpegts'
      },
      {
        key: 'premium',
        name: '⭐ Premium Iza',
        url: 'http://iza002.online/get.php?username=aa9y42&password=7hckhc&type=m3u_plus&output=m3u8'
      },
      {
        key: 'superpremium',
        name: '💎 Alpha Server',
        url: 'http://voando66483.click/get.php?username=364486666&password=568728463&type=m3u_plus&output=mpegts'
      }
    ];

    for (const server of defaultServers) {
      await prisma.server.create({ data: server });
    }
    
    console.log('Servidores padrão criados com sucesso!');
  }
}

// APIs dos Servidores

// Endpoint de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Listar todos os servidores ordenados
app.get('/api/servers', async (req, res) => {
  try {
    console.log('📡 Requisição recebida para /api/servers');
    const servers = await prisma.server.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });
    console.log('📊 Servidores encontrados:', servers.length);
    console.log('📋 Dados dos servidores:', servers.map(s => ({ id: s.id, key: s.key, name: s.name, order: s.order })));
    
    // Adicionar headers de CORS explicitamente
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.json(servers);
  } catch (error) {
    console.error('❌ Erro ao buscar servidores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter servidor por ID ou key
app.get('/api/servers/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const server = await prisma.server.findFirst({
      where: {
        OR: [
          { id: identifier },
          { key: identifier }
        ],
        isActive: true
      }
    });
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    res.json(server);
  } catch (error) {
    console.error('Erro ao buscar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo servidor
app.post('/api/servers', async (req, res) => {
  try {
    const { key, name, url } = req.body;

    // Validações
    if (!key || !name || !url) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (!url.startsWith('http://')) {
      return res.status(400).json({ error: 'A URL deve começar com http://' });
    }

    // Verificar se já existe um servidor com a mesma key
    const existingServer = await prisma.server.findUnique({
      where: { key }
    });

    if (existingServer) {
      return res.status(400).json({ error: 'Já existe um servidor com este identificador' });
    }

    const server = await prisma.server.create({
      data: { key, name, url }
    });

    res.status(201).json(server);
  } catch (error) {
    console.error('Erro ao criar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar servidor
app.put('/api/servers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Nome e URL são obrigatórios' });
    }

    if (!url.startsWith('http://')) {
      return res.status(400).json({ error: 'A URL deve começar com http://' });
    }

    const server = await prisma.server.update({
      where: { id },
      data: { name, url, updatedAt: new Date() }
    });

    res.json(server);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    console.error('Erro ao atualizar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar ordem dos servidores
app.put('/api/servers/reorder', async (req, res) => {
  try {
    // Se não há body, reorganizar alfabeticamente
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('📝 Reorganizando servidores alfabeticamente...');
      
      // Buscar todos os servidores ativos
      const servers = await prisma.server.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      
      // Atualizar ordem baseada na ordenação alfabética
      const updatePromises = servers.map((server, index) => 
        prisma.server.update({
          where: { id: server.id },
          data: { order: index }
        })
      );
      
      await Promise.all(updatePromises);
      
      console.log('✅ Servidores reorganizados alfabeticamente');
      return res.json({ 
        message: 'Servidores reorganizados alfabeticamente',
        count: servers.length
      });
    }
    
    // Reorganização manual com array de servidores
    const { servers } = req.body; // Array de { id, order }
    
    if (!Array.isArray(servers)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Atualizar ordem de cada servidor
    const updatePromises = servers.map(({ id, order }) => 
      prisma.server.update({
        where: { id },
        data: { order: parseInt(order) }
      })
    );

    await Promise.all(updatePromises);
    
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar servidor (soft delete)
app.delete('/api/servers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.server.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });

    res.json({ message: 'Servidor removido com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    console.error('Erro ao deletar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar ordem de servidor específico
app.put('/api/servers/:id/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    await prisma.server.update({
      where: { id },
      data: { order: parseInt(order), updatedAt: new Date() }
    });

    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Testar conectividade do servidor
app.post('/api/servers/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    
    const server = await prisma.server.findUnique({
      where: { id }
    });

    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Atualizar status para testing
    await prisma.server.update({
      where: { id },
      data: { status: 'testing', lastTested: new Date() }
    });

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(server.url, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const status = response.ok ? 'online' : 'offline';
      
      const updatedServer = await prisma.server.update({
        where: { id },
        data: { 
          status, 
          responseTime: response.ok ? responseTime : null,
          lastTested: new Date()
        }
      });

      res.json({
        ...updatedServer,
        testResult: {
          success: response.ok,
          statusCode: response.status,
          responseTime
        }
      });

    } catch (testError) {
      await prisma.server.update({
        where: { id },
        data: { 
          status: 'offline', 
          responseTime: null,
          lastTested: new Date()
        }
      });

      res.json({
        ...server,
        status: 'offline',
        testResult: {
          success: false,
          error: testError.message
        }
      });
    }

  } catch (error) {
    console.error('Erro ao testar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Testar todos os servidores
app.post('/api/servers/test-all', async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      where: { isActive: true }
    });

    const results = [];

    for (const server of servers) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(server.url, {
          method: 'HEAD',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        const status = response.ok ? 'online' : 'offline';

        await prisma.server.update({
          where: { id: server.id },
          data: { 
            status, 
            responseTime: response.ok ? responseTime : null,
            lastTested: new Date()
          }
        });

        results.push({
          id: server.id,
          key: server.key,
          name: server.name,
          status,
          responseTime: response.ok ? responseTime : null
        });

      } catch (testError) {
        await prisma.server.update({
          where: { id: server.id },
          data: { 
            status: 'offline', 
            responseTime: null,
            lastTested: new Date()
          }
        });

        results.push({
          id: server.id,
          key: server.key,
          name: server.name,
          status: 'offline',
          error: testError.message
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Erro ao testar todos os servidores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Exportar configuração
app.get('/api/export', async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      where: { isActive: true }
    });

    const config = {
      servers: servers.map(({ id, createdAt, updatedAt, ...server }) => server),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=iptv_servers_${new Date().toISOString().split('T')[0]}.json`);
    res.json(config);
  } catch (error) {
    console.error('Erro ao exportar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para exportar configuração (alternativo)
app.get('/api/config/export', async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    const config = {
      servers: servers.map(server => ({
        key: server.key,
        name: server.name,
        url: server.url,
        status: server.status,
        responseTime: server.responseTime,
        lastTested: server.lastTested
      })),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    res.json(config);
  } catch (error) {
    console.error('Erro ao exportar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Importar configuração
app.post('/api/import', async (req, res) => {
  try {
    const { servers } = req.body;

    if (!servers || !Array.isArray(servers)) {
      return res.status(400).json({ error: 'Formato de configuração inválido' });
    }

    // Desativar todos os servidores existentes
    await prisma.server.updateMany({
      data: { isActive: false }
    });

    // Criar novos servidores
    for (const serverData of servers) {
      if (serverData.key && serverData.name && serverData.url) {
        await prisma.server.upsert({
          where: { key: serverData.key },
          update: {
            name: serverData.name,
            url: serverData.url,
            isActive: true,
            status: serverData.status || 'unknown'
          },
          create: {
            key: serverData.key,
            name: serverData.name,
            url: serverData.url,
            status: serverData.status || 'unknown'
          }
        });
      }
    }

    const newServers = await prisma.server.findMany({
      where: { isActive: true }
    });

    res.json({ 
      message: 'Configuração importada com sucesso',
      serversCount: newServers.length
    });
  } catch (error) {
    console.error('Erro ao importar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para importar configuração (alternativo)
app.post('/api/config/import', async (req, res) => {
  try {
    const { servers } = req.body;

    if (!servers || (!Array.isArray(servers) && typeof servers !== 'object')) {
      return res.status(400).json({ error: 'Dados de servidores inválidos' });
    }

    // Desativar todos os servidores existentes
    await prisma.server.updateMany({
      data: { isActive: false }
    });

    // Converter objeto para array se necessário (compatibilidade com formato antigo)
    let serverArray = Array.isArray(servers) ? servers : Object.values(servers);

    // Adicionar novos servidores
    const createdServers = [];
    for (const server of serverArray) {
      if (server.name && server.url && server.url.startsWith('http://')) {
        const created = await prisma.server.create({
          data: {
            key: server.key || `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: server.name,
            url: server.url,
            status: server.status || 'unknown',
            responseTime: server.responseTime || null,
            lastTested: server.lastTested ? new Date(server.lastTested) : null
          }
        });
        createdServers.push(created);
      }
    }

    res.json({ 
      message: 'Configuração importada com sucesso',
      serversCount: createdServers.length 
    });
  } catch (error) {
    console.error('Erro ao importar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Reset para configuração padrão
app.post('/api/reset', async (req, res) => {
  try {
    // Desativar todos os servidores
    await prisma.server.updateMany({
      data: { isActive: false }
    });

    // Recriar servidores padrão
    await initializeDefaultServers();

    const servers = await prisma.server.findMany({
      where: { isActive: true }
    });

    res.json({ 
      message: 'Configuração resetada para os padrões',
      servers
    });
  } catch (error) {
    console.error('Erro ao resetar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para resetar configuração (alternativo)
app.post('/api/config/reset', async (req, res) => {
  try {
    // Desativar todos os servidores
    await prisma.server.updateMany({
      data: { isActive: false }
    });

    // Recriar servidores padrão
    const defaultServers = [
      {
        key: "principal",
        name: "Servidor Principal",
        url: "http://example.com/playlist.m3u",
        status: "unknown"
      },
      {
        key: "backup",
        name: "Servidor Backup", 
        url: "http://backup.example.com/playlist.m3u",
        status: "unknown"
      }
    ];

    const createdServers = [];
    for (const server of defaultServers) {
      const created = await prisma.server.create({
        data: server
      });
      createdServers.push(created);
    }

    res.json({ 
      message: 'Configuração resetada com sucesso',
      serversCount: createdServers.length 
    });
  } catch (error) {
    console.error('Erro ao resetar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    const total = await prisma.server.count({
      where: { isActive: true }
    });

    const online = await prisma.server.count({
      where: { isActive: true, status: 'online' }
    });

    const offline = await prisma.server.count({
      where: { isActive: true, status: 'offline' }
    });

    const testing = await prisma.server.count({
      where: { isActive: true, status: 'testing' }
    });

    res.json({
      total,
      online,
      offline,
      testing,
      unknown: total - online - offline - testing
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// APIs para gerenciar usuários/sessões (substituindo localStorage)

// Middleware para obter ou criar usuário baseado na sessão
async function getOrCreateUser(req, res, next) {
  try {
    let sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      // Gerar novo ID de sessão
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    
    let user = await prisma.user.findUnique({
      where: { sessionId }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          sessionId,
          deviceInfo: req.headers['user-agent'] || '',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      });
    } else {
      // Atualizar último acesso
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeen: new Date() }
      });
    }
    
    req.user = user;
    res.setHeader('X-Session-Id', sessionId);
    next();
  } catch (error) {
    console.error('Erro ao gerenciar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// API para obter dados do usuário
app.get('/api/user/profile', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    
    res.json({
      sessionId: user.sessionId,
      preferences: user.preferences ? JSON.parse(user.preferences) : {},
      createdAt: user.createdAt,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API para atualizar preferências do usuário
app.put('/api/user/preferences', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    const { preferences } = req.body;
    
    await prisma.user.update({
      where: { id: user.id },
      data: { preferences: JSON.stringify(preferences) }
    });
    
    res.json({ message: 'Preferências atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// APIs para Favoritos

// Listar favoritos do usuário
app.get('/api/user/favorites', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        channel: true,
        movie: true,
        series: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(favorites);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar aos favoritos
app.post('/api/user/favorites', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    const { contentType, contentId } = req.body;
    
    const data = { userId: user.id, contentType };
    
    if (contentType === 'channel') data.channelId = contentId;
    else if (contentType === 'movie') data.movieId = contentId;
    else if (contentType === 'series') data.seriesId = contentId;
    
    const favorite = await prisma.favorite.create({ data });
    
    res.json({ message: 'Adicionado aos favoritos', favorite });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Item já está nos favoritos' });
    } else {
      console.error('Erro ao adicionar favorito:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Remover dos favoritos
app.delete('/api/user/favorites/:id', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    
    await prisma.favorite.deleteMany({
      where: {
        id,
        userId: user.id
      }
    });
    
    res.json({ message: 'Removido dos favoritos' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// APIs para Histórico de Visualização

// Listar histórico do usuário
app.get('/api/user/history', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    const { limit = 50 } = req.query;
    
    const history = await prisma.watchHistory.findMany({
      where: { userId: user.id },
      include: {
        channel: true,
        movie: true,
        series: true,
        episode: true
      },
      orderBy: { watchedAt: 'desc' },
      take: parseInt(limit)
    });
    
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar ao histórico
app.post('/api/user/history', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    const { contentType, contentId, duration, totalDuration, progress, lastPosition } = req.body;
    
    const data = {
      userId: user.id,
      contentType,
      duration,
      totalDuration,
      progress,
      lastPosition,
      isCompleted: progress >= 0.9
    };
    
    if (contentType === 'channel') data.channelId = contentId;
    else if (contentType === 'movie') data.movieId = contentId;
    else if (contentType === 'series') data.seriesId = contentId;
    else if (contentType === 'episode') data.episodeId = contentId;
    
    const historyEntry = await prisma.watchHistory.create({ data });
    
    res.json({ message: 'Histórico atualizado', historyEntry });
  } catch (error) {
    console.error('Erro ao adicionar ao histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// APIs para Histórico de Pesquisas

// Listar histórico de pesquisas
app.get('/api/user/search-history', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    
    const searches = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { searchedAt: 'desc' },
      take: 20
    });
    
    res.json(searches);
  } catch (error) {
    console.error('Erro ao buscar histórico de pesquisas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar pesquisa ao histórico
app.post('/api/user/search-history', getOrCreateUser, async (req, res) => {
  try {
    const { user } = req;
    const { query, resultCount = 0 } = req.body;
    
    const search = await prisma.searchHistory.create({
      data: {
        userId: user.id,
        query,
        resultCount
      }
    });
    
    res.json({ message: 'Pesquisa salva no histórico', search });
  } catch (error) {
    console.error('Erro ao salvar pesquisa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// APIs para Conteúdo (Canais, Filmes, Séries)

// Listar canais
app.get('/api/channels', async (req, res) => {
  try {
    const { category, quality, language, search, page = 1, limit = 50 } = req.query;
    
    const where = { isActive: true };
    
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (quality) where.quality = quality;
    if (language) where.language = language;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        include: { server: true },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.channel.count({ where })
    ]);
    
    res.json({
      channels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar canais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar filmes
app.get('/api/movies', async (req, res) => {
  try {
    const { genre, quality, language, search, year, page = 1, limit = 50 } = req.query;
    
    const where = { isActive: true };
    
    if (genre) where.genre = { contains: genre, mode: 'insensitive' };
    if (quality) where.quality = quality;
    if (language) where.language = language;
    if (year) where.year = parseInt(year);
    if (search) where.title = { contains: search, mode: 'insensitive' };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        include: { server: true },
        orderBy: { title: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.movie.count({ where })
    ]);
    
    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar séries
app.get('/api/series', async (req, res) => {
  try {
    const { genre, language, search, year, status, page = 1, limit = 50 } = req.query;
    
    const where = { isActive: true };
    
    if (genre) where.genre = { contains: genre, mode: 'insensitive' };
    if (language) where.language = language;
    if (year) where.year = parseInt(year);
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [series, total] = await Promise.all([
      prisma.series.findMany({
        where,
        include: { 
          server: true,
          episodes: {
            orderBy: [
              { seasonNumber: 'asc' },
              { episodeNumber: 'asc' }
            ]
          }
        },
        orderBy: { title: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.series.count({ where })
    ]);
    
    res.json({
      series,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API para estatísticas do sistema
app.get('/api/system/stats', async (req, res) => {
  try {
    const stats = await prisma.systemStats.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!stats) {
      // Calcular estatísticas em tempo real se não existir
      const [totalUsers, totalChannels, totalMovies, totalSeries, totalEpisodes] = await Promise.all([
        prisma.user.count(),
        prisma.channel.count({ where: { isActive: true } }),
        prisma.movie.count({ where: { isActive: true } }),
        prisma.series.count({ where: { isActive: true } }),
        prisma.episode.count({ where: { isActive: true } })
      ]);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const [activeUsers24h, activeUsers7d] = await Promise.all([
        prisma.user.count({ where: { lastSeen: { gte: yesterday } } }),
        prisma.user.count({ where: { lastSeen: { gte: lastWeek } } })
      ]);
      
      return res.json({
        totalUsers,
        totalChannels,
        totalMovies,
        totalSeries,
        totalEpisodes,
        activeUsers24h,
        activeUsers7d
      });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Servir arquivos estáticos
app.get('*', (req, res) => {
  console.log('� Requisição recebida para', req.path);
  
  // Se for uma requisição para API, retorna 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  
  // Para rotas HTML, servir os arquivos da pasta public
  const filePath = path.join(__dirname, 'public', req.path === '/' ? 'index.html' : req.path);
  console.log('📁 Servindo arquivo:', filePath);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('❌ Erro ao servir arquivo:', err);
      res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    } else {
      console.log('✅ Arquivo servido com sucesso:', req.path);
    }
  });
});

// Inicializar servidor
async function startServer() {
  try {
    console.log('🔄 Iniciando servidor...');
    
    // Conectar ao banco de dados
    console.log('🔄 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados com sucesso!');
    
    // Inicializar servidores padrão
    console.log('🔄 Inicializando servidores padrão...');
    await initializeDefaultServers();
    console.log('✅ Servidores padrão inicializados!');
    
    // Iniciar servidor
    console.log('🔄 Iniciando servidor Express...');
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Painel administrativo: http://localhost:${PORT}/painel.html`);
      console.log(`🎬 Página de conteúdo: http://localhost:${PORT}/conteudo.html`);
      console.log(`📊 API Base: http://localhost:${PORT}/api`);
    });
    
    server.on('error', (error) => {
      console.error('❌ Erro no servidor Express:', error);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown - temporariamente desabilitado para debug
/*
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT recebido - Desligando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM recebido - Desligando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
*/

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

startServer();
