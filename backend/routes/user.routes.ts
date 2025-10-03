// backend/src/routes/user.routes.ts
import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/authorization';

const userRouter = Router();

// Rota para o próprio usuário alterar sua senha.
// Usa apenas o `authMiddleware` para garantir que o usuário está logado,
// mas não restringe por `role`.
userRouter.post('/me/change-password', authMiddleware, UserController.changePassword);


// Rotas de gerenciamento de usuários (CRUD).
// Estas rotas continuam protegidas e só podem ser acessadas por ADMIN e SUPER_ADMIN.
userRouter.get('/', checkRole(['ADMIN', 'SUPER_ADMIN']), UserController.index);
userRouter.post('/', checkRole(['ADMIN', 'SUPER_ADMIN']), UserController.create);
userRouter.put('/:id', checkRole(['ADMIN', 'SUPER_ADMIN']), UserController.update);
userRouter.delete('/:id', checkRole(['ADMIN', 'SUPER_ADMIN']), UserController.delete);

export default userRouter;