import { Router } from 'express';
import ProductController from '../controllers/ProductController';
import { checkRole } from '../middleware/authorization';

const productRouter = Router();

// CORREÇÃO: ADMIN também precisa listar produtos para criar/editar usuários
productRouter.get('/', checkRole(['SUPER_ADMIN', 'ADMIN']), ProductController.index);

export default productRouter;