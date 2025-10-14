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
            // ✅ ADICIONE ESTE TRECHO AQUI ✅
            const apiKeyToSend = process.env.INTERNAL_API_KEY;
            console.log('--- Auth Request (Arco Portus) ---');
            console.log(`[Portus] Chave ENVIADA: [${apiKeyToSend}]`);
            console.log('---------------------------------');
            // FIM DO TRECHO

            // 1. Chamar o endpoint interno do CGA para validar as credenciais
            const cgaApiResponse = await axios.post(
                // Usamos a variável de ambiente para a URL
                `${process.env.CGA_INTERNAL_API_URL}/api/internal/auth/portus-login`,
                { email, password }, // Body da requisição
                {
                    headers: {
                        // Enviamos o API Key para nos autenticarmos com o CGA
                        'x-internal-api-key': process.env.INTERNAL_API_KEY,
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
}