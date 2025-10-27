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

            // ✅ --- CORREÇÃO CRÍTICA ---
            // Adicionamos 'name' ao payload do token.
            const token = jwt.sign(
                {
                    userId: userData.userId,
                    name: userData.name || userData.email || 'Usuário (Nome Faltando)', // <-- Fallback
                    company: userData.company,
                    role: userData.role,
                    permissions: userData.permissions,
                },
                process.env.ARCO_PORTUS_JWT_SECRET as string,
                {
                    subject: userData.userId,
                    expiresIn: '30m',
                }
            );

            logAction({
                action: 'LOGIN',
                module: 'AUTH',
                target: email, // <-- MUDANÇA: Alvo é o email
                details: `Login bem-sucedido para o usuário ${email}.`,
                severity: LogSeverity.BAIXA, // <-- Regra de Negócio: OK
                user: userData,
            });

            return res.status(200).json({
                token,
                user: {
                    name: userData.name || userData.email || 'Usuário (Nome Faltando)', // <-- Fallback
                    email: userData.email,
                    role: userData.role,
                    passwordResetRequired: userData.passwordResetRequired,
                },
            });

        } catch (error) {
            logAction({
                action: 'LOGIN_ATTEMPT',
                module: 'AUTH',
                target: email, // <-- MUDANÇA: Alvo é o email
                details: `Tentativa de login falha para o email ${email}.`,
                severity: LogSeverity.MEDIA, // Tentativa falha é MEDIA
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
            return res.status(500).json({ message: 'Could not connect to authentication service.' });
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

            // LOG DE ALTERAÇÃO DE SENHA
            logAction({
                action: 'FORCE_PASSWORD_CHANGE',
                module: 'AUTH',
                target: name, // <-- MUDANÇA: Alvo é o nome do usuário
                details: `Usuário "${name}" alterou a senha (forçado no primeiro login).`,
                severity: LogSeverity.ALTA, // <-- MUDANÇA: Edição é ALTA
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
                target: req.body.email, // <-- MUDANÇA: Alvo é o email
                details: `Solicitação de redefinição de senha para o email ${req.body.email}.`,
                severity: LogSeverity.BAIXA, // É uma solicitação, não uma mudança
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
                target: 'Redefinição via Token', // <-- MUDANÇA: Alvo genérico
                details: `Senha redefinida com sucesso via token.`,
                severity: LogSeverity.ALTA, // <-- MUDANÇA: Edição é ALTA
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

