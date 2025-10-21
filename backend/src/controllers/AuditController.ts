import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma, LogSeverity } from '@prisma/client';

export class AuditController {

    public async listLogs(req: Request, res: Response): Promise<Response> {
        const { company } = req.user;
        const {
            startDate,
            endDate,
            severity,
            modulo,           // Filtro específico de Módulo
            usuario,          // Filtro específico de Usuário
            searchTerm,       // Pesquisa principal (da barra)
            page = '1',
            pageSize = '7' // Default page size adjusted if needed, though frontend sends it
        } = req.query;

        // Ensure pageSize from query is used, default to 7 if not provided
        const limit = parseInt(pageSize as string || '7', 10);
        const pageNumber = parseInt(page as string, 10);
        const skip = (pageNumber - 1) * limit;


        try {
            const where: Prisma.AuditLogWhereInput = {
                companyId: company.id,
            };

            // Date Filters
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

            // Severity Filter (from cards)
            if (severity && severity !== 'all') {
                where.severity = severity as LogSeverity;
            }

            // Module Filter (from dropdown)
            if (modulo && modulo !== 'all') {
                const fileModules = ['legislacao', 'normas-e-procedimentos', 'documentos-registros', 'diagnostico-ear'];
                if (fileModules.includes(modulo as string)) {
                    where.module = 'FILES';
                    where.target = modulo as string;
                } else {
                    where.module = modulo as string;
                }
            }

            // User Filter (from input)
            if (usuario) {
                where.userName = { contains: usuario as string, mode: 'insensitive' };
            }

            // Main Search Term Filter (from search bar)
            if (searchTerm) {
                const search = searchTerm as string;
                // Search across multiple relevant fields
                where.OR = [
                    { details: { contains: search, mode: 'insensitive' } },
                    { target: { contains: search, mode: 'insensitive' } },
                    { action: { contains: search, mode: 'insensitive' } },
                    { userName: { contains: search, mode: 'insensitive' } } // Also search username in main search
                ];
            }

            // Database Queries
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

            // Response
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