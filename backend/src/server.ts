import path from 'path';
import dotenv from 'dotenv';
// ... outros imports
import { testRoutes } from './routes/test.routes';
import { fileRoutes } from './routes/file.routes';


// --- INÍCIO DO DIAGNÓSTICO DOTENV ---
// 1. Descobre o diretório de trabalho atual (onde 'npm run dev' foi executado)
const CWD = process.cwd();
console.log(`[DIAGNÓSTICO] Diretório de Trabalho Atual (CWD): ${CWD}`);

// 2. Constrói o caminho completo e absoluto para o arquivo .env
const envPath = path.resolve(CWD, '.env');
console.log(`[DIAGNÓSTICO] Tentando carregar .env de: ${envPath}`);

// 3. Tenta carregar o arquivo .env do caminho especificado
const configResult = dotenv.config({ path: envPath });

// 4. Verifica se a leitura falhou ou teve sucesso
if (configResult.error) {
    console.error('[DIAGNÓSTICO] ERRO ao carregar o arquivo .env:', configResult.error);
} else {
    console.log('[DIAGNÓSTICO] Arquivo .env carregado com SUCESSO.');
    // Mostra as chaves que foram carregadas (sem os valores, por segurança)
    console.log('[DIAGNÓSTICO] Chaves encontradas:', Object.keys(configResult.parsed || {}));
}

// 5. Mostra o valor da variável específica que precisamos
console.log(`[DIAGNÓSTICO] Valor de INTERNAL_API_KEY: [${process.env.INTERNAL_API_KEY}]`);
console.log('--- FIM DO DIAGNÓSTICO ---');
// --- FIM DO DIAGNÓSTICO DOTENV ---

// O resto da sua aplicação...
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3335;

app.use(cors());
app.use(express.json());
app.use('/api/test', testRoutes); // Adicione esta linha

app.get('/', (req, res) => {
    res.send('Arco Portus API is running!');
});

app.use('/api/auth', authRoutes);

app.use('/api/files', fileRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Arco Portus server is running on http://localhost:${PORT}`);
});