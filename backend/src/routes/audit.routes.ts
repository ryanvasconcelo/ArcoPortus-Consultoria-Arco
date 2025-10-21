import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated';
import { checkRole } from '../middleware/authorization'; // <-- O middleware que criamos

const auditRoutes = Router();
const auditController = new AuditController(); // 1. Instanciar a classe

// Rota GET /api/audit
// Conecta-se ao método 'listLogs' do nosso controlador
auditRoutes.get(
    '/',
    ensureAuthenticated, // 2. Garante que o usuário está logado
    checkRole(['SUPER_ADMIN', 'ADMIN']), // 3. Garante que é Admin
    auditController.listLogs // 4. Chama o método correto
);

// Rota GET /api/audit/stats
// Conecta-se ao método 'getAuditStats' do nosso controlador
auditRoutes.get(
    '/stats',
    ensureAuthenticated,
    checkRole(['SUPER_ADMIN', 'ADMIN']),
    auditController.getAuditStats
);

export { auditRoutes };