import { Router } from 'express';
import { uploadLogo } from '../middleware/upload'; // ADICIONAR ESTA LINHA
import CompanyController from '../controllers/CompanyController';
import { checkRole } from '../middleware/authorization';

const companyRouter = Router();

// Rotas específicas primeiro
companyRouter.get('/', checkRole(['SUPER_ADMIN', 'ADMIN']), CompanyController.index);

// SUBSTITUIR as duas rotas POST duplicadas por esta:
companyRouter.post(
    '/',
    uploadLogo.single('logo'),
    checkRole(['SUPER_ADMIN']),
    CompanyController.create
);

// Rotas genéricas com parâmetros depois
companyRouter.get('/:id', checkRole(['SUPER_ADMIN', 'ADMIN']), CompanyController.show);

// ADICIONAR uploadLogo.single('logo') na rota PUT:
companyRouter.put(
    '/:id',
    uploadLogo.single('logo'),
    checkRole(['SUPER_ADMIN', 'ADMIN']),
    CompanyController.update
);

companyRouter.delete('/:id', checkRole(['SUPER_ADMIN']), CompanyController.delete);

// Rotas de sub-recursos
companyRouter.post('/:id/products', checkRole(['SUPER_ADMIN']), CompanyController.associateProduct);
companyRouter.delete('/:id/products/:productId', checkRole(['SUPER_ADMIN']), CompanyController.disassociateProduct);

export default companyRouter;