import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client'; // Necessário para $queryRawUnsafe
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_FOLDER = path.resolve(__dirname, '..', '..', 'uploads');

export class FileController {

    public async listFiles(req: Request, res: Response): Promise<Response> {
        console.log('--- [DIAGNÓSTICO LIST FINAL v6] Requisição listFiles recebida ---');
        try {
            const { user } = req;
            const { company } = user;
            const categoryQuery = req.query.category as string | undefined;

            if (!categoryQuery) { return res.status(400).json({ message: 'A categoria é obrigatória.' }); }
            if (!user.permissions.includes('VIEW:DOCUMENTS')) { return res.status(403).json({ message: 'Acesso negado.' }); }

            const companyId = company.id;
            const targetCategory = categoryQuery.trim();

            console.log(`[DIAGNÓSTICO LIST FINAL v6] Preparando query Prisma para companyId: "${companyId}", category Limpa: "${targetCategory}"`);

            console.log('[DIAGNÓSTICO LIST FINAL v6] Executando prisma.file.findMany...');
            const files = await prisma.file.findMany({
                where: {
                    companyId: companyId,
                    category: targetCategory,
                },
                // --- A CORREÇÃO CRUCIAL: SELECT COMPLETO ---
                // Garantir que TODOS os campos usados pelo frontend sejam retornados.
                select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                    subcategory: true,
                    item: true,
                    path: true,
                    size: true,         // <-- Campo essencial para formatFileSize
                    mimetype: true,     // <-- Campo essencial para FileThumbnail e handlePreview
                    type: true,
                    uploadedById: true,
                    uploadedByName: true,
                    companyId: true,
                    createdAt: true,    // <-- Campo essencial para a data
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' }
            });

            console.log(`[DIAGNÓSTICO LIST FINAL v6] Query Prisma concluída. Arquivos encontrados: ${files.length}`);
            // Logs de diagnóstico podem ser removidos agora que a causa raiz foi encontrada
            // if (files.length === 0) { ... } else { ... }

            // Log para verificar os dados retornados (temporário)
            // console.log('[DIAGNÓSTICO LIST FINAL v6] Dados retornados:', JSON.stringify(files, null, 2));


            return res.status(200).json(files);

        } catch (error) {
            console.error('--- [DIAGNÓSTICO LIST FINAL v6] ERRO CRÍTICO no try-catch ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }

    public async uploadFile(req: Request, res: Response): Promise<Response> {
        console.log('--- Requisição de upload recebida ---');
        try {
            const { user } = req;
            const { company } = user;
            // Extrai todos os campos potenciais
            const { description, category, subcategory, item, name: formName } = req.body;
            const file = req.file;

            // Validação básica do arquivo
            if (!file) {
                console.log('Upload falhou: Nenhum arquivo fornecido.');
                return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
            }
            // Validação básica de descrição/categoria
            if (!description || !category) {
                console.log('Upload falhou: Faltando descrição ou categoria.', { description, category });
                // Limpa arquivo órfão
                await fs.unlink(file.path).catch(err => console.error("Falha ao limpar arquivo órfão:", err));
                return res.status(400).json({ message: 'Descrição e categoria são obrigatórias.' });
            }
            // Checagem de permissão
            if (!user.permissions.includes('CREATE:DOCUMENTS')) {
                console.log('Upload falhou: Permissão negada.');
                await fs.unlink(file.path).catch(err => console.error("Falha ao limpar arquivo órfão:", err));
                return res.status(403).json({ message: 'Acesso negado.' });
            }

            const { originalname, filename: pathValue, size, mimetype } = file;
            const finalName = formName || originalname;

            let savedFile;

            // --- LÓGICA CONDICIONAL ---
            if (category === 'normas-e-procedimentos') {
                // Lógica especial para Normas/Procedimentos: requer 'item' e usa upsert
                if (!item) {
                    console.log('Upload falhou (Normas): Faltando campo item.');
                    await fs.unlink(file.path).catch(err => console.error("Falha ao limpar arquivo órfão:", err));
                    return res.status(400).json({ message: 'O campo "item" é obrigatório para Normas e Procedimentos.' });
                }
                console.log('Executando UPSERT para Normas e Procedimentos...');
                savedFile = await prisma.file.upsert({
                    where: {
                        companyId_category_subcategory_item: {
                            companyId: company.id,
                            category: category, // Já validada
                            subcategory: subcategory || "",
                            item: item,
                        }
                    },
                    update: {
                        name: finalName, description, path: pathValue, size, mimetype,
                        uploadedById: user.userId, uploadedByName: user.name, // Garanta que user.name existe no token
                    },
                    create: {
                        companyId: company.id, category, subcategory: subcategory || "", item,
                        name: finalName, description, path: pathValue, size, mimetype,
                        uploadedById: user.userId, uploadedByName: user.name, // Garanta que user.name existe no token
                    }
                });
                console.log('UPSERT bem-sucedido:', savedFile.id);

            } else {
                // Lógica padrão para todas as outras categorias: usa create
                console.log(`Executando CREATE para categoria: ${category}...`);
                savedFile = await prisma.file.create({
                    data: {
                        companyId: company.id,
                        category, // Já validada
                        // Subcategory e item podem ser undefined/null aqui, sem problemas para o create
                        subcategory: subcategory || null,
                        item: item || null,
                        name: finalName,
                        description,
                        path: pathValue,
                        size,
                        mimetype,
                        uploadedById: user.userId,
                        uploadedByName: user.name, // Garanta que user.name existe no token
                    }
                });
                console.log('CREATE bem-sucedido:', savedFile.id);
            }

            return res.status(200).json(savedFile); // Retorna 200 OK para simplificar em ambos os casos

        } catch (error) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(err => console.error("Falha ao limpar arquivo órfão após erro:", err));
            }
            console.error('--- ERRO CRÍTICO durante upload ---', error);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
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
