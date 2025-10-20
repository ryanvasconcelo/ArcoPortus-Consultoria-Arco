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
cameraRoutes.delete('/:id', ensureAuthenticated, cameraController.delete); // <-- Usar 'deleteCamera' ou o nome correto

// Rota de Importação
cameraRoutes.post(
    '/import',
    ensureAuthenticated,
    upload.single('file'),
    cameraController.importFromXLSX
);

// Rota de Exportação
cameraRoutes.get(
    '/export',
    ensureAuthenticated,
    cameraController.exportToXLSX
);

// --- NOVA ROTA DE EXCLUSÃO EM MASSA ---
// Deve vir ANTES de '/:id' para que 'all' não seja tratado como um ID
cameraRoutes.delete(
    '/all', // Rota: DELETE /api/cameras/all
    ensureAuthenticated,
    cameraController.deleteAllCameras // Novo método
);

cameraRoutes.delete('/:id', ensureAuthenticated, cameraController.delete); // Rota de delete individual

export { cameraRoutes };