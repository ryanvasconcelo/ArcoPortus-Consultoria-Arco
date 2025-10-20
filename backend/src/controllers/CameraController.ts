// src/controllers/CameraController.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
// Importações Corrigidas
import { Prisma, Camera as PrismaCameraType } from '@prisma/client';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

type CameraData = Partial<PrismaCameraType>;

const UPLOADS_FOLDER = path.resolve(__dirname, '..', '..', 'uploads');

// --- FUNÇÃO AUXILIAR DE PARSING DE TEMPO ---
function parseRecordingTime(timeString: string | number | null | undefined, headerName: string): number | null {
    // Se o header já indica horas, trata como horas
    if (headerName.includes('horas')) {
        if (typeof timeString === 'number' && !isNaN(timeString) && timeString >= 0) {
            return timeString;
        }
        if (typeof timeString === 'string') {
            const parsedValue = parseFloat(timeString.replace(',', '.'));
            if (!isNaN(parsedValue) && parsedValue >= 0) { return parsedValue; }
        }
        return null;
    }
    // Se o header indica dias (ou formato misto)
    if (typeof timeString === 'number' && !isNaN(timeString) && timeString >= 0) {
        return timeString * 24; // Converte dias (decimais) para horas
    }
    if (typeof timeString !== 'string' || !timeString.trim()) {
        return null;
    }
    let totalHours = 0;
    const cleanedString = timeString.replace(',', '.');
    const dayMatch = cleanedString.match(/([\d.]+)\s*Dia/i);
    if (dayMatch && dayMatch[1]) {
        const days = parseFloat(dayMatch[1]);
        if (!isNaN(days)) { totalHours += days * 24; }
    }
    const hourMatch = cleanedString.match(/([\d.]+)\s*Hora/i);
    if (hourMatch && hourMatch[1]) {
        const hours = parseFloat(hourMatch[1]);
        if (!isNaN(hours)) { totalHours += hours; }
    }
    if (totalHours === 0) {
        const parsedValue = parseFloat(cleanedString);
        if (!isNaN(parsedValue) && parsedValue >= 0) {
            console.warn(`Formato de tempo "${timeString}" não reconhecido, tratando como dias decimais.`);
            totalHours = parsedValue * 24;
        }
    }
    return totalHours > 0 ? totalHours : null;
}
// --- FIM DA FUNÇÃO AUXILIAR ---

export class CameraController {

    // Método LISTAR (Nome 'listCameras' conforme rota)
    public async listCameras(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição listCameras recebida ---');
        try {
            const { user } = req;
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) {
                console.log(`ListCameras falhou: Permissão '${requiredPermission}' negada.`);
                return res.status(403).json({ message: 'Acesso negado.' });
            }
            const cameras = await prisma.camera.findMany({
                where: { companyId: user.company.id },
                orderBy: { name: 'asc' }
            });
            console.log(`${cameras.length} câmeras encontradas.`);
            return res.status(200).json(cameras);
        } catch (error) {
            console.error('--- ERRO CRÍTICO em listCameras ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    // Método SHOW (Nome 'show' conforme rota)
    public async show(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição show camera recebida ---');
        try {
            const { user } = req;
            const { id: cameraId } = req.params;
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) { return res.status(403).json({ message: 'Acesso negado.' }); }
            const camera = await prisma.camera.findFirst({ where: { id: cameraId, companyId: user.company.id } });
            if (!camera) { return res.status(404).json({ message: 'Câmera não encontrada.' }); }
            return res.status(200).json(camera);
        } catch (error) { console.error('--- ERRO CRÍTICO em show camera ---', error); return res.status(500).json({ message: 'Erro interno do servidor.' }); }
    }

    // Método CREATE (Nome 'create' conforme rota, Permissão 'CREATE:CFTV')
    public async create(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição create recebida ---');
        try {
            const { user } = req;
            const cameraData: CameraData = req.body;
            const actionPermission = 'CREATE:DOCUMENTS'; // Permissão correta
            if (!user.permissions.includes(actionPermission)) { return res.status(403).json({ message: 'Acesso negado.' }); }
            if (!cameraData.name) { return res.status(400).json({ message: 'Nome da câmera é obrigatório.' }); }

            let ipAddress = cameraData.ipAddress;
            if (ipAddress === "") { ipAddress = null; }

            let recordingHours: number | null = null;
            if (cameraData.hasOwnProperty('recordingHours') && typeof cameraData.recordingHours === 'number' && !isNaN(cameraData.recordingHours)) {
                recordingHours = cameraData.recordingHours >= 0 ? cameraData.recordingHours : null;
            } else if (cameraData.hasOwnProperty('recordingHours') && cameraData.recordingHours === null) {
                recordingHours = null;
            }

            const newCamera = await prisma.camera.create({
                data: {
                    name: cameraData.name, location: cameraData.location ?? null, ipAddress: ipAddress,
                    model: cameraData.model ?? null, isActive: cameraData.isActive ?? true,
                    fabricante: cameraData.fabricante ?? null, businessUnit: cameraData.businessUnit ?? null,
                    type: cameraData.type ?? null, area: cameraData.area ?? null,
                    hasAnalytics: cameraData.hasAnalytics ?? false, recordingHours: recordingHours,
                    companyId: user.company.id,
                }
            });
            console.log('Câmera criada:', newCamera.id);
            return res.status(201).json(newCamera);
        } catch (error) {
            console.error("Erro ao criar câmera:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = (error.meta as any)?.target;
                if (target && target.includes('ipAddress')) { return res.status(409).json({ message: "Já existe uma câmera com este endereço IP." }); }
                return res.status(409).json({ message: "Falha ao criar: Violação de campo único.", details: target });
            }
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    // Método UPDATE (Nome 'update' conforme rota, Permissão 'EDIT:CFTV')
    public async update(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição update recebida ---');
        try {
            const { user } = req;
            const { id: cameraId } = req.params;
            const cameraData: CameraData = req.body;

            const actionPermission = 'EDIT:DOCUMENTS'; // Permissão correta
            if (!user.permissions.includes(actionPermission)) { return res.status(403).json({ message: 'Acesso negado.' }); }

            const cameraToUpdate = await prisma.camera.findFirst({ where: { id: cameraId, companyId: user.company.id } });
            if (!cameraToUpdate) { return res.status(404).json({ message: 'Câmera não encontrada.' }); }

            let ipAddress = cameraData.ipAddress;
            if (cameraData.hasOwnProperty('ipAddress')) { ipAddress = ipAddress === "" ? null : ipAddress; }
            else { ipAddress = cameraToUpdate.ipAddress; }

            let deactivatedAt: Date | null | undefined = undefined;
            if (cameraData.hasOwnProperty('isActive')) {
                if (cameraData.isActive === false && cameraToUpdate.isActive === true) { deactivatedAt = new Date(); }
                else if (cameraData.isActive === true && cameraToUpdate.isActive === false) { deactivatedAt = null; }
                else { deactivatedAt = cameraToUpdate.deactivatedAt; }
            }

            let recordingHours: number | null | undefined = undefined;
            if (cameraData.hasOwnProperty('recordingHours')) {
                if (typeof cameraData.recordingHours === 'number' && !isNaN(cameraData.recordingHours) && cameraData.recordingHours >= 0) { recordingHours = cameraData.recordingHours; }
                else if (cameraData.recordingHours === null) { recordingHours = null; }
            }

            const updatedCamera = await prisma.camera.update({
                where: { id: cameraId },
                data: {
                    name: cameraData.name ?? undefined, location: cameraData.location !== undefined ? cameraData.location : undefined,
                    ipAddress: cameraData.hasOwnProperty('ipAddress') ? ipAddress : undefined, model: cameraData.model ?? undefined,
                    isActive: cameraData.isActive ?? undefined, fabricante: cameraData.fabricante ?? undefined,
                    businessUnit: cameraData.businessUnit ?? undefined, type: cameraData.type ?? undefined,
                    area: cameraData.area ?? undefined, hasAnalytics: cameraData.hasAnalytics ?? undefined,
                    recordingHours: recordingHours, deactivatedAt: deactivatedAt !== undefined ? deactivatedAt : undefined,
                },
            });
            console.log('Câmera atualizada:', updatedCamera.id);
            return res.status(200).json(updatedCamera);
        } catch (error) {
            console.error("Erro ao atualizar câmera:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = (error.meta as any)?.target;
                if (target && target.includes('ipAddress')) { return res.status(409).json({ message: "Já existe outra câmera com este endereço IP." }); }
                return res.status(409).json({ message: "Falha ao atualizar: Violação de campo único.", details: target });
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                return res.status(404).json({ message: 'Câmera não encontrada para atualização.' });
            }
            return res.status(500).json({ message: 'Erro interno do servidor ao atualizar câmera.' });
        }
    }

    // Método DELETE (Nome 'delete' conforme rota, Permissão 'DELETE:CFTV')
    public async delete(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição delete recebida ---');
        try {
            const { user } = req;
            const { id: cameraId } = req.params;

            const actionPermission = 'DELETE:DOCUMENTS'; // Permissão correta
            if (!user.permissions.includes(actionPermission)) { return res.status(403).json({ message: 'Acesso negado.' }); }

            const cameraExists = await prisma.camera.findFirst({ where: { id: cameraId, companyId: user.company.id } });
            if (!cameraExists) { return res.status(404).json({ message: 'Câmera não encontrada.' }); }

            await prisma.camera.delete({ where: { id: cameraId } });
            console.log('Câmera deletada:', cameraId);
            return res.status(204).send();
        } catch (error) {
            console.error('--- ERRO CRÍTICO em delete ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao excluir câmera.' });
        }
    }

    // Método IMPORT (CORRIGIDO: usa findFirst + create/update ao invés de upsert)
    public async importFromXLSX(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição importFromXLSX recebida ---');
        const file = req.file;
        const cleanupFile = async () => {
            if (file?.path) { await fs.unlink(file.path).catch(err => console.error("Falha ao limpar:", file.path, err)); }
        };

        try {
            const { user } = req;
            if (!file || !file.path) { return res.status(400).json({ message: 'Arquivo não enviado.' }); }
            if (!user.permissions.includes('CREATE:DOCUMENTS')) { await cleanupFile(); return res.status(403).json({ message: 'Acesso negado.' }); }

            const companyId = user.company.id;
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            if (data.length < 2) { await cleanupFile(); return res.status(400).json({ message: 'Planilha vazia.' }); }

            const headers = data[0] as string[];
            const headerMap: { [key: string]: string } = {
                'nº câmera': 'name', 'local de instalação': 'location', 'em funcionamento ?': 'isActive',
                'ip': 'ipAddress', 'modelo': 'model', 'fabricante': 'fabricante',
                'unidade de negócio': 'businessUnit', 'tipo': 'type', 'área externa / interna': 'area',
                'possui analítico?': 'hasAnalytics', 'dias gravados': 'recordingTime',
                'dias de gravação': 'recordingTime', 'horas de gravação': 'recordingTime'
            };

            const indices: { [key: string]: number } = {};
            let nameIndex = -1;
            let timeHeaderIndex = -1;

            headers.forEach((header, index) => {
                const norm = String(header || '').toLowerCase().trim();
                const field = headerMap[norm];
                if (field) {
                    indices[field] = index;
                    if (field === 'name') nameIndex = index;
                    if (field === 'recordingTime') timeHeaderIndex = index;
                }
            });
            if (nameIndex === -1) { await cleanupFile(); return res.status(400).json({ message: 'Coluna "Nº Câmera" não encontrada.' }); }

            console.log(`Lidos ${data.length - 1} registros.`);
            const results = { created: [] as string[], updated: [] as string[], failed: [] as { name: string; row: number; error: string }[] };
            const timeHeaderName = timeHeaderIndex !== -1 ? String(headers[timeHeaderIndex]).toLowerCase() : "";

            for (let i = 1; i < data.length; i++) {
                const row = data[i] as any[];
                const cameraName = row[nameIndex]?.toString()?.trim();
                const rowNumber = i + 1;
                if (!cameraName) { results.failed.push({ name: `Linha ${rowNumber}`, row: rowNumber, error: 'Nome ausente.' }); continue; }

                try {
                    const timeFromSheet = indices.recordingTime !== undefined ? row[indices.recordingTime] : null;
                    const recordingHoursValue = parseRecordingTime(timeFromSheet, timeHeaderName);

                    console.log(`Linha ${rowNumber}: "${cameraName}", Tempo Lido: "${timeFromSheet}", Cabeçalho: "${timeHeaderName}", Horas Calculadas: ${recordingHoursValue}`);

                    const parseBoolean = (value: any): boolean => ['sim', 'yes', 'true', '1'].includes(String(value || '').trim().toLowerCase());
                    const isActiveValue = indices.isActive !== undefined ? !(['não', 'nao', 'no', 'false', '0'].includes(String(row[indices.isActive]).trim().toLowerCase())) : true;
                    let ipAddressValue = indices.ipAddress !== undefined ? (row[indices.ipAddress]?.toString()?.trim() || null) : null;
                    if (ipAddressValue === "") ipAddressValue = null;

                    const cameraDataForDb = {
                        location: indices.location !== undefined ? (row[indices.location]?.toString()?.trim() || null) : null,
                        ipAddress: ipAddressValue,
                        model: indices.model !== undefined ? (row[indices.model]?.toString()?.trim() || null) : null,
                        fabricante: indices.fabricante !== undefined ? (row[indices.fabricante]?.toString()?.trim() || null) : null,
                        businessUnit: indices.businessUnit !== undefined ? (row[indices.businessUnit]?.toString()?.trim() || null) : null,
                        type: indices.type !== undefined ? (row[indices.type]?.toString()?.trim() || null) : null,
                        area: indices.area !== undefined ? (row[indices.area]?.toString()?.trim() || null) : null,
                        hasAnalytics: indices.hasAnalytics !== undefined ? parseBoolean(row[indices.hasAnalytics]) : false,
                        recordingHours: recordingHoursValue,
                        isActive: isActiveValue,
                    };

                    // --- CORRIGIDO: Buscar câmera existente manualmente ---
                    const existingCamera = await prisma.camera.findFirst({
                        where: {
                            companyId: companyId,
                            name: cameraName,
                            location: cameraDataForDb.location  // ← Adicione esta linha
                        }
                    });

                    let result;
                    if (existingCamera) {
                        // Atualizar câmera existente
                        result = await prisma.camera.update({
                            where: { id: existingCamera.id },
                            data: cameraDataForDb
                        });
                        results.updated.push(cameraName);
                    } else {
                        // Criar nova câmera
                        result = await prisma.camera.create({
                            data: {
                                ...cameraDataForDb,
                                name: cameraName,
                                companyId: companyId
                            }
                        });
                        results.created.push(cameraName);
                    }

                } catch (dbError: any) {
                    console.error(`Erro linha ${rowNumber} (${cameraName}):`, dbError);
                    let errorMessage = 'Erro desconhecido.';
                    if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
                        if (dbError.code === 'P2002') {
                            const target = (dbError.meta as any)?.target;
                            if (target && target.includes('ipAddress')) {
                                errorMessage = `IP duplicado: ${ipAddressValue}`;
                            } else {
                                errorMessage = `Conflito de dados únicos. ${dbError.meta?.target}`;
                            }
                        } else {
                            errorMessage = `Erro Prisma ${dbError.code}`;
                        }
                    }
                    else if (dbError instanceof Prisma.PrismaClientValidationError) {
                        errorMessage = 'Erro de validação.';
                    }
                    results.failed.push({ name: cameraName, row: rowNumber, error: errorMessage });
                }
            } // Fim for

            console.log('Processamento concluído.', results);
            await cleanupFile();
            let message = `${results.created.length} criadas.`;
            if (results.updated.length > 0) message += ` ${results.updated.length} atualizadas.`;
            if (results.failed.length > 0) message += ` ${results.failed.length} falharam.`;
            const status = results.failed.length > 0 ? 207 : 200;
            return res.status(status).json({ message, details: results });

        } catch (error: any) {
            console.error('--- ERRO CRÍTICO GERAL import ---', error);
            await cleanupFile();
            if (error instanceof Error && (error.message.includes('Sheet') || error.message.includes('File reading error'))) {
                return res.status(400).json({ message: 'Erro ao ler planilha.' });
            }
            return res.status(500).json({ message: 'Erro interno inesperado.' });
        }
    }


    // Método EXPORT (Com select explícito e campo recordingHours)
    public async exportToXLSX(req: Request, res: Response): Promise<void> {
        console.log('--- Requisição exportToXLSX recebida ---');
        try {
            const { user } = req;
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) { res.status(403).json({ message: 'Acesso negado.' }); return; }

            const cameras = await prisma.camera.findMany({
                where: { companyId: user.company.id },
                orderBy: { name: 'asc' },
                select: {
                    name: true, location: true, isActive: true, ipAddress: true, model: true,
                    fabricante: true, businessUnit: true, type: true, area: true,
                    hasAnalytics: true, recordingHours: true, deactivatedAt: true
                }
            });

            const dataToExport = cameras.map((cam) => ({
                'Nº Câmera': cam.name,
                'Local de Instalação': cam.location,
                'Em Funcionamento ?': cam.isActive ? 'Sim' : 'Não',
                'IP': cam.ipAddress,
                'Modelo': cam.model,
                'Fabricante': cam.fabricante,
                'Unidade de Negócio': cam.businessUnit,
                'Tipo': cam.type,
                'Área Externa / Interna': cam.area,
                'POSSUI ANÁLITICO?': cam.hasAnalytics ? 'Sim' : 'Não',
                'Horas de Gravação': cam.recordingHours !== null && cam.recordingHours !== undefined ? cam.recordingHours.toFixed(2) : '',
                'Data Desativação': cam.deactivatedAt ? new Date(cam.deactivatedAt).toLocaleDateString('pt-BR') : '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Câmeras');
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            res.setHeader('Content-Disposition', 'attachment; filename="export_cameras.xlsx"');
            res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
            console.log('Exportação concluída.');

        } catch (error) {
            console.error("Erro ao exportar para XLSX:", error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Erro interno ao gerar o arquivo.' });
                return;
            }
        }
    }

    // --- NOSSO ÚLTIMO ATO: DELETAR TODAS AS CÂMERAS ---
    public async deleteAllCameras(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição deleteAllCameras recebida ---');
        try {
            const { user } = req;

            // --- PERMISSÃO SUPER CRÍTICA ---
            // Garante que o usuário tem a permissão de delete para esta área
            const requiredPermission = 'DELETE:CFTV';
            if (!user.permissions.includes(requiredPermission)) {
                console.log(`DeleteAll falhou: Permissão '${requiredPermission}' negada.`);
                return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente para exclusão em massa.' });
            }

            // AÇÃO DE DESTRUIÇÃO EM MASSA - Focada apenas na companyId do usuário
            // Isso garante que um usuário da Empresa A NUNCA delete dados da Empresa B
            console.log(`Excluindo todas as câmeras da companyId: ${user.company.id}`);
            const deleteResult = await prisma.camera.deleteMany({
                where: {
                    companyId: user.company.id,
                }
            });

            console.log(`${deleteResult.count} câmeras foram deletadas para a companyId: ${user.company.id}`);

            // Retorna o número de câmeras deletadas
            return res.status(200).json({
                message: `${deleteResult.count} câmeras foram deletadas com sucesso.`,
                count: deleteResult.count
            });

        } catch (error) {
            console.error('--- ERRO CRÍTICO em deleteAllCameras ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao excluir as câmeras.' });
        }
    }
} // Fim da classe