import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated';

const authRoutes = Router();
const authController = new AuthController();

// Rota pública para o login inicial
authRoutes.post('/login', authController.login);
authRoutes.post('/refresh-token', authController.refreshToken);

// Rota protegida para forçar a troca de senha
// Esta é a rota que está faltando
authRoutes.patch(
    '/force-change-password',
    ensureAuthenticated,
    authController.forceChangePassword
);

// ...
authRoutes.post('/forgot-password', authController.forgotPassword); // ✅ Garanta que esta linha exista
authRoutes.post('/reset-password', authController.resetPassword); // E esta também
// ...

export { authRoutes };