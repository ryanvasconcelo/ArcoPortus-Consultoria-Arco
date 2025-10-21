import api from './api';

// --- Interfaces ---
export interface AuditLog {
    id: string;
    action: string;
    module: string;
    target: string | null;
    details: string;
    severity: 'BAIXA' | 'MEDIA' | 'ALTA';
    ip: string | null;
    userId: string;
    userName: string;
    userRole: string;
    companyId: string;
    companyName: string | null;
    createdAt: string;
}

export interface PaginationInfo {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ListLogsResponse {
    data: AuditLog[];
    pagination: PaginationInfo;
}

export interface AuditStats {
    total: number;
    bySeverity: {
        BAIXA: number;
        MEDIA: number;
        ALTA: number;
    };
}

export interface AuditFilters {
    startDate: string;
    endDate: string;
    severity: string; // "all", "BAIXA", "MEDIA", "ALTA"
    modulo: string;
    usuario: string;  // Filtro específico de usuário
}

// --- Funções do Serviço ---
export const auditService = {
    listLogs: async (
        filters: AuditFilters,
        searchTerm: string, // Pesquisa principal da barra
        page: number,
        pageSize: number
    ): Promise<ListLogsResponse> => {
        try {
            const response = await api.get<ListLogsResponse>('/api/audit', {
                params: {
                    // Envia os filtros específicos (startDate, endDate, severity, modulo, usuario)
                    ...filters,
                    // Envia o termo da barra de pesquisa principal como 'searchTerm'
                    searchTerm: searchTerm,
                    page,
                    pageSize,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar logs de auditoria:', error);
            throw error;
        }
    },

    getAuditStats: async (): Promise<AuditStats> => {
        try {
            const response = await api.get<AuditStats>('/api/audit/stats');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas de auditoria:', error);
            throw error;
        }
    },
};