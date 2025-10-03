import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'; // Importe seu cliente Prisma
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient(); // Instancie o Prisma

class SessionController {
    public async create(request: Request, response: Response): Promise<Response> {
        try {
            console.log('--- NOVA REQUISIÇÃO /sessions ---');
            const { email, password } = request.body;
            console.log(`1. Dados recebidos: ${email}`);

            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    company: true,
                },
            });
            console.log('2. Usuário buscado no banco.');

            if (!user) {
                console.log('3. Usuário não encontrado. Retornando 401.');
                return response.status(401).json({ error: 'Credenciais inválidas.' });
            }
            console.log(`4. Usuário encontrado: ${user.id}`);

            if (!user.company) {
                console.error('5. ERRO CRÍTICO: Usuário existe mas não tem empresa associada.');
                return response.status(500).json({ error: 'Configuração de usuário inválida: nenhuma empresa associada.' });
            }
            console.log(`6. Empresa do usuário verificada: ${user.company.name}`);

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            console.log('7. Comparação de senha concluída.');

            if (!isPasswordCorrect) {
                console.log('8. Senha incorreta. Retornando 401.');
                return response.status(401).json({ error: 'Credenciais inválidas.' });
            }
            console.log('9. Senha correta.');

            const { JWT_SECRET } = process.env;
            if (!JWT_SECRET) {
                console.error('10. ERRO CRÍTICO: JWT_SECRET não encontrado no .env');
                throw new Error('JWT_SECRET not found in environment variables');
            }
            console.log('11. Segredo JWT carregado.');

            const token = jwt.sign(
                {
                    sub: user.id,
                    role: user.role,
                    company: {
                        id: user.company.id,
                        name: user.company.name,
                    },
                },
                JWT_SECRET,
                {
                    expiresIn: '1d',
                }
            );
            console.log('12. Token JWT gerado com sucesso.');

            const { password: _, ...userWithoutPassword } = user;

            return response.json({
                user: userWithoutPassword,
                token,
            });

        } catch (error) {
            console.error('ERRO FATAL NO CATCH:', error);
            return response.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}

export default new SessionController();