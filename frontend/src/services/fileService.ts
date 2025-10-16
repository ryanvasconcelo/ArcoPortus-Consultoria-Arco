// src/services/fileService.ts
import api from './api';

export interface Document {
    id: string;
    name: string;
    description: string;
    category: string;
    path: string;
    size: number;
    mimetype: string;
    type: 'DOCUMENT' | 'SPREADSHEET' | 'CAMERA_DATA' | 'OTHER';
    createdAt: string;
    updatedAt: string;
    // ... e outros campos
}

export const fileService = {
    async listFiles(category: string): Promise<Document[]> {
        const response = await api.get<Document[]>('/api/files', { params: { category } });
        return response.data;
    },

    async uploadFile(data: { file: File; description: string; name: string; category: string }): Promise<Document> {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('description', data.description);
        formData.append('name', data.name);
        formData.append('category', data.category);
        const response = await api.post<Document>('/api/files', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async deleteFile(id: string): Promise<void> {
        await api.delete(`/api/files/${id}`);
    },

    async updateFile(id: string, data: { name: string; description: string }): Promise<Document> {
        const response = await api.patch<Document>(`/api/files/${id}`, data);
        return response.data;
    },

    /**
     * Retorna a URL completa para forçar o download de um arquivo.
     */
    getDownloadUrl(path: string): string {
        const baseUrl = api.defaults.baseURL;
        return `${baseUrl}/api/files/serve/${path}?action=download`;
    },

    // ---> NOSSA NOVA FUNÇÃO DE DOWNLOAD <---
    async downloadFile(path: string): Promise<Blob> {
        const url = `${api.defaults.baseURL}/api/files/serve/${path}?action=download`;
        const response = await api.get(url, {
            responseType: 'blob', // A MÁGICA: Diz ao Axios para tratar a resposta como um arquivo
        });
        return response.data;
    },

    /**
     * Retorna a URL completa para tentar visualizar um arquivo.
     */
    getPreviewUrl(path: string): string {
        const baseUrl = api.defaults.baseURL;
        return `${baseUrl}/api/files/serve/${path}`;
    },
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};