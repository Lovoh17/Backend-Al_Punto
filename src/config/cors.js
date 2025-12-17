import cors from 'cors';

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'https://comfy-pie-1b854e.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware de CORS configurado
const corsMiddleware = cors(corsOptions);

export { corsOptions };
export default corsMiddleware;