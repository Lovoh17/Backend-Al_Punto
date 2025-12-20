import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import corsMiddleware from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { runDatabaseMigrations, checkDatabaseStatus } from './scrips/migrate.js';
import CategoriaRoutes from "./modules/Categoria/Categoria.routes.js";
import UsuarioRoutes from "./modules/Usuario/Usuario.routes.js";
import { Menu_Dias_ProductosRoutes, pedidosProductosRoutes, PedidoRoutes, GananciasRoutes, Menu_DiasRoutes, ProductosRoutes, Historial_Pedidos } from "./modules/index.js";

dotenv.config();
const app = express();

// ========== MIDDLEWARES ==========
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static("uploads"));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ⬇️⬇️⬇️ AÑADE ESTO (middleware de diagnóstico) ⬇️⬇️⬇️
app.use((req, res, next) => {
  // Solo para rutas de login
  if (req.method === 'POST' && req.path === '/api/usuarios/login') {
    console.log('🔍 [DIAGNÓSTICO] Petición POST /login recibida');
    console.log('  Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    console.log('  req.body disponible?', req.body !== undefined);
    console.log('  req.body:', req.body);
    console.log('  req.rawBody?', req.rawBody); // Por si acaso
  }
  next();
});

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
  });
}

// ========== HEALTH CHECK ==========
app.get('/api/health', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.query('SELECT NOW()');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: result.rows[0].now,
      uptime: process.uptime(),
      service: 'Sistema de Comandas API'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
      service: 'Sistema de Comandas API'
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: '🚀 API del Sistema de Comandas',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      pedidos: '/api/Pedidos'
    }
  });
});

// ========== RUTAS ==========
app.use('/api/categorias', CategoriaRoutes);
app.use('/api/usuarios', UsuarioRoutes);
app.use('/api/ganancias', GananciasRoutes);
app.use('/api/productos', ProductosRoutes);
app.use('/api/historial_pedidos', Historial_Pedidos);
app.use('/api/Menu_Dias', Menu_DiasRoutes);
app.use('/api/Menu_Dias_Productos', Menu_Dias_ProductosRoutes);
app.use('/api/Pedidos', PedidoRoutes);
app.use('/api/Pedidos_Productos', pedidosProductosRoutes);

// ========== ERROR HANDLER ==========
app.use(errorHandler);

// ========== INICIAR SERVIDOR ==========
async function startServer() {
  try {
    // 1. Conectar a DB
    console.log('🔄 Conectando a PostgreSQL...');
    await connectDB();
    
    console.log('🟢 Conectado a PostgreSQL');
    await runDatabaseMigrations();
    await checkDatabaseStatus();
    
    // 2. Iniciar servidor
    const PORT = process.env.PORT || 3000;  // ✅ Railway usa 3000+
    
    app.listen(PORT, '0.0.0.0', () => {  // ✅ '0.0.0.0' para Railway
      console.log(`
      🚀 Servidor desplegado en Railway
      📡 Puerto: ${PORT}
      🌐 URL: https://backend-alpunto-production.up.railway.app
      📊 Modo: ${process.env.NODE_ENV || 'development'}
      🔌 API disponible en: https://backend-alpunto-production.up.railway.app/api
      ❤️  Health check: https://backend-alpunto-production.up.railway.app/api/health
      `);
    });
    
  } catch (error) {
    console.error("💥 Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// ========== MANEJO DE SEÑALES ==========
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

// ========== INICIAR ==========
startServer();