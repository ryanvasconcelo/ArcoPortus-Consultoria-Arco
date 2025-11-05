import { Router } from 'express';
import multer from 'multer';
import { CameraController } from '../controllers/CameraController';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated';
import multerConfig from '../config/multer';

const cameraRoutes = Router();
const cameraController = new CameraController();
const upload = multer(multerConfig);

// ✅ IMPORTANTE: Rotas específicas DEVEM vir ANTES de rotas com parâmetros dinâmicos

// ✅ CORREÇÃO #6: Rota de Download do Template
cameraRoutes.get(
    '/template/download',
    ensureAuthenticated,
    cameraController.downloadTemplate
);

// ✅ CORREÇÃO #10: Rota de Exportação
cameraRoutes.get(
    '/export',
    ensureAuthenticated,
    cameraController.exportCameras
);

// ✅ CORREÇÃO #11: Rota de Exclusão em Massa (CORRIGIDA)
// Mudado de DELETE /many para DELETE /bulk para evitar conflito
cameraRoutes.delete(
    '/bulk',
    ensureAuthenticated,
    cameraController.deleteMany
);

// Rota de Importação
cameraRoutes.post(
    '/import',
    ensureAuthenticated,
    upload.single('file'),
    cameraController.importFromXLSX
);

// Rotas padrão CRUD (devem vir DEPOIS das rotas específicas)
cameraRoutes.get('/', ensureAuthenticated, cameraController.listCameras);
cameraRoutes.get('/:id', ensureAuthenticated, cameraController.show);
cameraRoutes.post('/', ensureAuthenticated, cameraController.create);
cameraRoutes.patch('/:id', ensureAuthenticated, cameraController.update);
cameraRoutes.delete('/:id', ensureAuthenticated, cameraController.delete);

export { cameraRoutes };