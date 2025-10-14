// src/services/fileService.ts
import api from './api'; // Seu cliente Axios configurado (com JWT)

export interface FileData {
    id: string;
    name: string; // Nome original
    description: string;
    size: number; // Em bytes (vamos converter para string no Front)
    mimeType: string;
    uploadDate: string; // Ou createdAt
    userId: string;
    companyId: string;
    // Opcional: para Normas e Procedimentos
    item?: string;
    category?: string;
}

export const fileService = {
    // 1. Listar Arquivos
    async listFiles(category: string): Promise<FileData[]> {
        // No momento, o backend lista TUDO por companyId.
        // Se quisermos filtrar por categoria (como 'legislacao', 'diagnostico-ear'),
        // precisaremos adaptar a rota GET /api/files para aceitar um `category` como query param.
        // Por agora, vamos buscar tudo e filtrar no front (ou assumir que o backend foi ajustado).

        // ASSUMINDO AJUSTE NO BACKEND: GET /api/files?category=...
        const response = await api.get<FileData[]>(`/api/files`, {
            params: { category }
        });
        return response.data.map(file => ({
            ...file,
            uploadDate: new Date(file.uploadDate).toLocaleDateString('pt-BR'), // Formata a data
            size: file.size, // Manter em bytes, formatar no componente
        }));
    },

    // 2. Upload de Arquivo
    async uploadFile(file: File, name: string, description: string, category: string, item?: string): Promise<FileData> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name); // Pode ser usado para dar um nome mais amigável
        formData.append('description', description);
        formData.append('category', category);
        if (item) {
            formData.append('item', item);
        }

        const response = await api.post<FileData>(`/api/files/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // 3. Deletar Arquivo
    async deleteFile(id: string): Promise<void> {
        await api.delete(`/api/files/${id}`);
    },

    // 4. Download (URL direta)
    getDownloadUrl(id: string): string {
        // Constrói a URL de download que o botão deve usar
        return `${api.defaults.baseURL}/api/files/${id}/download`;
    },

    // 5. Atualizar Metadados
    async updateFile(id: string, name: string, description: string): Promise<FileData> {
        const response = await api.patch<FileData>(`/api/files/${id}`, { name, description });
        return response.data;
    }
};

// Função auxiliar para formatação de tamanho
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};