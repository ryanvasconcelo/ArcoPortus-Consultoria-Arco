import { Router } from 'express';
import PasswordController from '../controllers/PasswordController';

const passwordRouter = Router();

// Rota para solicitar o link de redefinição
passwordRouter.post('/forgot', PasswordController.forgotPassword);

// Rota para enviar a nova senha com o token
passwordRouter.post('/reset/:token', PasswordController.resetPassword);

export default passwordRouter;