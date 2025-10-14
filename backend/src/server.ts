// ✅ ESTA LINHA PRECISA SER A PRIMEIRA DE TODAS PARA CARREGAR O .ENV
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3334; // Porta padrão para o Portus

app.use(cors());
app.use(express.json());

// Rota para verificar se a API está no ar
app.get('/', (req, res) => {
    res.send('Arco Portus API is running!');
});

// Integra as rotas de autenticação
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Arco Portus server is running on http://localhost:${PORT}`);
});