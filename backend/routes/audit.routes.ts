// backend/src/routes/audit.routes.ts
import { Router } from 'express';
import AuditController from '../controllers/AuditController';
import { checkRole } from '../middleware/authorization';

const auditRouter = Router();

// Rotas de auditoria - apenas ADMIN e SUPER_ADMIN têm acesso
auditRouter.get('/', checkRole(['SUPER_ADMIN', 'ADMIN']), AuditController.index);
auditRouter.get('/stats', checkRole(['SUPER_ADMIN', 'ADMIN']), AuditController.stats);
auditRouter.get('/:id', checkRole(['SUPER_ADMIN', 'ADMIN']), AuditController.show);

export default auditRouter;