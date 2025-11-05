import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma, Camera as PrismaCameraType } from '@prisma/client';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { logAction } from '../services/audit.service';
import { LogSeverity } from '@prisma/client';

type CameraData = Partial<PrismaCameraType>;

const UPLOADS_FOLDER = path.resolve(__dirname, '..', '..', 'uploads');

// --- FUNÇÃO AUXILIAR DE PARSING DE TEMPO ---
function parseRecordingTime(timeString: string | number | null | undefined, headerName: string): number | null {
    if (headerName.includes('horas')) {
        if (typeof timeString === 'number' && !isNaN(timeString) && timeString >= 0) return timeString;
        if (typeof timeString === 'string') {
            const parsedValue = parseFloat(timeString.replace(',', '.'));
            if (!isNaN(parsedValue) && parsedValue >= 0) return parsedValue;
        }
        return null;
    }
    if (typeof timeString === 'number' && !isNaN(timeString) && timeString >= 0) return timeString * 24;
    if (typeof timeString !== 'string' || !timeString.trim()) return null;
    let totalHours = 0;
    const cleanedString = timeString.replace(',', '.');
    const dayMatch = cleanedString.match(/([\d.]+)\s*Dia/i);
    if (dayMatch?.[1]) {
        const days = parseFloat(dayMatch[1]);
        if (!isNaN(days)) totalHours += days * 24;
    }
    const hourMatch = cleanedString.match(/([\d.]+)\s*Hora/i);
    if (hourMatch?.[1]) {
        const hours = parseFloat(hourMatch[1]);
        if (!isNaN(hours)) totalHours += hours;
    }
    if (totalHours === 0) {
        const parsedValue = parseFloat(cleanedString);
        if (!isNaN(parsedValue) && parsedValue >= 0) totalHours = parsedValue * 24;
    }
    return totalHours > 0 ? totalHours : null;
}
// --- FIM DA FUNÇÃO AUXILIAR ---

export class CameraController {

    public async listCameras(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado.' });
            }
            const cameras = await prisma.camera.findMany({
                where: { companyId: user.company.id },
                orderBy: { name: 'asc' }
            });
            return res.status(200).json(cameras);
        } catch (error) {
            console.error('--- ERRO CRÍTICO em listCameras ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async show(req: Request, res: Response): Promise<Response> {
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

    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const cameraData: CameraData = req.body;

            // ✅ REGRA "CHAVE DUPLA" APLICADA
            const actionPermission = 'CREATE:DOCUMENTS';
            const viewPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(viewPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão de criação e acesso ao módulo CFTV são necessárias.' });
            }

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

            logAction({
                action: 'CREATE',
                module: 'CFTV',
                target: newCamera.name, // <-- MUDANÇA: Alvo é o nome da câmera
                details: `Câmera "${newCamera.name}" foi criada.`,
                severity: LogSeverity.MEDIA, // <-- Regra de Negócio: OK
                user: req.user,
            });

            return res.status(201).json(newCamera);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = (error.meta as any)?.target;
                if (target?.includes('ipAddress')) { return res.status(409).json({ message: "Já existe uma câmera com este endereço IP." }); }
                return res.status(409).json({ message: "Falha ao criar: Violação de campo único.", details: target });
            }
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id: cameraId } = req.params;
            const cameraData: CameraData = req.body;

            // ✅ REGRA "CHAVE DUPLA" APLICADA
            const actionPermission = 'EDIT:DOCUMENTS';
            const viewPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(viewPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão de edição e acesso ao módulo CFTV são necessárias.' });
            }

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

            logAction({
                action: 'UPDATE',
                module: 'CFTV',
                target: updatedCamera.name, // <-- MUDANÇA: Alvo é o nome da câmera
                details: `Câmera "${updatedCamera.name}" foi atualizada.`, // <-- MUDANÇA: ID Removido
                severity: LogSeverity.ALTA, // <-- MUDANÇA: Edição é ALTA
                user: req.user,
            });

            return res.status(200).json(updatedCamera);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                return res.status(409).json({ message: "Já existe outra câmera com este endereço IP." });
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                return res.status(404).json({ message: 'Câmera não encontrada para atualização.' });
            }
            return res.status(500).json({ message: 'Erro interno do servidor ao atualizar câmera.' });
        }
    }

    public async deleteMany(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { ids } = req.body; // Espera um array de IDs no corpo da requisição

            // ✅ REGRA "CHAVE DUPLA" APLICADA
            const actionPermission = 'DELETE:DOCUMENTS';
            const viewPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(viewPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão de exclusão e acesso ao módulo CFTV são necessárias.' });
            }

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'Nenhum ID de câmera fornecido para exclusão.' });
            }

            // 1. Verificar se todas as câmeras pertencem à empresa do usuário
            const camerasToDelete = await prisma.camera.findMany({
                where: {
                    id: { in: ids },
                    companyId: user.company.id
                },
                select: { id: true, name: true }
            });

            if (camerasToDelete.length !== ids.length) {
                // Identificar quais IDs não foram encontrados ou não pertencem ao usuário
                const foundIds = camerasToDelete.map(c => c.id);
                const notFoundIds = ids.filter((id: string) => !foundIds.includes(id));
                return res.status(404).json({ message: `Algumas câmeras não foram encontradas ou você não tem permissão para excluí-las. IDs não encontrados: ${notFoundIds.join(', ')}` });
            }

            // 2. Excluir em massa
            const result = await prisma.camera.deleteMany({
                where: {
                    id: { in: ids },
                    companyId: user.company.id
                }
            });

            // 3. Logar a ação
            logAction({
                action: 'DELETE_MANY',
                module: 'CFTV',
                target: `Exclusão em massa de ${result.count} câmeras`,
                details: `Exclusão em massa de ${result.count} câmeras. IDs: ${ids.join(', ')}`,
                severity: LogSeverity.ALTA,
                user: req.user,
            });

            return res.status(200).json({ message: `${result.count} câmeras excluídas com sucesso.` });

        } catch (error) {
            console.error('--- ERRO CRÍTICO em deleteMany cameras ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao excluir câmeras em massa.' });
        }
    }

    public async downloadTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado.' });
            }

            // 1. Definir o template de dados (Exemplo de estrutura)
            const templateData = [
                {
                    'Nome da Câmera': 'Câmera 01 - Pátio',
                    'Local de Instalação': 'Pátio Principal',
                    'Endereço IP': '192.168.1.10',
                    'Modelo': 'Hikvision DS-2CD2T47G2-L',
                    'Fabricante': 'Hikvision',
                    'Unidade de Negócio': 'Operações',
                    'Tipo': 'Dome',
                    'Área': 'Externa',
                    'Ativa (Sim/Não)': 'Sim',
                    'Horas de Gravação (Número)': 720,
                    'Possui Analítico (Sim/Não)': 'Não',
                },
                {
                    'Nome da Câmera': 'Câmera 02 - Entrada',
                    'Local de Instalação': 'Portaria',
                    'Endereço IP': '192.168.1.11',
                    'Modelo': 'Intelbras VIP 7220',
                    'Fabricante': 'Intelbras',
                    'Unidade de Negócio': 'Segurança',
                    'Tipo': 'Bullet',
                    'Área': 'Interna',
                    'Ativa (Sim/Não)': 'Sim',
                    'Horas de Gravação (Número)': 360,
                    'Possui Analítico (Sim/Não)': 'Sim',
                },
            ];

            // 2. Criar o Workbook e a Worksheet
            const workSheet = XLSX.utils.json_to_sheet(templateData);
            const workBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workBook, workSheet, 'Template');

            // 3. Gerar o buffer do arquivo Excel
            const excelBuffer = XLSX.write(workBook, { bookType: 'xlsx', type: 'buffer' });

            // 4. Configurar a resposta HTTP
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=template_importacao_cameras.xlsx');

            // 5. Logar a ação
            logAction({
                action: 'DOWNLOAD_TEMPLATE',
                module: 'CFTV',
                target: `Template de Importação de Câmeras`,
                details: `Download do template de importação de câmeras.`,
                severity: LogSeverity.BAIXA,
                user: req.user,
            });

            return res.send(excelBuffer);

        } catch (error) {
            console.error('--- ERRO CRÍTICO em downloadTemplate ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao gerar template.' });
        }
    }

    public async exportCameras(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado.' });
            }

            const cameras = await prisma.camera.findMany({
                where: { companyId: user.company.id },
                orderBy: { name: 'asc' }
            });

            if (cameras.length === 0) {
                return res.status(404).json({ message: 'Nenhuma câmera encontrada para exportação.' });
            }

            // 1. Preparar os dados para o Excel
            const dataToExport = cameras.map(camera => ({
                ID: camera.id,
                Nome: camera.name,
                Localização: camera.location,
                'Endereço IP': camera.ipAddress,
                Modelo: camera.model,
                'Unidade de Negócio': camera.businessUnit,
                Fabricante: camera.fabricante,
                Tipo: camera.type,
                Área: camera.area,
                'Ativa': camera.isActive ? 'Sim' : 'Não',
                'Horas de Gravação': camera.recordingHours,
                'Possui Análise': camera.hasAnalytics ? 'Sim' : 'Não',
                'Criado em': camera.createdAt.toISOString(),
                'Atualizado em': camera.updatedAt.toISOString(),
            }));

            // 2. Criar o Workbook e a Worksheet
            const workSheet = XLSX.utils.json_to_sheet(dataToExport);
            const workBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workBook, workSheet, 'Cameras');

            // 3. Gerar o buffer do arquivo Excel
            const excelBuffer = XLSX.write(workBook, { bookType: 'xlsx', type: 'buffer' });

            // 4. Configurar a resposta HTTP
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=cameras_export.xlsx');

            // 5. Logar a ação
            logAction({
                action: 'EXPORT',
                module: 'CFTV',
                target: `Exportação de ${cameras.length} câmeras`,
                details: `Exportação de ${cameras.length} câmeras para Excel.`,
                severity: LogSeverity.BAIXA,
                user: req.user,
            });

            return res.send(excelBuffer);

        } catch (error) {
            console.error('--- ERRO CRÍTICO em exportCameras ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao exportar câmeras.' });
        }
    }

    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id: cameraId } = req.params;

            // ✅ REGRA "CHAVE DUPLA" APLICADA
            const actionPermission = 'DELETE:DOCUMENTS';
            const viewPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(viewPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão de exclusão e acesso ao módulo CFTV são necessárias.' });
            }

            const cameraToDelete = await prisma.camera.findFirst({ where: { id: cameraId, companyId: user.company.id } });
            if (!cameraToDelete) { return res.status(404).json({ message: 'Câmera não encontrada.' }); }

            await prisma.camera.delete({ where: { id: cameraId } });

            logAction({
                action: 'DELETE',
                module: 'CFTV',
                target: cameraToDelete.name, // <-- MUDANÇA: Alvo é o nome da câmera
                details: `Câmera "${cameraToDelete.name}" foi excluída.`, // <-- MUDANÇA: ID Removido
                severity: LogSeverity.ALTA, // <-- Regra de Negócio: OK
                user: req.user,
            });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno do servidor ao excluir câmera.' });
        }
    }

    public async importFromXLSX(req: Request, res: Response): Promise<Response> {
        const file = req.file;
        const cleanupFile = async () => { if (file?.path) { await fs.unlink(file.path).catch(err => console.error("Falha ao limpar:", file.path, err)); } };

        try {
            const { user } = req;
            if (!file || !file.path) { return res.status(400).json({ message: 'Arquivo não enviado.' }); }

            // ✅ REGRA "CHAVE DUPLA" APLICADA
            if (!user.permissions.includes('CREATE:DOCUMENTS') || !user.permissions.includes('VIEW:CFTV')) {
                await cleanupFile();
                return res.status(403).json({ message: 'Acesso negado. Permissão de criação e acesso ao módulo CFTV são necessárias.' });
            }

            const companyId = user.company.id;
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            if (data.length < 2) { await cleanupFile(); return res.status(400).json({ message: 'Planilha vazia.' }); }

            const headers = data[0] as string[];
            const headerMap: { [key: string]: string } = { 'nº câmera': 'name', 'local de instalação': 'location', 'em funcionamento ?': 'isActive', 'ip': 'ipAddress', 'modelo': 'model', 'fabricante': 'fabricante', 'unidade de negócio': 'businessUnit', 'tipo': 'type', 'área externa / interna': 'area', 'possui analítico?': 'hasAnalytics', 'dias gravados': 'recordingTime', 'dias de gravação': 'recordingTime', 'horas de gravação': 'recordingTime' };
            const indices: { [key: string]: number } = {};
            let nameIndex = -1;
            let timeHeaderIndex = -1;

            headers.forEach((header, index) => {
                const norm = String(header || '').toLowerCase().trim();
                const field = headerMap[norm];
                if (field) { indices[field] = index; if (field === 'name') nameIndex = index; if (field === 'recordingTime') timeHeaderIndex = index; }
            });
            if (nameIndex === -1) { await cleanupFile(); return res.status(400).json({ message: 'Coluna "Nº Câmera" não encontrada.' }); }

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

                    const existingCamera = await prisma.camera.findFirst({
                        where: { companyId: companyId, name: cameraName, location: cameraDataForDb.location }
                    });

                    if (existingCamera) {
                        await prisma.camera.update({ where: { id: existingCamera.id }, data: cameraDataForDb });
                        results.updated.push(cameraName);
                    } else {
                        await prisma.camera.create({ data: { ...cameraDataForDb, name: cameraName, companyId: companyId } });
                        results.created.push(cameraName);
                    }
                } catch (dbError: any) {
                    let errorMessage = 'Erro desconhecido.';
                    if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
                        if (dbError.code === 'P2002') { errorMessage = `Conflito de dados únicos. ${dbError.meta?.target}`; }
                        else { errorMessage = `Erro Prisma ${dbError.code}`; }
                    }
                    results.failed.push({ name: cameraName, row: rowNumber, error: errorMessage });
                }
            }

            await cleanupFile();
            logAction({
                action: 'IMPORT',
                module: 'CFTV',
                target: file.originalname, // <-- MUDANÇA: Alvo é o nome do arquivo
                details: `Importação de câmeras: ${results.created.length} criadas, ${results.updated.length} atualizadas, ${results.failed.length} falharam.`,
                severity: LogSeverity.MEDIA, // <-- Regra de Negócio: Criação é MEDIA
                user: req.user,
            });

            let message = `${results.created.length} criadas.`;
            if (results.updated.length > 0) message += ` ${results.updated.length} atualizadas.`;
            if (results.failed.length > 0) message += ` ${results.failed.length} falharam.`;
            const status = results.failed.length > 0 ? 207 : 200;
            return res.status(status).json({ message, details: results });

        } catch (error: any) {
            await cleanupFile();
            logAction({
                action: 'IMPORT_FAIL',
                module: 'CFTV',
                details: `Falha crítica na importação de câmeras. Erro: ${error.message}`,
                severity: LogSeverity.ALTA,
                user: req.user,
            });
            return res.status(500).json({ message: 'Erro interno inesperado.' });
        }
    }

    public async exportToXLSX(req: Request, res: Response): Promise<void> {
        try {
            const { user } = req;
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) { res.status(403).json({ message: 'Acesso negado.' }); return; }

            const cameras = await prisma.camera.findMany({
                where: { companyId: user.company.id },
                orderBy: { name: 'asc' },
                select: { name: true, location: true, isActive: true, ipAddress: true, model: true, fabricante: true, businessUnit: true, type: true, area: true, hasAnalytics: true, recordingHours: true, deactivatedAt: true }
            });

            const dataToExport = cameras.map((cam) => ({
                'Nº Câmera': cam.name, 'Local de Instalação': cam.location, 'Em Funcionamento ?': cam.isActive ? 'Sim' : 'Não',
                'IP': cam.ipAddress, 'Modelo': cam.model, 'Fabricante': cam.fabricante, 'Unidade de Negócio': cam.businessUnit,
                'Tipo': cam.type, 'Área Externa / Interna': cam.area, 'POSSUI ANÁLITICO?': cam.hasAnalytics ? 'Sim' : 'Não',
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

            logAction({
                action: 'EXPORT',
                module: 'CFTV',
                target: 'Exportação XLSX', // <-- MUDANÇA: Alvo genérico
                details: `Exportou a lista de ${cameras.length} câmeras para XLSX.`,
                severity: LogSeverity.BAIXA, // <-- Regra de Negócio: Download é BAIXA
                user: req.user,
            });
        } catch (error) {
            console.error("Erro ao exportar para XLSX:", error);
            if (!res.headersSent) { res.status(500).json({ message: 'Erro interno ao gerar o arquivo.' }); }
        }
    }

    public async deleteAllCameras(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;

            // ✅ REGRA "CHAVE DUPLA" ESPECIAL PARA AÇÃO CRÍTICA
            const actionPermission = 'DELETE:CFTV'; // Permissão específica e perigosa
            const viewPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(viewPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão especial para exclusão em massa é necessária.' });
            }

            const deleteResult = await prisma.camera.deleteMany({
                where: { companyId: user.company.id }
            });

            logAction({
                action: 'DELETE_ALL',
                module: 'CFTV',
                target: 'Todas as Câmeras', // <-- MUDANÇA: Alvo genérico
                details: `Exclusão em massa de ${deleteResult.count} câmeras executada.`,
                severity: LogSeverity.ALTA, // <-- Regra de Negócio: OK
                user: req.user,
            });

            return res.status(200).json({
                message: `${deleteResult.count} câmeras foram deletadas com sucesso.`,
                count: deleteResult.count
            });
        } catch (error) {
            console.error('--- ERRO CRÍTICO em deleteAllCameras ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao excluir as câmeras.' });
        }
    }
}