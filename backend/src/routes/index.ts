// backend/src/index.ts
import express from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // <<< ADICIONE ESTA IMPORTAÇÃO
import { authMiddleware } from '../middleware/auth'; // <<< IMPORTE O MIDDLEWARE

const app = express();
const port = 3001;

// Middleware para o Express entender JSON no corpo das requisições
app.use(express.json());

// Rota principal (ainda podemos manter um "Olá Mundo")
app.get('/', (req, res) => {
    res.send('API do CGA está no ar!');
});

// Rota para cadastrar um novo usuário
app.post('/users', async (req, res) => {
    try {
        // 1. Pega os dados do corpo da requisição (agora com 'company')
        const { email, password, company } = req.body;

        // 2. Validação básica
        if (!email || !password || !company) {
            return res.status(400).json({ error: 'Email, password and company are required' });
        }

        // 3. Verifica se o usuário já existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        // 4. Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Salva o novo usuário no banco de dados (agora com 'company')
        const newUser = await prisma.user.create({
            data: {
                email,
                company, // Salva o nome da empresa
                password: hashedPassword,
            },
        });

        // 6. Retorna o usuário criado (sem a senha!)
        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json(userWithoutPassword);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Rota para criar uma nova sessão (Login)
app.post('/sessions', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Procura o usuário pelo e-mail
        const user = await prisma.user.findUnique({ where: { email } });

        // 2. Se o usuário não for encontrado, retorna um erro genérico
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // 3. Compara a senha enviada com a senha criptografada no banco
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // 4. Se a senha for inválida, retorna o mesmo erro genérico
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // 5. Se deu tudo certo, gera o Token JWT
        const token = jwt.sign(
            { userId: user.id }, // O que queremos armazenar no token (payload)
            process.env.JWT_SECRET as string, // A chave secreta do .env
            { expiresIn: '7d' } // Tempo de expiração do token
        );

        // 6. Retorna o token para o cliente
        return res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/me', authMiddleware, async (req, res) => {
    try {
        // O ID do usuário vem do 'req.userId' que nosso middleware adicionou
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Serviço de autenticação rodando em http://localhost:${port}`);
});