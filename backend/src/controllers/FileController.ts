// src/controllers/FileController.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Verifique se este é o caminho correto para sua instância do Prisma
import fs from 'fs/promises'; // 1. Importe o 'fs/promises' para lidar com arquivos
import path from 'path';     // 2. Importe o 'path' para construir caminhos

const UPLOADS_FOLDER = path.resolve(__dirname, '..', '..', 'uploads');

export class FileController {

    public async listFiles(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { company } = user;

            // 1. EXTRAINDO A CATEGORIA DOS QUERY PARAMETERS DA URL
            const { category } = req.query as { category: string };

            // 2. VALIDAÇÃO
            if (!category) {
                return res.status(400).json({ message: 'A categoria é obrigatória para listar os arquivos.' });
            }

            const requiredPermission = 'VIEW:DOCUMENTS';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
            }

            // 3. QUERY ATUALIZADA COM O FILTRO DE CATEGORIA
            const files = await prisma.file.findMany({
                where: {
                    companyId: company.id, // Regra Mestra: Sempre filtra pela empresa do usuário
                    category: category,      // Nova Regra: Agora também filtra pela categoria solicitada
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });

            return res.status(200).json(files);

        } catch (error) {
            console.error('Erro ao listar arquivos:', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    // ---> NOSSO NOVO MÉTODO <---
    public async uploadFile(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { company } = user;

            // 1. EXTRAINDO A CATEGORIA DO CORPO DA REQUISIÇÃO
            const { description, category } = req.body;
            const file = req.file;

            // 2. VALIDAÇÃO ATUALIZADA
            if (!file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
            }
            if (!description || !category) { // Agora, categoria também é obrigatória
                return res.status(400).json({ message: 'Descrição e categoria são obrigatórias.' });
            }

            const requiredPermission = 'CREATE:DOCUMENTS';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão para criar documentos é necessária.' });
            }

            const { originalname: name, filename: path, size, mimetype } = file;

            const newFile = await prisma.file.create({
                data: {
                    name,
                    description,
                    category, // 3. SALVANDO A CATEGORIA NO BANCO
                    path,
                    size,
                    mimetype,
                    uploadedById: user.userId,
                    companyId: company.id,
                }
            });

            return res.status(201).json(newFile);

        } catch (error) {
            console.error('Erro no upload do arquivo:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao processar o upload.' });
        }
    }

    // ---> NOSSO NOVO MÉTODO DE EDIÇÃO <---
    public async updateFile(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id: fileId } = req.params; // Pega o ID do arquivo da URL
            const { name, description } = req.body; // Pega os novos dados do corpo da requisição

            // 1. Validação dos dados recebidos
            if (!name || !description) {
                return res.status(400).json({ message: 'Nome e descrição são obrigatórios.' });
            }

            // 2. APLICANDO A "CONSTITUIÇÃO" (RBAC)
            const requiredPermission = 'EDIT:DOCUMENTS';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão para editar documentos é necessária.' });
            }

            // 3. VERIFICAÇÃO DE PROPRIEDADE (A REGRA MESTRA!)
            // Antes de editar, garantimos que o arquivo existe E pertence à empresa do usuário.
            // Isso impede que um usuário da empresa A edite um arquivo da empresa B, mesmo que adivinhe o ID.
            const fileToUpdate = await prisma.file.findFirst({
                where: {
                    id: fileId,
                    companyId: user.company.id,
                },
            });

            if (!fileToUpdate) {
                return res.status(404).json({ message: 'Arquivo não encontrado.' });
            }

            // 4. EXECUTAR A ATUALIZAÇÃO NO BANCO
            const updatedFile = await prisma.file.update({
                where: {
                    id: fileId,
                },
                data: {
                    name,
                    description,
                },
            });

            // 5. SUCESSO!
            return res.status(200).json(updatedFile); // Retorna o arquivo atualizado

        } catch (error) {
            console.error('Erro ao atualizar arquivo:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao atualizar o arquivo.' });
        }
    }

    // ---> NOSSO NOVO MÉTODO DE EXCLUSÃO <---
    public async deleteFile(req: Request, res: Response): Promise<Response> {
        try {
            const { user } = req;
            const { id: fileId } = req.params; // Pega o ID do arquivo da URL

            // 3. APLICANDO A "CONSTITUIÇÃO" (RBAC)
            const requiredPermission = 'DELETE:DOCUMENTS';
            if (!user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Acesso negado. Permissão para excluir documentos é necessária.' });
            }

            // 4. VERIFICAÇÃO DE PROPRIEDADE (A REGRA MESTRA!)
            // Primeiro, encontramos o arquivo para garantir que ele pertence à empresa do usuário
            const file = await prisma.file.findFirst({
                where: {
                    id: fileId,
                    companyId: user.company.id, // Garante que o usuário só possa ver arquivos da sua empresa
                },
            });

            // Se o arquivo não existe ou não pertence à empresa, retornamos 404
            if (!file) {
                return res.status(404).json({ message: 'Arquivo não encontrado.' });
            }

            // 5. APAGAR O REGISTRO DO BANCO
            await prisma.file.delete({
                where: {
                    id: fileId,
                },
            });

            // 6. APAGAR O ARQUIVO FÍSICO DO DISCO
            try {
                const filePath = path.resolve(__dirname, '..', '..', 'uploads', file.path);
                await fs.unlink(filePath);
            } catch (fileError) {
                // Se a exclusão do arquivo físico falhar, apenas logamos o erro.
                // O mais importante é que o registro no banco foi removido.
                console.error(`Falha ao excluir o arquivo físico: ${file.path}`, fileError);
            }

            // 7. SUCESSO!
            return res.status(204).send(); // 204 No Content é a resposta padrão para um DELETE bem-sucedido

        } catch (error) {
            console.error('Erro ao excluir arquivo:', error);
            return res.status(500).json({ message: 'Erro interno do servidor ao excluir o arquivo.' });
        }
    }

    public async serveFile(req: Request, res: Response): Promise<void> { // Retorna void pois a resposta é o próprio arquivo
        try {
            const { user } = req;
            const { path: filePath } = req.params; // O path do arquivo vindo da URL
            const { action } = req.query; // A ação: 'download' ou 'preview'

            // 1. APLICANDO A "CONSTITUIÇÃO" (RBAC E REGRA MESTRA)
            // Primeiro, buscamos no banco para garantir que este arquivo pertence à empresa do usuário
            const file = await prisma.file.findFirst({
                where: {
                    path: filePath,
                    companyId: user.company.id,
                },
            });

            // Se o arquivo não existe ou não pertence à empresa, acesso negado
            if (!file) {
                res.status(404).json({ message: 'Arquivo não encontrado.' });
                return;
            }

            // 2. MONTAGEM DO CAMINHO FÍSICO
            const physicalPath = path.resolve(UPLOADS_FOLDER, file.path);

            // 3. LÓGICA DE ENTREGA
            if (action === 'download') {
                // Força o navegador a baixar o arquivo com o nome original (amigável)
                res.download(physicalPath, file.name);
            } else {
                // Tenta exibir o arquivo no navegador (preview)
                res.sendFile(physicalPath);
            }
        } catch (error) {
            console.error('Erro ao servir o arquivo:', error);
            res.status(500).json({ message: 'Erro interno ao buscar o arquivo.' });
        }
    }

}