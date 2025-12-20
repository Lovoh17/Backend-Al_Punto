import cors from 'cors';

const allowedOrigins = [
  // Railway frontend (CORRIGE LA URL)
  'https://alpuntoclientes-production-7e1e.up.railway.app',
  
  // Tu frontend admin
  'https://al-punto-admin.vercel.app',
  
  // Desarrollo
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Permitir Railway health checks
    if (origin.includes('railway')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 Origen bloqueado por CORS:', origin);
      console.log('✅ Orígenes permitidos:', allowedOrigins);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 horas
};

const corsMiddleware = cors(corsOptions);

export { corsOptions };
export default corsMiddleware;