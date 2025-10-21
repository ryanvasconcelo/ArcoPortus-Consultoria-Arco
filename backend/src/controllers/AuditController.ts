import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma, LogSeverity } from '@prisma/client'; // Importar LogSeverity

export class AuditController {

    public async listLogs(req: Request, res: Response): Promise<Response> {
        const { company } = req.user;
        // --- MUDANÇA 3: Filtros simplificados ---
        const {
            startDate,
            endDate,
            severity, // <-- NOVO FILTRO
            usuario, // <-- Barra de pesquisa
            page = '1',
            pageSize = '20'
        } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const limit = parseInt(pageSize as string, 10);
        const skip = (pageNumber - 1) * limit;

        try {
            const where: Prisma.AuditLogWhereInput = {
                companyId: company.id,
            };

            const createdAtFilter: Prisma.DateTimeFilter = {};
            if (startDate) {
                createdAtFilter.gte = new Date(startDate as string);
            }
            if (endDate) {
                const nextDay = new Date(endDate as string);
                nextDay.setDate(nextDay.getDate() + 1);
                createdAtFilter.lte = nextDay;
            }
            if (Object.keys(createdAtFilter).length > 0) {
                where.createdAt = createdAtFilter;
            }

            // --- MUDANÇA 4: Adicionado filtro de severidade ---
            if (severity && severity !== 'all') {
                where.severity = severity as LogSeverity;
            }

            // --- MUDANÇA 5: Barra de pesquisa agora procura em múltiplos campos ---
            if (usuario) {
                const search = usuario as string;
                where.OR = [
                    { userName: { contains: search, mode: 'insensitive' } },
                    { details: { contains: search, mode: 'insensitive' } },
                    { target: { contains: search, mode: 'insensitive' } },
                    { action: { contains: search, mode: 'insensitive' } },
                    { module: { contains: search, mode: 'insensitive' } },
                ];
            }

            const [logs, totalItems] = await prisma.$transaction([
                prisma.auditLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.auditLog.count({ where })
            ]);

            const totalPages = Math.ceil(totalItems / limit);

            return res.status(200).json({
                data: logs,
                pagination: { page: pageNumber, pageSize: limit, totalItems, totalPages }
            });
        } catch (error) {
            console.error('Erro ao buscar logs de auditoria:', error);
            return res.status(500).json({ message: 'Erro interno ao buscar logs.' });
        }
    }

    public async getAuditStats(req: Request, res: Response): Promise<Response> {
        const { company } = req.user;
        try {
            const where: Prisma.AuditLogWhereInput = { companyId: company.id };

            // --- MUDANÇA 6: Agrupar por Severidade, não por Módulo ---
            const totalPromise = prisma.auditLog.count({ where });
            const bySeverityPromise = prisma.auditLog.groupBy({
                by: ['severity'],
                _count: { severity: true },
                where,
            });

            const [total, bySeverityResult] = await prisma.$transaction([
                totalPromise,
                bySeverityPromise
            ]);

            // Formata a resposta para ser amigável para o frontend
            const bySeverity = {
                BAIXA: bySeverityResult.find(s => s.severity === 'BAIXA')?._count.severity || 0,
                MEDIA: bySeverityResult.find(s => s.severity === 'MEDIA')?._count.severity || 0,
                ALTA: bySeverityResult.find(s => s.severity === 'ALTA')?._count.severity || 0,
            };

            return res.status(200).json({ total, bySeverity });

        } catch (error) {
            console.error('Erro ao buscar estatísticas de auditoria:', error);
            return res.status(500).json({ message: 'Erro interno ao buscar estatísticas.' });
        }
    }
}