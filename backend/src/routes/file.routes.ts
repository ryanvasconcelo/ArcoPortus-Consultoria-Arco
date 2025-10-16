import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated';
import multerConfig from '../config/multer'; // 1. Importe sua configuração do Multer

const fileRoutes = Router();
const fileController = new FileController();
const upload = multer(multerConfig);

// A rota GET para listar os arquivos.
// Note como o middleware 'ensureAuthenticated' é executado antes do controlador.
fileRoutes.get('/', ensureAuthenticated, fileController.listFiles);

// ---> NOSSA NOVA ROTA <---
// 3. Rota para CRIAR um novo arquivo (upload)
// A ordem é importante:
// 1º - ensureAuthenticated: Garante que o usuário está logado.
// 2º - upload.single('file'): O Multer processa UM arquivo vindo do campo 'file'.
// 3º - fileController.uploadFile: Nosso controller recebe o arquivo processado.
fileRoutes.post(
    '/',
    ensureAuthenticated,
    upload.single('file'), // 'file' DEVE ser o nome do campo no formulário do frontend
    fileController.uploadFile
);

fileRoutes.patch(
    '/:id',
    ensureAuthenticated,
    fileController.updateFile
);

fileRoutes.delete(
    '/:id',
    ensureAuthenticated,
    fileController.deleteFile
);

export { fileRoutes };