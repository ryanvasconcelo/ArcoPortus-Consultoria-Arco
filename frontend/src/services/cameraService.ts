// src/services/cameraService.ts
import api from './api';

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
    recordingHours: number | null; // ✅ Correção #4: Campo de horas de gravação
    deactivatedAt: string | null;
    isActive: boolean; // ✅ Correção #3: Campo isActive
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

interface ImportResult {
    message: string;
}

interface DeleteManyResult {
    message: string;
    count?: number;
}

export const cameraService = {
    async listCameras(): Promise<Camera[]> {
        const response = await api.get<Camera[]>('/api/cameras');
        return response.data;
    },

    async createCamera(data: Partial<Camera>): Promise<Camera> {
        const response = await api.post<Camera>('/api/cameras', data);
        return response.data;
    },

    async updateCamera(id: string, data: Partial<Camera>): Promise<Camera> {
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

    // ✅ CORREÇÃO #11: Exclusão em massa com rota corrigida
    async deleteManyCameras(ids: string[]): Promise<DeleteManyResult> {
        // MUDANÇA CRÍTICA: Rota alterada de /many para /bulk
        const response = await api.delete<DeleteManyResult>('/api/cameras/bulk', {
            data: { ids }
        });
        return response.data;
    },

    // ✅ CORREÇÃO #10: Exportação de câmeras
    async exportCameras(): Promise<Blob> {
        const response = await api.get('/api/cameras/export', {
            responseType: 'blob'
        });
        return response.data;
    },

    // ✅ CORREÇÃO #6: Download do template
    async downloadTemplate(): Promise<Blob> {
        const response = await api.get('/api/cameras/template/download', {
            responseType: 'blob'
        });
        return response.data;
    },
};