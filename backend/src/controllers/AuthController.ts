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

            // --- CORREÇÃO DE LÓGICA ---
            // A resposta do CGA É o objeto do usuário.
            const userData = cgaApiResponse.data;
            // (Não precisamos de 'cgaResponse.user')
            // --- FIM DA CORREÇÃO ---


	            // --- VERIFICAÇÃO DE SERVIÇO (Correção #9) ---
	            // O CGA deve retornar um array de strings em `services`.
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
	
	                // Retorna 403 Forbidden (Proibido)
	                return res.status(403).json({ message: 'O usuário não tem permissão para acessar este serviço.' });
	            }
	            // --- FIM DA VERIFICAÇÃO ---

            // Se passou, geramos o token
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
                    expiresIn: '30m',
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
            // (O bloco catch continua o mesmo...)
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
                // Se o CGA nos deu um 401 (senha errada), repasse.
                return res.status(error.response.status).json(error.response.data);
            }

            // Se o erro foi o nosso TypeError de 'userData' (agora corrigido),
            // ou outro erro interno.
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    public async refreshToken(req: Request, res: Response): Promise<Response> {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        const [, token] = authHeader.split(' ');

        try {
            const decoded = jwt.verify(token, process.env.ARCO_PORTUS_JWT_SECRET as string) as { sub: string, userId: string, name: string, company: any, role: string, permissions: string[] };

            // O token é válido, mas pode estar expirado. Vamos gerar um novo.
            // Para garantir que o usuário ainda tem acesso, podemos fazer uma chamada leve ao CGA.
            // No entanto, para o refresh ser rápido, vamos confiar no token existente
            // e apenas estender a validade, a menos que o token seja inválido.

            // 1. Decodificar o token para obter os dados do usuário
            const userData = {
                userId: decoded.userId,
                name: decoded.name,
                company: decoded.company,
                role: decoded.role,
                permissions: decoded.permissions,
            };

            // 2. Gerar um novo token com nova expiração
            const newToken = jwt.sign(
                userData,
                process.env.ARCO_PORTUS_JWT_SECRET as string,
                {
                    subject: userData.userId,
                    expiresIn: '30m', // 30 minutos de validade
                }
            );

            logAction({
                action: 'TOKEN_REFRESH',
                module: 'AUTH',
                target: userData.name,
                details: `Token renovado para o usuário ${userData.name}.`,
                severity: LogSeverity.BAIXA,
                user: userData,
            });

            return res.status(200).json({ token: newToken });

        } catch (error) {
            // Se o token for inválido (incluindo se estiver expirado), o verify falha.
            // Retornamos 401 para que o frontend faça o logout.
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