// src/services/cameraService.ts
import api from './api'; // Ou seu wrapper axios

// --- CORREÇÃO 1: Atualizar a interface Camera ---
export interface Camera {
    id: string;
    name: string;
    location: string | null;
    ipAddress: string | null;
    model: string | null;
    fabricante: string | null;
    businessUnit: string | null;
    type: string | null;
    area: string | null;
    hasAnalytics: boolean | null;
    // recordingDays: number | null; // <-- Linha antiga removida/comentada
    recordingHours: number | null; // <-- Nova propriedade (Float vira number no TS)
    deactivatedAt: string | null; // Prisma DateTime vira string (ISO 8601)
    isActive: boolean;
    companyId: string;
    createdAt: string; // Prisma DateTime vira string (ISO 8601)
    updatedAt: string; // Prisma DateTime vira string (ISO 8601)
}

// Assumindo que a API retorna um objeto com 'message' na importação
interface ImportResult {
    message: string;
}

// Interface para o resultado da exclusão em massa
interface DeleteManyResult {
    message: string;
    count: number;
}

export const cameraService = {
    async listCameras(): Promise<Camera[]> {
        const response = await api.get<Camera[]>('/api/cameras');
        return response.data;
    },

    async createCamera(data: Partial<Camera>): Promise<Camera> { // Aceita Partial<Camera>
        const response = await api.post<Camera>('/api/cameras', data);
        return response.data;
    },

    async updateCamera(id: string, data: Partial<Camera>): Promise<Camera> { // Aceita Partial<Camera>
        const response = await api.patch<Camera>(`/api/cameras/${id}`, data);
        return response.data;
    },

    async deleteCamera(id: string): Promise<void> {
        await api.delete(`/api/cameras/${id}`);
    },

    async importCameras(file: File): Promise<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<ImportResult>('/api/cameras/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    // Correção #11: Exclusão em massa
    async deleteManyCameras(ids: string[]): Promise<DeleteManyResult> {
        const response = await api.post<DeleteManyResult>('/api/cameras/delete-many', { ids });
        return response.data;
    },

    // Correção #6: Download do template (não precisa de lógica aqui, apenas a chamada)
    // A função de download está no SistemaCFTV.tsx e usa o `api` diretamente.
    // Manter a interface de serviço limpa.

};
