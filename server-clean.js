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

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

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

    for (let i = 0; i < defaultServers.length; i++) {
      await prisma.server.create({
        data: {
          ...defaultServers[i],
          order: i + 1,
          status: 'unknown'
        }
      });
    }
  }
}

// Middleware para identificar usuário
async function getOrCreateUser(req, res, next) {
  const userKey = req.headers['x-user-key'] || 'default-user';
  
  try {
    let user = await prisma.user.findUnique({ where: { userKey } });
    
    if (!user) {
      user = await prisma.user.create({
        data: { userKey }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Rotas API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

app.get('/api/servers', async (req, res) => {
  try {
    console.log('🔄 Buscando servidores ativos...');
    const servers = await prisma.server.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    
    console.log(`📦 ${servers.length} servidores encontrados`);
    
    // Log detalhado dos servidores
    servers.forEach(server => {
      console.log(`  📡 ${server.name} (${server.key}) - ${server.status}`);
    });
    
    res.json(servers);
  } catch (error) {
    console.error('❌ Erro ao buscar servidores:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

app.get('/api/servers/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const server = await prisma.server.findFirst({
      where: {
        OR: [
          { id: parseInt(identifier) || -1 },
          { key: identifier }
        ]
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

app.post('/api/servers', async (req, res) => {
  try {
    const { name, url, key } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Nome e URL são obrigatórios' });
    }

    const maxOrder = await prisma.server.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const server = await prisma.server.create({
      data: {
        name,
        url,
        key: key || `server_${Date.now()}`,
        order: (maxOrder?.order || 0) + 1,
        status: 'unknown'
      }
    });

    res.status(201).json(server);
  } catch (error) {
    console.error('Erro ao criar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/servers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, key, status } = req.body;

    const server = await prisma.server.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(url && { url }),
        ...(key && { key }),
        ...(status && { status })
      }
    });

    res.json(server);
  } catch (error) {
    console.error('Erro ao atualizar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const { servers } = req.body;

    if (!Array.isArray(servers)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: []
    };

    for (const serverData of servers) {
      try {
        const { key, name, url, status, order } = serverData;

        if (!key || !name || !url) {
          results.errors.push(`Servidor inválido: ${name || 'sem nome'}`);
          continue;
        }

        const existingServer = await prisma.server.findUnique({
          where: { key }
        });

        if (existingServer) {
          await prisma.server.update({
            where: { key },
            data: {
              name,
              url,
              status: status || 'unknown',
              order: order || existingServer.order
            }
          });
          results.updated++;
        } else {
          const maxOrder = await prisma.server.findFirst({
            orderBy: { order: 'desc' },
            select: { order: true }
          });

          await prisma.server.create({
            data: {
              key,
              name,
              url,
              status: status || 'unknown',
              order: order || ((maxOrder?.order || 0) + 1)
            }
          });
          results.imported++;
        }
      } catch (error) {
        results.errors.push(`Erro ao processar ${serverData.name}: ${error.message}`);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Erro ao importar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/servers/reorder', async (req, res) => {
  try {
    const { serverIds } = req.body;

    if (!Array.isArray(serverIds)) {
      return res.status(400).json({ error: 'Array de IDs é obrigatório' });
    }

    const updatePromises = serverIds.map((id, index) =>
      prisma.server.update({
        where: { id: parseInt(id) },
        data: { order: index + 1 }
      })
    );

    await Promise.all(updatePromises);

    const reorderedServers = await prisma.server.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    res.json(reorderedServers);
  } catch (error) {
    console.error('Erro ao reordenar servidores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/servers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.server.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({ message: 'Servidor removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/servers/:id/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    const server = await prisma.server.update({
      where: { id: parseInt(id) },
      data: { order: parseInt(order) }
    });

    res.json(server);
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/servers/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const server = await prisma.server.findUnique({
      where: { id: parseInt(id) }
    });

    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    const startTime = Date.now();
    
    try {
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
        where: { id: parseInt(id) },
        data: {
          status,
          responseTime,
          lastTested: new Date()
        }
      });

      res.json({
        status,
        responseTime,
        httpStatus: response.status
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await prisma.server.update({
        where: { id: parseInt(id) },
        data: {
          status: 'offline',
          responseTime,
          lastTested: new Date()
        }
      });

      res.json({
        status: 'offline',
        responseTime,
        error: error.message
      });
    }

  } catch (error) {
    console.error('Erro ao testar servidor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/servers/test-all', async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      where: { isActive: true }
    });

    const results = [];

    for (const server of servers) {
      const startTime = Date.now();
      
      try {
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
            responseTime,
            lastTested: new Date()
          }
        });

        results.push({
          id: server.id,
          name: server.name,
          status,
          responseTime,
          httpStatus: response.status
        });

      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        await prisma.server.update({
          where: { id: server.id },
          data: {
            status: 'offline',
            responseTime,
            lastTested: new Date()
          }
        });

        results.push({
          id: server.id,
          name: server.name,
          status: 'offline',
          responseTime,
          error: error.message
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Erro ao testar todos os servidores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/export', async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    res.json({ servers });
  } catch (error) {
    console.error('Erro ao exportar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/config/export', async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    res.json({ servers });
  } catch (error) {
    console.error('Erro ao exportar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/config/import', async (req, res) => {
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

app.post('/api/reset', async (req, res) => {
  try {
    await prisma.server.deleteMany({});
    await initializeDefaultServers();
    
    const servers = await prisma.server.findMany({
      orderBy: { order: 'asc' }
    });

    res.json({ 
      message: 'Base de dados resetada com sucesso',
      serversCount: servers.length
    });
  } catch (error) {
    console.error('Erro ao resetar base de dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/config/reset', async (req, res) => {
  try {
    await prisma.server.deleteMany({});
    await initializeDefaultServers();
    
    const servers = await prisma.server.findMany({
      orderBy: { order: 'asc' }
    });

    res.json({ 
      message: 'Configuração resetada com sucesso',
      serversCount: servers.length
    });
  } catch (error) {
    console.error('Erro ao resetar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalServers = await prisma.server.count();
    const activeServers = await prisma.server.count({ where: { isActive: true } });
    const onlineServers = await prisma.server.count({ 
      where: { 
        isActive: true,
        status: 'online' 
      } 
    });
    const offlineServers = await prisma.server.count({ 
      where: { 
        isActive: true,
        status: 'offline' 
      } 
    });
    const unknownServers = await prisma.server.count({ 
      where: { 
        isActive: true,
        status: 'unknown' 
      } 
    });

    const avgResponseTime = await prisma.server.aggregate({
      where: { 
        isActive: true,
        responseTime: { not: null }
      },
      _avg: { responseTime: true }
    });

    const lastTested = await prisma.server.findFirst({
      where: { 
        isActive: true,
        lastTested: { not: null }
      },
      orderBy: { lastTested: 'desc' }
    });

    const users = await prisma.user.count();
    const favorites = await prisma.favorite.count();
    const watchHistory = await prisma.watchHistory.count();

    res.json({
      servers: {
        total: totalServers,
        active: activeServers,
        online: onlineServers,
        offline: offlineServers,
        unknown: unknownServers,
        avgResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
        lastTested: lastTested?.lastTested
      },
      users: {
        total: users,
        favorites,
        watchHistory
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de usuário
app.get('/api/user/profile', getOrCreateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            favorites: true,
            watchHistory: true,
            searchHistory: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/user/preferences', getOrCreateUser, async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferences }
    });

    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/user/favorites', getOrCreateUser, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(favorites);
  } catch (error) {
    console.error('Erro ao obter favoritos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/user/favorites', getOrCreateUser, async (req, res) => {
  try {
    const { contentId, contentType, title, category } = req.body;

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId
        }
      },
      update: {},
      create: {
        userId: req.user.id,
        contentId,
        contentType,
        title,
        category
      }
    });

    res.json(favorite);
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/user/favorites/:contentId', getOrCreateUser, async (req, res) => {
  try {
    const { contentId } = req.params;

    await prisma.favorite.delete({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId
        }
      }
    });

    res.json({ message: 'Favorito removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/user/watch-history', getOrCreateUser, async (req, res) => {
  try {
    const history = await prisma.watchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { lastWatched: 'desc' },
      take: 50
    });

    res.json(history);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/user/watch-history', getOrCreateUser, async (req, res) => {
  try {
    const { contentId, contentType, title, category, position, duration } = req.body;

    const history = await prisma.watchHistory.upsert({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId
        }
      },
      update: {
        position,
        duration,
        lastWatched: new Date()
      },
      create: {
        userId: req.user.id,
        contentId,
        contentType,
        title,
        category,
        position,
        duration
      }
    });

    res.json(history);
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/user/search-history', getOrCreateUser, async (req, res) => {
  try {
    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(history);
  } catch (error) {
    console.error('Erro ao obter histórico de busca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/user/search-history', getOrCreateUser, async (req, res) => {
  try {
    const { query, resultsCount } = req.body;

    const history = await prisma.searchHistory.create({
      data: {
        userId: req.user.id,
        query,
        resultsCount
      }
    });

    res.json(history);
  } catch (error) {
    console.error('Erro ao salvar busca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Catch-all para servir React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Inicializar servidor
async function startServer() {
  try {
    await initializeDefaultServers();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor Express rodando em http://localhost:${PORT}`);
      console.log(`📊 Prisma Studio: npx prisma studio`);
      console.log(`📁 Arquivos estáticos servidos de: public/ e build/`);
      console.log(`🔗 API disponível em: http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
