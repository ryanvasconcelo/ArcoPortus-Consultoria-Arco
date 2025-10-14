import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated';

const testRoutes = Router();

// Aplica o middleware a esta rota
testRoutes.get('/protected', ensureAuthenticated, (req: Request, res: Response) => {
    // Graças ao middleware, agora temos acesso a req.user
    const { userId, company, role } = req.user;

    res.json({
        message: `Olá, usuário ${userId} da empresa ${company.name}!`,
        role: `Sua permissão é ${role}.`,
        status: 'Acesso concedido à rota protegida!',
    });
});

export { testRoutes };