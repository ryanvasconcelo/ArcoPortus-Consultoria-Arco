import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export class AuthController {
    public async login(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        try {

            const apiKey = process.env.INTERNAL_API_KEY;

            console.log('🔍 [DEBUG] CGA URL:', process.env.CGA_INTERNAL_API_URL);
            console.log('🔍 [DEBUG] API Key:', apiKey?.substring(0, 20) + '...');
            console.log('🔍 [DEBUG] Full URL:', `${process.env.CGA_INTERNAL_API_URL}/internal/auth/portus-login`);

            const cgaApiResponse = await axios.post(
                `${process.env.CGA_INTERNAL_API_URL}/internal/auth/portus-login`,
                { email, password },
                {
                    headers: {
                        // Usamos a variável 'apiKey' que acabamos de logar
                        'x-internal-api-key': apiKey,
                    },
                }
            );

            // 2. Se a chamada foi bem-sucedida, o CGA nos retornou os dados do usuário
            const userData = cgaApiResponse.data;

            // 3. Geramos um JWT *do Arco Portus* com esses dados
            const token = jwt.sign(
                {
                    // Colocamos os dados recebidos dentro do payload do nosso token
                    userId: userData.userId,
                    company: userData.company,
                    role: userData.role,
                    permissions: userData.permissions,
                },
                process.env.ARCO_PORTUS_JWT_SECRET as string, // Chave secreta do Portus
                {
                    subject: userData.userId, // O 'sub' do token é o ID do usuário
                    expiresIn: '1d', // Token expira em 1 dia
                }
            );

            // 4. Retornamos o token e os dados básicos para o frontend
            return res.status(200).json({
                token,
                user: {
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    passwordResetRequired: userData.passwordResetRequired,
                },
            });

        } catch (error) {
            // Se o axios der erro (ex: 401, 403, 500 do CGA), capturamos aqui
            if (axios.isAxiosError(error) && error.response) {
                // Repassamos o status e a mensagem de erro do CGA para o frontend
                return res.status(error.response.status).json(error.response.data);
            }

            // Se for outro tipo de erro (ex: CGA fora do ar)
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Could not connect to authentication service.' });
        }
    }

    public async forceChangePassword(req: Request, res: Response): Promise<Response> {
        const { userId } = req.user; // O ID do usuário vem do token JWT (graças ao ensureAuthenticated)
        const { newPassword } = req.body;

        try {
            // ✅ Pede para o CGA fazer o trabalho sujo
            await axios.patch(
                `${process.env.CGA_INTERNAL_API_URL}/internal/users/force-password-change`,
                { userId, newPassword },
                { headers: { 'x-internal-api-key': process.env.INTERNAL_API_KEY } }
            );

            return res.status(204).send(); // 204 No Content = sucesso sem corpo de resposta
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
            return res.status(204).send();
        } catch (error) {
            // Retornamos 204 mesmo em caso de erro para não vazar informações
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
            return res.status(204).send();
        } catch (error: any) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.message || 'Erro ao redefinir a senha.';
            return res.status(status).json({ message });
        }
    }
}