// src/routes/camera.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { CameraController } from '../controllers/CameraController';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated';
import multerConfig from '../config/multer'; // Reutilizamos a mesma configuração

const cameraRoutes = Router();
const cameraController = new CameraController();
const upload = multer(multerConfig);

// Rotas CRUD Manuais
cameraRoutes.get('/', ensureAuthenticated, cameraController.list);
cameraRoutes.get('/:id', ensureAuthenticated, cameraController.show);
cameraRoutes.post('/', ensureAuthenticated, cameraController.create);
cameraRoutes.patch('/:id', ensureAuthenticated, cameraController.update);
cameraRoutes.delete('/:id', ensureAuthenticated, cameraController.delete);

// ---> NOSSA NOVA ROTA DE IMPORTAÇÃO <---
cameraRoutes.post(
    '/import',
    ensureAuthenticated,
    upload.single('file'),
    cameraController.importFromXLSX // <-- Chame o novo método especialista
);

cameraRoutes.get(
    '/export',
    ensureAuthenticated,
    cameraController.exportToXLSX
);

export { cameraRoutes };