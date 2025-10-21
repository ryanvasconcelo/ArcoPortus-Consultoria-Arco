import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de Autorização (RBAC).
 * Verifica se a 'role' do usuário (vinda do req.user) está na lista de
 * 'roles' permitidas para acessar a rota.
 *
 * DEVE ser usado DEPOIS do ensureAuthenticated.
 */
export function checkRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { user } = req;

        // 1. Verifica se o ensureAuthenticated foi executado
        if (!user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        // 2. Verifica se a role do usuário está na lista de permitidos
        const hasPermission = allowedRoles.includes(user.role);

        if (!hasPermission) {
            return res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
        }

        // 3. Se passou, permite o acesso
        return next();
    };
}