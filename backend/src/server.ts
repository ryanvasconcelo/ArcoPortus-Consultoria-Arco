import path from 'path';
import dotenv from 'dotenv';
// ... outros imports
import { testRoutes } from './routes/test.routes';
import { fileRoutes } from './routes/file.routes';
import { cameraRoutes } from './routes/camera.routes';
import { auditRoutes } from './routes/audit.routes';
import { deleteOldAuditLogs } from './services/cron.service';
import { prisma } from './lib/prisma'; // <-- MUDANÇA: Importar o Prisma

// --- INÍCIO DO DIAGNÓSTICO DOTENV ---
// (Seu diagnóstico dotenv permanece o mesmo)
const CWD = process.cwd();
console.log(`[DIAGNÓSTICO] Diretório de Trabalho Atual (CWD): ${CWD}`);
const envPath = path.resolve(CWD, '.env');
console.log(`[DIAGNÓSTICO] Tentando carregar .env de: ${envPath}`);
const configResult = dotenv.config({ path: envPath });
if (configResult.error) {
    console.error('[DIAGNÓSTICO] ERRO ao carregar o arquivo .env:', configResult.error);
} else {
    console.log('[DIAGNÓSTICO] Arquivo .env carregado com SUCESSO.');
    console.log('[DIAGNÓSTICO] Chaves encontradas:', Object.keys(configResult.parsed || {}));
}
// --- FIM DO DIAGNÓSTICO DOTENV ---

import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3335;

app.use(cors());
app.use(express.json());
app.use('/api/test', testRoutes);

app.get('/', (req, res) => {
    res.send('Arco Portus API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/audit', auditRoutes);
app.use(
    '/static/templates',
    express.static(path.join(__dirname, '..', 'uploads', 'templates'))
);

// --- MUDANÇA: Capturar o 'server' e iniciar o Cron Job ---
const server = app.listen(PORT, () => {

    // Regra de Negócio: Reter logs por 30 dias
    // Executa a limpeza 10 segundos após o servidor iniciar 
    // e depois repete a cada 24 horas.
    setTimeout(() => {
        deleteOldAuditLogs(); // Executa ao iniciar
        // Repete a cada 24 horas (em milissegundos)
        setInterval(deleteOldAuditLogs, 24 * 60 * 60 * 1000);
    }, 10000); // Delay de 10s para não sobrecarregar a inicialização
});

// --- MUDANÇA: Adicionar Graceful Shutdown (Boa Prática) ---
// Isso garante que o Prisma e o servidor fechem corretamente
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        prisma.$disconnect()
            .then(() => console.log('Prisma client disconnected'))
            .catch((e) => console.error('Error disconnecting Prisma client', e))
            .finally(() => process.exit(0));
    });
});