import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { logAction } from '../services/audit.service';
import { LogSeverity } from '@prisma/client';

const UPLOADS_FOLDER = path.resolve(__dirname, '..', '..', 'uploads');

export class FileController {

    public async listFiles(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const categoryQuery = req.query.category as string | undefined;
            if (!categoryQuery) { return res.status(400).json({ message: 'A categoria é obrigatória.' }); }
            if (!user.permissions.includes('VIEW:DOCUMENTS')) { return res.status(403).json({ message: 'Acesso negado.' }); }
            const files = await prisma.file.findMany({
                where: { companyId: user.company.id, category: categoryQuery.trim() },
                select: { id: true, name: true, description: true, category: true, subcategory: true, item: true, path: true, size: true, mimetype: true, type: true, uploadedById: true, uploadedByName: true, companyId: true, createdAt: true, updatedAt: true },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(files);
        } catch (error) {
            console.error('Erro em listFiles:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async uploadFile(req: Request, res: Response): Promise<Response> {
        const file = req.file;
        try {
            const { user } = req;
            const { description, category, subcategory, item, name: formName } = req.body;
            if (!file) { return res.status(400).json({ message: 'Nenhum arquivo enviado.' }); }
            if (!description || !category) { await fs.unlink(file.path); return res.status(400).json({ message: 'Descrição e categoria são obrigatórias.' }); }
            if (!user.permissions.includes('CREATE:DOCUMENTS')) { await fs.unlink(file.path); return res.status(403).json({ message: 'Acesso negado.' }); }
            const { originalname, filename: pathValue, size, mimetype } = file;
            const finalName = formName || originalname;
            let savedFile;
            if (category === 'normas-e-procedimentos') {
                if (!item) { await fs.unlink(file.path); return res.status(400).json({ message: 'O campo "item" é obrigatório para Normas.' }); }
                savedFile = await prisma.file.upsert({
                    where: { companyId_category_subcategory_item: { companyId: user.company.id, category, subcategory: subcategory || "", item } },
                    update: { name: finalName, description, path: pathValue, size, mimetype, uploadedById: user.userId, uploadedByName: user.name },
                    create: { companyId: user.company.id, category, subcategory: subcategory || "", item, name: finalName, description, path: pathValue, size, mimetype, uploadedById: user.userId, uploadedByName: user.name }
                });
                logAction({
                    action: 'UPLOAD_UPSERT',
                    module: 'FILES',
                    target: category,
                    details: `Arquivo "${savedFile.name}" carregado/atualizado em Normas. Item: ${item}.`,
                    severity: LogSeverity.ALTA, // <-- MUDANÇA: Edição é ALTA
                    user: req.user
                });
            } else {
                savedFile = await prisma.file.create({
                    data: {
                        companyId: user.company.id,
                        category,
                        subcategory: subcategory || null,
                        item: item || null,
                        name: finalName,
                        description,
                        path: pathValue,
                        size,
                        mimetype,
                        uploadedById: user.userId,
                        uploadedByName: user.name
                    }
                });
                logAction({
                    action: 'UPLOAD',
                    module: 'FILES',
                    target: category,
                    details: `Arquivo "${savedFile.name}" carregado na categoria "${category}".`,
                    severity: LogSeverity.MEDIA, // <-- Regra de Negócio: Criação é MEDIA
                    user: req.user
                });
            }
            return res.status(200).json(savedFile);
        } catch (error) {
            if (file) { await fs.unlink(file.path).catch(err => console.error("Falha ao limpar arquivo órfão após erro:", err)); }
            console.error('Erro durante upload:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async updateFile(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id: fileId } = req.params;
            const { name, description } = req.body;
            if (!name || !description) { return res.status(400).json({ message: 'Nome e descrição são obrigatórios.' }); }
            if (!user.permissions.includes('EDIT:DOCUMENTS')) { return res.status(403).json({ message: 'Acesso negado.' }); }
            const fileToUpdate = await prisma.file.findFirst({ where: { id: fileId, companyId: user.company.id } });
            if (!fileToUpdate) { return res.status(404).json({ message: 'Arquivo não encontrado.' }); }
            const updatedFile = await prisma.file.update({ where: { id: fileId }, data: { name, description } });
            logAction({
                action: 'UPDATE',
                module: 'FILES',
                target: updatedFile.category,
                details: `Metadados do arquivo "${updatedFile.name}" atualizados.`, // <-- MUDANÇA: ID Removido
                severity: LogSeverity.ALTA, // <-- MUDANÇA: Edição é ALTA
                user: req.user
            });
            return res.status(200).json(updatedFile);
        } catch (error) {
            console.error('Erro ao atualizar arquivo:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async deleteFile(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id: fileId } = req.params;
            if (!user.permissions.includes('DELETE:DOCUMENTS')) { return res.status(403).json({ message: 'Acesso negado.' }); }
            const fileToDelete = await prisma.file.findFirst({ where: { id: fileId, companyId: user.company.id } });
            if (!fileToDelete) { return res.status(404).json({ message: 'Arquivo não encontrado.' }); }
            await prisma.file.delete({ where: { id: fileId } });
            await fs.unlink(path.resolve(UPLOADS_FOLDER, fileToDelete.path)).catch(err => console.error(`Falha ao excluir arquivo físico: ${fileToDelete.path}`, err));
            logAction({
                action: 'DELETE',
                module: 'FILES',
                target: fileToDelete.category,
                details: `Arquivo "${fileToDelete.name}" foi excluído da categoria "${fileToDelete.category}".`, // <-- MUDANÇA: ID Removido
                severity: LogSeverity.ALTA, // <-- Regra de Negócio: OK
                user: req.user
            });
            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async serveFile(req: Request, res: Response): Promise<void> {
        try {
            const { user } = req;
            const { path: filePath } = req.params;
            const { action } = req.query;

            const file = await prisma.file.findFirst({ where: { path: filePath, companyId: user.company.id } });
            if (!file) { res.status(4404).json({ message: 'Arquivo não encontrado.' }); return; }

            const physicalPath = path.resolve(UPLOADS_FOLDER, file.path);

            if (action === 'download') {
                // ✅ NOVA REGRA DE LOG DE DOWNLOAD APLICADA
                logAction({
                    action: 'DOWNLOAD',
                    module: 'FILES',
                    target: file.category,
                    details: `Arquivo "${file.name}" foi baixado.`,
                    severity: LogSeverity.BAIXA, // <-- Regra de Negócio: OK
                    user: user
                });
                res.download(physicalPath, file.name);
            } else {
                // Ação de preview não gera log, conforme regra.
                res.sendFile(physicalPath);
            }
        } catch (error) {
            console.error('Erro ao servir o arquivo:', error);
            if (!res.headersSent) res.status(500).json({ message: 'Erro interno ao buscar o arquivo.' });
        }
    }
}