// backend/src/routes/session.routes.ts
import { Router } from 'express';
import SessionController from '../controllers/SessionController';

const sessionRouter = Router();

// Quando uma requisição POST chegar em '/', ela será tratada pelo método 'create' do SessionController
sessionRouter.post('/', SessionController.create);

export default sessionRouter;