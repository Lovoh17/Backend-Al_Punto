import cors from 'cors';

const allowedOrigins = [
  'https://alpuntoclientes-production-7e1e.up.railway.app',
  // Tu frontend admin
  'https://al-punto-admin.vercel.app',
  // Desarrollo
  'http://localhost:5173',
  'http://localhost:3000',
  // Para pruebas directas (Postman, Hoppscotch sin origin, mobile apps)
  null, // Permite requests sin origin
  undefined // Permite requests con origin undefined
];

const corsOptions = {
  origin: function (origin, callback) {
    // ✅ PERMITIR EXPLÍCITAMENTE requests sin origin (como Hoppscotch con proxy)
    if (!origin) {
      console.log('🌐 Petición sin origin permitida (proxy/tool)');
      return callback(null, true);
    }
    
    // ✅ PERMITIR SI ESTÁ EN LA LISTA
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // ✅ PERMITIR SI ES UN SUBDOMINIO DE RAILWAY (por seguridad)
    if (origin.endsWith('.up.railway.app')) {
      console.log('✅ Origin de Railway permitido:', origin);
      return callback(null, true);
    }
    
    // ❌ BLOQUEAR SI NO CUMPLE NINGUNA CONDICIÓN
    console.log('🚫 Origin bloqueado por CORS:', origin);
    console.log('📋 Lista de orígenes permitidos:', allowedOrigins.filter(o => o && typeof o === 'string'));
    callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 horas
};

const corsMiddleware = cors(corsOptions);

export { corsOptions };
export default corsMiddleware;