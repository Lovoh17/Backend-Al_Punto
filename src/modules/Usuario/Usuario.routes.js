import express from 'express';
const router = express.Router();
import UsuarioController from './Usuario.controller.js';

// ⬇️⬇️⬇️ MIDDLEWARE ESPECÍFICO PARA LOGIN ⬇️⬇️⬇️
const loginDebug = (req, res, next) => {
  console.log('🔍 [ROUTES MIDDLEWARE] Interceptando /login');
  console.log('  Method:', req.method);
  console.log('  Path:', req.path);
  console.log('  Content-Type:', req.headers['content-type']);
  console.log('  req.body exists?', req.body !== undefined);
  console.log('  req.body:', req.body);
  
  // Si no hay body pero debería haberlo
  if (!req.body && req.method === 'POST') {
    console.log('⚠️  Creando req.body vacío para evitar error');
    req.body = {};
  }
  
  next();
};

// Usa el middleware SOLO para login
router.post('/login', loginDebug, UsuarioController.login);

router.post('/registro', UsuarioController.registrar);
//router.post('/login', UsuarioController.login);

router.get('/estadisticas', UsuarioController.obtenerEstadisticas);
router.get('/reportes/registros', UsuarioController.obtenerReporteRegistros);

router.get('/', UsuarioController.listar);
router.get('/email/:email', UsuarioController.obtenerPorEmail);

router.get('/:id', UsuarioController.obtenerPorId);
router.put('/:id', UsuarioController.actualizar);
router.patch('/:id/estado', UsuarioController.cambiarEstado);
router.patch('/:id/rol', UsuarioController.cambiarRol);
router.delete('/:id', UsuarioController.eliminar);


export default router;