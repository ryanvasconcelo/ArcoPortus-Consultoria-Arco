// src/routes/camera.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { CameraController } from '../controllers/CameraController'; // Importa a CLASSE
import { ensureAuthenticated } from '../middleware/ensureAuthenticated';
import multerConfig from '../config/multer';

const cameraRoutes = Router();
const cameraController = new CameraController(); // Cria a instância
const upload = multer(multerConfig);

// --- CORREÇÃO: Usar nomes de método válidos ---
cameraRoutes.get('/', ensureAuthenticated, cameraController.listCameras); // Assumindo que mudamos para 'listCameras'
cameraRoutes.get('/:id', ensureAuthenticated, cameraController.show); // Mantenha 'show' se existir
cameraRoutes.post('/', ensureAuthenticated, cameraController.create); // Assumindo 'createCamera'
cameraRoutes.patch('/:id', ensureAuthenticated, cameraController.update); // Assumindo 'updateCamera'
// --- Linha 14 Corrigida ---
cameraRoutes.delete('/:id', ensureAuthenticated, cameraController.delete);


// Rota de Importação
cameraRoutes.post(
    '/import',
    ensureAuthenticated,
    upload.single('file'),
    cameraController.importFromXLSX
);

// Rota de Download do Template (Correção #6)
cameraRoutes.get(
    '/template',
    ensureAuthenticated,
    cameraController.downloadTemplate
);

// Rota de Exportação (Correção #10)
cameraRoutes.get(
    '/export',
    ensureAuthenticated,
    cameraController.exportCameras // Novo método
);

// Rota de Exclusão em Massa (Correção #11)
cameraRoutes.delete(
    '/many', // Rota: DELETE /api/cameras/many
    ensureAuthenticated,
    cameraController.deleteMany
);



export { cameraRoutes };