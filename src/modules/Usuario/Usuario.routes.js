import express from 'express';
const router = express.Router();
import UsuarioController from './Usuario.controller.js';

// Ruta temporal para debug de login - ELIMINAR después
router.post('/login-debug', async (req, res) => {
  console.log('=== LOGIN DEBUG ===');
  
  try {
    const { email, password } = req.body;
    console.log('Email:', email);
    
    // 1. Conectar a DB directamente
    const pool = await connectDB();
    
    // 2. Verificar si la tabla existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'usuarios'
      );
    `);
    
    console.log('Tabla usuarios existe?', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      return res.json({ error: 'Tabla usuarios no existe' });
    }
    
    // 3. Buscar usuario
    const userResult = await pool.query(
      'SELECT id, email, password, nombre FROM usuarios WHERE email = $1',
      [email]
    );
    
    console.log('Usuarios encontrados:', userResult.rows.length);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    const user = userResult.rows[0];
    console.log('Usuario:', { id: user.id, email: user.email });
    
    // 4. Verificar contraseña (SIMPLIFICADO - solo para prueba)
    // EN PRODUCCIÓN usa bcrypt.compare()
    if (password !== user.password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // 5. Responder
    res.json({
      success: true,
      message: 'Login debug exitoso',
      user: { id: user.id, email: user.email, nombre: user.nombre }
    });
    
  } catch (error) {
    console.error('ERROR en login-debug:', error.message);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

router.post('/registro', UsuarioController.registrar);
router.post('/login', UsuarioController.login);

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