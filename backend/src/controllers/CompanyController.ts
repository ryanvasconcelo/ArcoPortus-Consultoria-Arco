// backend/src/controllers/CompanyController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CompanyController {
    // Listar todas as empresas (só para SUPER_ADMIN)
    public async index(req: Request, res: Response): Promise<Response> {
        const companies = await prisma.company.findMany();
        return res.json(companies);
    }

    // Criar uma nova empresa (só para SUPER_ADMIN)
    public async create(req: Request, res: Response): Promise<Response> {
        const { name } = req.body;
        const company = await prisma.company.create({ data: { name } });
        return res.status(201).json(company);
    }

    // Ver uma empresa específica
    public async show(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const authenticatedUser = req.user; // Obtido do middleware checkRole

        // REGRA: ADMIN só pode ver sua própria empresa
        if (authenticatedUser.role === 'ADMIN' && authenticatedUser.companyId !== id) {
            return res.status(403).json({ error: 'Acesso negado. Você só pode visualizar sua própria empresa.' });
        }

        const company = await prisma.company.findUnique({ where: { id } });
        if (!company) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }
        return res.json(company);
    }

    // Atualizar uma empresa
    public async update(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name /*, outras props de customização */ } = req.body;
        const authenticatedUser = req.user;

        // REGRA: ADMIN só pode editar sua própria empresa
        if (authenticatedUser.role === 'ADMIN' && authenticatedUser.companyId !== id) {
            return res.status(403).json({ error: 'Acesso negado. Você só pode editar sua própria empresa.' });
        }
        
        // REGRA: Apenas SUPER_ADMIN pode associar serviços (lógica futura)

        const company = await prisma.company.update({
            where: { id },
            data: { name },
        });
        return res.json(company);
    }

    // Deletar uma empresa (só para SUPER_ADMIN)
    public async delete(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        await prisma.company.delete({ where: { id } });
        return res.status(204).send(); // 204 No Content
    }
}

export default new CompanyController();