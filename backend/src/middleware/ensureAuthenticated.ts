import { Request, Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';

export function ensureAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader) { return res.status(401).json({ message: 'JWT token is missing.' }); }
    const [, token] = authHeader.split(' ');

    try {
        const decoded = verify(token, process.env.ARCO_PORTUS_JWT_SECRET as string);

        /// --- VERIFIQUE ESTA PARTE ---
        const { sub, name, company, role, permissions } = decoded as JwtPayload & Express.ITokenPayload;
        // --- VERIFIQUE ESTA PARTE ---

        // --- E ESTA ---
        req.user = { userId: sub as string, name, company, role, permissions };
        // --- E ESTA ---

        // Debug Log (Should still be there from last time)
        console.log('--- [DEBUG ensureAuthenticated] req.user DEFINIDO:', JSON.stringify(req.user, null, 2));

        return next();
    } catch (error) { // Adicionado 'error' para log
        console.error('--- [DEBUG ensureAuthenticated] ERRO NA VERIFICAÇÃO DO TOKEN:', error); // Log do erro
        return res.status(401).json({ message: 'Invalid JWT token.' });
    }
}