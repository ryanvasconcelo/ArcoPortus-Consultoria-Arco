import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { logAction } from '../services/audit.service';
import { LogSeverity } from '@prisma/client';

export class AuthController {
    public async login(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
            const apiKey = process.env.INTERNAL_API_KEY;
            const cgaApiResponse = await axios.post(
                `${process.env.CGA_INTERNAL_API_URL}/internal/auth/portus-login`,
                { email, password },
                { headers: { 'x-internal-api-key': apiKey } }
            );

            const userData = cgaApiResponse.data;

            // ✅ VALIDAÇÃO DE SERVIÇO "Arco Portus"
            const hasArcoPortusService = userData.services && Array.isArray(userData.services) && userData.services.includes('Arco Portus');

            if (!hasArcoPortusService) {
                logAction({
                    action: 'LOGIN_UNAUTHORIZED_SERVICE',
                    module: 'AUTH',
                    target: email,
                    details: `Login falhou: Usuário "${email}" autenticado, mas não possui o serviço "Arco Portus" associado no CGA.`,
                    severity: LogSeverity.MEDIA,
                    user: {
                        userId: userData.userId || 'N/A',
                        name: userData.name || `Tentativa (${email})`,
                        company: userData.company || { id: 'N/A', name: 'N/A' },
                        role: userData.role || 'N/A',
                        permissions: [],
                    },
                });

                return res.status(403).json({ message: 'O usuário não tem permissão para acessar este serviço.' });
            }

            // ✅ TOKEN DE 12 HORAS
            const token = jwt.sign(
                {
                    userId: userData.userId,
                    name: userData.name || userData.email || 'Usuário (Nome Faltando)',
                    company: userData.company,
                    role: userData.role,
                    permissions: userData.permissions,
                },
                process.env.ARCO_PORTUS_JWT_SECRET as string,
                {
                    subject: userData.userId,
                    expiresIn: '12h', // ✅ 12 HORAS
                }
            );

            logAction({
                action: 'LOGIN',
                module: 'AUTH',
                target: email,
                details: `Login bem-sucedido para o usuário ${email}.`,
                severity: LogSeverity.BAIXA,
                user: userData,
            });

            return res.status(200).json({
                token,
                user: {
                    name: userData.name || userData.email || 'Usuário (Nome Faltando)',
                    email: userData.email,
                    role: userData.role,
                    passwordResetRequired: userData.passwordResetRequired,
                },
            });

        } catch (error) {
            logAction({
                action: 'LOGIN_ATTEMPT',
                module: 'AUTH',
                target: email,
                details: `Tentativa de login falha para o email ${email}.`,
                severity: LogSeverity.MEDIA,
                user: {
                    userId: 'N/A', name: `Tentativa (${email})`,
                    company: { id: 'N/A', name: 'N/A' },
                    role: 'N/A', permissions: [],
                },
            });

            if (axios.isAxiosError(error) && error.response) {
                return res.status(error.response.status).json(error.response.data);
            }

            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // ✅ REFRESH TOKEN COM RE-VALIDAÇÃO NO CGA
    public async refreshToken(req: Request, res: Response): Promise<Response> {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        const [, token] = authHeader.split(' ');

        try {
            const decoded = jwt.verify(token, process.env.ARCO_PORTUS_JWT_SECRET as string) as {
                sub: string,
                userId: string,
                name: string,
                company: any,
                role: string,
                permissions: string[],
                iat: number
            };

            // ✅ RE-VALIDAÇÃO A CADA 1 HORA
            const tokenAge = Date.now() / 1000 - decoded.iat; // Idade do token em segundos
            const oneHour = 60 * 60; // 1 hora em segundos

            // Se o token tem mais de 1 hora, re-valida no CGA
            if (tokenAge > oneHour) {
                console.log('🔄 Token tem mais de 1 hora. Re-validando no CGA...');

                try {
                    const apiKey = process.env.INTERNAL_API_KEY;
                    const cgaResponse = await axios.post(
                        `${process.env.CGA_INTERNAL_API_URL}/internal/auth/validate-user`,
                        { userId: decoded.userId },
                        { headers: { 'x-internal-api-key': apiKey } }
                    );

                    const userData = cgaResponse.data;

                    // Verifica se ainda tem o serviço "Arco Portus"
                    const hasArcoPortusService = userData.services && Array.isArray(userData.services) && userData.services.includes('Arco Portus');

                    if (!hasArcoPortusService) {
                        console.log('❌ Usuário perdeu acesso ao serviço "Arco Portus"');
                        logAction({
                            action: 'TOKEN_REFRESH_DENIED',
                            module: 'AUTH',
                            target: decoded.name,
                            details: `Token refresh negado: Usuário ${decoded.name} não possui mais o serviço "Arco Portus".`,
                            severity: LogSeverity.ALTA,
                            user: {
                                userId: decoded.userId,
                                name: decoded.name,
                                company: decoded.company,
                                role: decoded.role,
                                permissions: [],
                            },
                        });
                        return res.status(403).json({ message: 'Acesso ao serviço foi revogado.' });
                    }

                    // ✅ Atualiza com novas permissões do CGA
                    const newToken = jwt.sign(
                        {
                            userId: userData.userId,
                            name: userData.name,
                            company: userData.company,
                            role: userData.role,
                            permissions: userData.permissions, // Permissões atualizadas
                        },
                        process.env.ARCO_PORTUS_JWT_SECRET as string,
                        {
                            subject: userData.userId,
                            expiresIn: '12h',
                        }
                    );

                    logAction({
                        action: 'TOKEN_REFRESH_VALIDATED',
                        module: 'AUTH',
                        target: userData.name,
                        details: `Token renovado e re-validado no CGA para ${userData.name}.`,
                        severity: LogSeverity.BAIXA,
                        user: userData,
                    });

                    return res.status(200).json({ token: newToken });

                } catch (cgaError) {
                    console.error('❌ Erro ao validar no CGA:', cgaError);
                    // Se falhar a validação no CGA, nega o refresh
                    return res.status(401).json({ message: 'Falha na validação com o servidor de autenticação.' });
                }
            }

            // ✅ Se token tem menos de 1 hora, apenas renova sem re-validar
            const newToken = jwt.sign(
                {
                    userId: decoded.userId,
                    name: decoded.name,
                    company: decoded.company,
                    role: decoded.role,
                    permissions: decoded.permissions,
                },
                process.env.ARCO_PORTUS_JWT_SECRET as string,
                {
                    subject: decoded.userId,
                    expiresIn: '12h',
                }
            );

            logAction({
                action: 'TOKEN_REFRESH',
                module: 'AUTH',
                target: decoded.name,
                details: `Token renovado para ${decoded.name}.`,
                severity: LogSeverity.BAIXA,
                user: {
                    userId: decoded.userId,
                    name: decoded.name,
                    company: decoded.company,
                    role: decoded.role,
                    permissions: decoded.permissions,
                },
            });

            return res.status(200).json({ token: newToken });

        } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(401).json({ message: 'Invalid or expired token for refresh.' });
        }
    }

    public async forceChangePassword(req: Request, res: Response): Promise<Response> {
        const { userId, name } = req.user;
        const { newPassword } = req.body;

        try {
            await axios.patch(
                `${process.env.CGA_INTERNAL_API_URL}/internal/users/force-password-change`,
                { userId, newPassword },
                { headers: { 'x-internal-api-key': process.env.INTERNAL_API_KEY } }
            );

            logAction({
                action: 'FORCE_PASSWORD_CHANGE',
                module: 'AUTH',
                target: name,
                details: `Usuário "${name}" alterou a senha (forçado no primeiro login).`,
                severity: LogSeverity.ALTA,
                user: req.user,
            });

            return res.status(204).send();
        } catch (error) {
            console.error("Erro ao forçar troca de senha:", error);
            return res.status(500).json({ message: "Erro ao se comunicar com o serviço de autenticação." });
        }
    }

    public async forgotPassword(req: Request, res: Response): Promise<Response> {
        try {
            await axios.post(
                `${process.env.CGA_INTERNAL_API_URL}/internal/password/forgot`,
                { email: req.body.email },
                { headers: { 'x-internal-api-key': process.env.INTERNAL_API_KEY } }
            );

            logAction({
                action: 'FORGOT_PASSWORD',
                module: 'AUTH',
                target: req.body.email,
                details: `Solicitação de redefinição de senha para o email ${req.body.email}.`,
                severity: LogSeverity.BAIXA,
                user: {
                    userId: 'System', name: 'System', company: { id: 'N/A', name: 'N/A' },
                    role: 'System', permissions: []
                }
            });
            return res.status(204).send();
        } catch (error) {
            console.error('[PORTUS] Erro ao solicitar redefinição:', error);
            return res.status(204).send();
        }
    }

    public async resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            await axios.post(
                `${process.env.CGA_INTERNAL_API_URL}/internal/password/reset`,
                { token: req.body.token, newPassword: req.body.newPassword },
                { headers: { 'x-internal-api-key': process.env.INTERNAL_API_KEY } }
            );

            logAction({
                action: 'RESET_PASSWORD',
                module: 'AUTH',
                target: 'Redefinição via Token',
                details: `Senha redefinida com sucesso via token.`,
                severity: LogSeverity.ALTA,
                user: {
                    userId: 'System', name: 'System', company: { id: 'N/A', name: 'N/A' },
                    role: 'System', permissions: []
                }
            });
            return res.status(204).send();
        } catch (error: any) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.message || 'Erro ao redefinir a senha.';
            return res.status(status).json({ message });
        }
    }
}