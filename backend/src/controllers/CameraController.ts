// src/controllers/CameraController.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs'; // <--- GARANTA QUE ESTA LINHA EXISTA
import * as XLSX from 'xlsx'; // Nossa nova ferramenta para falar "Excel"
export class CameraController {

    // Método para LISTAR todas as câmeras da empresa
    public async list(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;

            // APLICANDO A "CONSTITUIÇÃO" (RBAC)
            const requiredPermission = 'VIEW:CFTV'; // Permissão específica para câmeras
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado.' });
            }

            // APLICANDO A REGRA MESTRA (Multi-Tenancy)
            const cameras = await prisma.camera.findMany({
                where: {
                    companyId: user.company.id,
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });

            return res.status(200).json(cameras);

        } catch (error) {
            console.error('Erro ao listar câmeras:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async show(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id } = req.params;

            // ---> ADICIONE ESTA VERIFICAÇÃO <---
            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado.' });
            }

            const camera = await prisma.camera.findFirst({
                where: { id, companyId: user.company.id },
            });

            if (!camera) {
                return res.status(404).json({ message: 'Câmera não encontrada.' });
            }
            return res.status(200).json(camera);
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async create(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            let { name, location, ipAddress, model, isActive, ...rest } = req.body;

            const actionPermission = 'CREATE:DOCUMENTS';
            const areaPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(areaPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissões insuficientes para esta área.' });
            }

            // ---> A LÓGICA DE NULIFICAÇÃO <---
            if (ipAddress === "") {
                ipAddress = null;
            }

            const newCamera = await prisma.camera.create({
                data: {
                    name,
                    location,
                    ipAddress, // Agora será null se estiver vazio
                    model,
                    isActive,
                    ...rest,
                    companyId: user.company.id,
                },
            });
            return res.status(201).json(newCamera);
        } catch (error) { // O erro aqui também é 'unknown'
            console.error("Erro ao criar câmera:", error);
            // Verificação de erro para o 'create'
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
                return res.status(409).json({ message: "Já existe uma câmera com este endereço IP." });
            }
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    // PATCH /api/cameras/:id - Atualizar uma câmera (com lógica de nulificação e tratamento de erro corrigido)
    public async update(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id } = req.params;
            let { name, location, ipAddress, model, isActive, fabricante, ...rest } = req.body;

            const actionPermission = 'EDIT:DOCUMENTS';
            const areaPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(areaPermission)) {
                return res.status(403).json({ message: 'Acesso negado.' });
            }

            const cameraToUpdate = await prisma.camera.findFirst({
                where: { id, companyId: user.company.id },
            });

            if (!cameraToUpdate) {
                return res.status(404).json({ message: 'Câmera não encontrada.' });
            }

            // ---> LÓGICA DE NULIFICAÇÃO PARA UPDATE <---
            if (ipAddress === "") {
                ipAddress = null;
            }

            let deactivatedAt: Date | null = cameraToUpdate.deactivatedAt;
            if (isActive === false && cameraToUpdate.isActive === true) {
                deactivatedAt = new Date();
            } else if (isActive === true && cameraToUpdate.isActive === false) {
                deactivatedAt = null;
            }

            const updatedCamera = await prisma.camera.update({
                where: { id },
                data: {
                    name, location, ipAddress, model, isActive, fabricante,
                    ...rest,
                    deactivatedAt,
                },
            });
            return res.status(200).json(updatedCamera);
        } catch (error) {
            console.error("Erro ao atualizar câmera:", error);

            // ---> A CORREÇÃO DO ERRO 'unknown' <---
            // Verificamos se o 'error' é um objeto, não nulo, e se tem a propriedade 'code'
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
                return res.status(409).json({ message: "Já existe uma câmera com este endereço IP." });
            }
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    // DELETE /api/cameras/:id - Excluir uma câmera
    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id } = req.params;

            // ---> A LÓGICA DE "CHAVE DUPLA" PARA EXCLUSÃO <---
            const actionPermission = 'DELETE:DOCUMENTS';
            const areaPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(areaPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissões insuficientes para esta área.' });
            }

            const cameraExists = await prisma.camera.findFirst({
                where: { id, companyId: user.company.id },
            });

            if (!cameraExists) {
                return res.status(404).json({ message: 'Câmera não encontrada.' });
            }

            await prisma.camera.delete({ where: { id } });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    // POST /api/cameras/import - Importar câmeras de um arquivo CSV
    public async importFromXLSX(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: "Nenhum arquivo enviado." });
            }

            if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                fs.unlinkSync(file.path);
                return res.status(400).json({ message: "Formato de arquivo inválido. Apenas arquivos .xlsx são permitidos." });
            }

            const actionPermission = 'CREATE:DOCUMENTS';
            const areaPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(actionPermission) || !user.permissions.includes(areaPermission)) {
                return res.status(403).json({ message: 'Acesso negado.' });
            }

            // ---> PASSO 1: LEITURA E ATRIBUIÇÃO <---
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

            // ---> PASSO 2: A VALIDAÇÃO CORRIGIDA <---
            // Agora, nós verificamos o conteúdo do jsonData que acabamos de criar.
            if (!jsonData || jsonData.length === 0 || !jsonData[0]['Nº Câmera']) {
                fs.unlinkSync(file.path); // Limpa o arquivo inválido
                return res.status(400).json({
                    message: "Arquivo inválido ou fora do padrão. Verifique se a coluna 'Nº Câmera' existe."
                });
            }

            // Se a validação passar, o código continua para o mapeamento
            const camerasToCreate = jsonData.map((row: any) => {
                const isActive = row['Em Funcionamento ?']?.trim().toLowerCase() === 'sim';
                const hasAnalytics = row['POSSUI ANÁLITICO?']?.trim().toLowerCase() === 'sim';

                let recordingDays: number | null = null;
                const recordingDaysString = row['Dias de gravação'];
                if (recordingDaysString) {
                    const match = recordingDaysString.match(/\d+/);
                    if (match) { recordingDays = parseInt(match[0], 10); }
                }

                return {
                    name: row['Nº Câmera'] || 'Nome não especificado',
                    location: row['Local de Instalação'],
                    ipAddress: row['IP'],
                    model: row['Modelo'],
                    fabricante: row['Fabricante'],
                    isActive: isActive,
                    businessUnit: row['Unidade de Negócio'],
                    type: row['Tipo'],
                    area: row['Área Externa / Interna'],
                    hasAnalytics: hasAnalytics,
                    recordingDays: recordingDays,
                    companyId: user.company.id,
                };
            }).filter(cam => cam.name && cam.name !== 'Nome não especificado');

            const result = await prisma.camera.createMany({ data: camerasToCreate, skipDuplicates: true });

            fs.unlinkSync(file.path);
            return res.status(201).json({ message: `${result.count} câmeras importadas com sucesso.` });

        } catch (error) {
            console.error("Erro ao importar XLSX:", error);
            return res.status(500).json({ message: 'Erro interno ao processar o arquivo.' });
        }
    }

    // GET /api/cameras/export - Exportar câmeras para XLSX
    public async exportToXLSX(req: Request, res: Response): Promise<void> {
        try {
            const { user } = req;

            const requiredPermission = 'VIEW:CFTV';
            if (!user.permissions.includes(requiredPermission)) {
                res.status(403).json({ message: 'Acesso negado.' });
                return;
            }

            const cameras = await prisma.camera.findMany({
                where: { companyId: user.company.id },
                orderBy: { name: 'asc' },
            });

            // Mapeia os dados do banco para o formato da planilha
            const dataToExport = cameras.map(cam => ({
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
                'Dias de gravação': cam.recordingDays,
            }));

            // Cria a planilha na memória
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Câmeras');

            // Converte a planilha para um buffer (um "arquivo" na memória)
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            // Configura os cabeçalhos para forçar o download no navegador
            res.setHeader('Content-Disposition', 'attachment; filename="export_cameras.xlsx"');
            res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);

        } catch (error) {
            console.error("Erro ao exportar para XLSX:", error);
            res.status(500).json({ message: 'Erro interno ao gerar o arquivo.' });
        }
    }
}