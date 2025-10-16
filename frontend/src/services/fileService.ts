// src/services/fileService.ts
import api from './api'; // Assumindo que 'api' é sua instância do Axios já configurada com interceptors para o token

// 1. A interface que representa EXATAMENTE o que nossa API retorna
export interface Document {
    id: string;
    name: string;
    description: string;
    path: string;
    size: number; // A API retorna como número, vamos formatar no componente
    mimetype: string;
    type: 'DOCUMENT' | 'SPREADSHEET' | 'CAMERA_DATA' | 'OTHER';
    uploadedById: string;
    uploadedByName: string | null;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

// Objeto com as funções do serviço
export const fileService = {
    // --- Funções que JÁ FUNCIONAM com nosso backend atual ---

    /**
     * Busca todos os arquivos da empresa do usuário logado.
     */
    async listFiles(): Promise<Document[]> {
        // Agora isso funciona, pois api.get() vai juntar 'http://localhost:3335' + '/api/files'
        const response = await api.get<Document[]>('/api/files');
        return response.data;
    },

    /**
     * Faz o upload de um novo arquivo.
     */
    async uploadFile(data: { file: File; description: string; name: string }): Promise<Document> {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('description', data.description);
        formData.append('name', data.name);

        // CORREÇÃO: A rota correta é POST /api/files, não /api/files/upload
        const response = await api.post<Document>('/api/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- Funções Futuras (Vamos implementar os endpoints depois) ---

    /**
     * Deleta um arquivo pelo seu ID. (A SER IMPLEMENTADO NO BACKEND)
     */
    async deleteFile(id: string): Promise<void> {
        // A rota é DELETE /api/files/:id
        await api.delete(`/api/files/${id}`);
    },

    /**
     * Atualiza os metadados (nome, descrição) de um arquivo. (A SER IMPLEMENTADO NO BACKEND)
     */
    async updateFile(id: string, data: { name: string; description: string }): Promise<Document> {
        const response = await api.patch<Document>(`/api/files/${id}`, data);
        return response.data;
    },

    /**
     * Retorna a URL completa para download de um arquivo. (A SER IMPLEMENTADO NO BACKEND)
     */
    getDownloadUrl(path: string): string {
        // CORREÇÃO: O download deve usar a URL base da API e o 'path' do arquivo.
        return `${import.meta.env.VITE_API_URL}/uploads/${path}`; // Exemplo, ajuste conforme sua variável de ambiente
    },
};

// Função auxiliar para formatação de tamanho (perfeita, mantemos!)
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};