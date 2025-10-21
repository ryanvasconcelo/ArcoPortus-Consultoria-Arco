import api from './api';

<<<<<<< Updated upstream
// --- Interfaces ---
=======
// ... (interfaces AuditLog, PaginationInfo, ListLogsResponse, AuditStats) ...
// (Permanecem as mesmas da última vez)
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
export interface AuditStats {
    total: number;
    bySeverity: {
        BAIXA: number;
        MEDIA: number;
        ALTA: number;
    };
}

<<<<<<< Updated upstream
export interface AuditFilters {
    startDate: string;
    endDate: string;
    severity: string; // "all", "BAIXA", "MEDIA", "ALTA"
    modulo: string;
    usuario: string;  // Filtro específico de usuário
=======
// --- MUDANÇA 1: Interface de Filtros atualizada ---
export interface AuditFilters {
    startDate: string;
    endDate: string;
    severity: string;
    modulo: string;   // <-- ADICIONADO
    usuario: string;  // <-- ADICIONADO (para o filtro de nome)
>>>>>>> Stashed changes
}

// --- Funções do Serviço ---
export const auditService = {
    listLogs: async (
        filters: AuditFilters,
<<<<<<< Updated upstream
        searchTerm: string, // Pesquisa principal da barra
=======
        searchTerm: string, // Pesquisa principal
>>>>>>> Stashed changes
        page: number,
        pageSize: number
    ): Promise<ListLogsResponse> => {
        try {
            // --- MUDANÇA 2: Envia todos os filtros + searchTerm ---
            const response = await api.get<ListLogsResponse>('/api/audit', {
                params: {
                    // Envia os filtros específicos (startDate, endDate, severity, modulo, usuario)
                    ...filters,
<<<<<<< Updated upstream
                    // Envia o termo da barra de pesquisa principal como 'searchTerm'
                    searchTerm: searchTerm,
=======
                    searchTerm: searchTerm, // Pesquisa principal
>>>>>>> Stashed changes
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
        // ... (Este método permanece o mesmo da última vez) ...
        try {
            const response = await api.get<AuditStats>('/api/audit/stats');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas de auditoria:', error);
            throw error;
        }
    },
};