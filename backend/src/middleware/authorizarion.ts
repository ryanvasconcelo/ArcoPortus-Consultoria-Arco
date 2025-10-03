// backend/src/middleware/authorization.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Este é um "gerador de middleware". Ele retorna uma função de middleware
// que verifica se o usuário tem uma das roles permitidas.
export function checkRole(allowedRoles: Role[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req; // Obtido do authMiddleware anterior

        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado.' });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
            }
            
            // Anexa o usuário completo ao request para uso posterior nos controllers
            req.user = user;

            return next();
        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    };
}