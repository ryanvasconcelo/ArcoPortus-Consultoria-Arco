// src/services/cameraService.ts

import api from './api'; // Sua instância do Axios configurada

// 1. A interface que espelha PERFEITAMENTE nosso 'model Camera' do Prisma
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
    recordingDays: number | null;
    deactivatedAt: string | null; // A API retorna a data como string
    isActive: boolean;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

// 2. O objeto de serviço com todas as nossas ferramentas
export const cameraService = {

    /**
     * Busca a lista completa de câmeras da empresa do usuário.
     */
    async listCameras(): Promise<Camera[]> {
        const response = await api.get<Camera[]>('/api/cameras');
        return response.data;
    },

    /**
     * Cria uma nova câmera manualmente.
     * Usamos Omit para não precisar enviar id, companyId, etc.
     */
    async createCamera(cameraData: Omit<Camera, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'deactivatedAt'>): Promise<Camera> {
        const response = await api.post<Camera>('/api/cameras', cameraData);
        return response.data;
    },

    /**
     * Importa câmeras em massa a partir de um arquivo .xlsx.
     */
    async importCameras(file: File): Promise<{ message: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<{ message: string }>('/api/cameras/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Atualiza os dados de uma câmera existente.
     * Partial<> torna todos os campos opcionais.
     */
    async updateCamera(id: string, cameraData: Partial<Omit<Camera, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>): Promise<Camera> {
        const response = await api.patch<Camera>(`/api/cameras/${id}`, cameraData);
        return response.data;
    },

    /**
     * Exclui uma câmera pelo seu ID.
     */
    async deleteCamera(id: string): Promise<void> {
        await api.delete(`/api/cameras/${id}`);
    },
};