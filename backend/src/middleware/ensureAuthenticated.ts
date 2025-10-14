import { Request, Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';

export function ensureAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // 1. Recebe o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;

    // 2. Verifica se o token não foi enviado
    if (!authHeader) {
        return res.status(401).json({ message: 'JWT token is missing.' });
    }

    // 3. Divide o cabeçalho para pegar apenas o token (formato: "Bearer TOKEN")
    const [, token] = authHeader.split(' ');

    try {
        // 4. Verifica se o token é válido
        const decoded = verify(token, process.env.ARCO_PORTUS_JWT_SECRET as string);

        // 5. Força a tipagem do payload e o anexa ao objeto 'req'
        // Graças ao nosso arquivo express.d.ts, o TypeScript sabe que req.user existe.
        const { sub, company, role, permissions } = decoded as JwtPayload & Express.ITokenPayload;

        req.user = { userId: sub as string, company, role, permissions };

        // 6. Se tudo deu certo, avança para o próximo passo (o controller)
        return next();
    } catch {
        // 7. Se a verificação falhar, retorna um erro
        return res.status(401).json({ message: 'Invalid JWT token.' });
    }
}