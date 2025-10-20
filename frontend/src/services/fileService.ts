// src/services/fileService.ts
import api from './api';

// --- MUDANÇA 1: ATUALIZANDO A DEFINIÇÃO DO DOCUMENTO ---
// Adicionamos os novos campos hierárquicos como opcionais ('?').
// O TypeScript agora saberá que 'doc.item' é uma propriedade válida.
export interface Document {
    id: string;
    name: string;
    description: string;
    category: string;
    path: string;
    size: number;
    mimetype: string;
    createdAt: string;
    updatedAt: string;
    subcategory?: string; // <== ADICIONADO
    item?: string;        // <== ADICIONADO
}

// --- MUDANÇA 2: ATUALIZANDO O CONTRATO DE UPLOAD ---
// Criamos um tipo para o payload que inclui os novos campos opcionais.
type UploadPayload = {
    file: File;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    item?: string;
};

export const fileService = {
    async listFiles(category: string): Promise<Document[]> {
        console.log(`[DIAGNÓSTICO LIST] fileService.listFiles chamada com a categoria: ${category}`);
        console.log(`[DIAGNÓSTICO LIST] BaseURL do Axios: ${api.defaults.baseURL}`);

        try {
            // --- ESPIÃO ANTES DO ATAQUE ---
            console.log(`[DIAGNÓSTICO LIST] Tentando executar: api.get('/api/files', { params: { category: "${category}" } })`);

            const response = await api.get<Document[]>('/api/files', { params: { category } });

            // --- ESPIÃO APÓS O ATAQUE (SUCESSO) ---
            console.log('[DIAGNÓSTICO LIST] Sucesso! Dados recebidos:', response.data);
            return response.data;

        } catch (error: any) {
            // --- ESPIÃO APÓS O ATAQUE (FALHA) ---
            console.error('[DIAGNÓSTICO LIST] ERRO CRÍTICO na chamada api.get:', error);
            // Log detalhado do erro de rede/Axios
            if (error.response) {
                console.error('[DIAGNÓSTICO LIST] Detalhes do erro (Response):', error.response.data);
            } else if (error.request) {
                console.error('[DIAGNÓSTICO LIST] Detalhes do erro (Request):', error.request);
            } else {
                console.error('[DIAGNÓSTICO LIST] Detalhes do erro (Geral):', error.message);
            }
            // Re-lança o erro para que o useEffect possa capturá-lo também
            throw error;
        }
    },

    // --- MUDANÇA 3: ATUALIZANDO A FUNÇÃO DE UPLOAD ---
    // A função agora aceita o novo payload e anexa os campos hierárquicos ao FormData.
    // O TypeScript agora permitirá que você chame esta função com 'subcategory' e 'item'.
    async uploadFile(data: UploadPayload): Promise<Document> {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('description', data.description);
        // O seu backend usa `originalname`, mas vamos manter o envio do 'name' para consistência com o update.
        // O `FileController` pode ser ajustado no futuro para priorizar este campo, se desejado.
        formData.append('name', data.name);
        formData.append('category', data.category);

        // Anexa os novos campos apenas se eles existirem
        if (data.subcategory) {
            formData.append('subcategory', data.subcategory);
        }
        if (data.item) {
            formData.append('item', data.item);
        }

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

    async downloadFile(path: string): Promise<Blob> {
        // A sua implementação já estava correta, sem necessidade de mudanças aqui.
        const response = await api.get(`/api/files/serve/${path}?action=download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    getPreviewUrl(path: string): string {
        const baseUrl = api.defaults.baseURL || '';
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