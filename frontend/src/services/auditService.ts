import api from './api';

// --- Tipos de Dados ---

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
    companyName: string | null; // <-- MUDANÇA 1: Adicionado
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

// --- MUDANÇA 2: Interface de Stats atualizada ---
export interface AuditStats {
    total: number;
    bySeverity: {
        BAIXA: number;
        MEDIA: number;
        ALTA: number;
    };
}

// --- MUDANÇA 3: Interface de Filtros atualizada ---
export interface AuditFilters {
    startDate: string;
    endDate: string;
    severity: string; // "all", "BAIXA", "MEDIA", "ALTA"
    // 'modulo', 'acao' e 'usuario' (do filtro) removidos
}

// --- Funções do Serviço ---

export const auditService = {
    /**
     * Busca a lista paginada de logs.
     */
    listLogs: async (
        filters: AuditFilters,
        searchTerm: string, // <-- MUDANÇA 4: Barra de pesquisa separada
        page: number,
        pageSize: number
    ): Promise<ListLogsResponse> => {
        try {
            const response = await api.get<ListLogsResponse>('/api/audit', {
                params: {
                    ...filters,
                    usuario: searchTerm, // O backend espera a pesquisa como 'usuario'
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

    /**
     * Busca as estatísticas (cards).
     */
    getAuditStats: async (): Promise<AuditStats> => {
        try {
            // A chamada não muda, mas a resposta (AuditStats) é diferente
            const response = await api.get<AuditStats>('/api/audit/stats');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas de auditoria:', error);
            throw error;
        }
    },
};