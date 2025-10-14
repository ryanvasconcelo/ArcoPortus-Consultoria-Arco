import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRoutes = Router();
const authController = new AuthController();

// Esta é uma rota pública, não precisa de middleware de autenticação
authRoutes.post('/login', authController.login);

export { authRoutes };