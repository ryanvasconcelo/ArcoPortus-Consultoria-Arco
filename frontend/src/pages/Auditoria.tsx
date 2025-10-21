import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Loader2, ServerCrash, BarChart, Activity, ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { auditService, AuditLog, AuditStats, AuditFilters, PaginationInfo } from "../services/auditService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- MUDANÇA: Mapeamento de Módulos (para Nomes Amigáveis) ---
// Regra de Negócio: Nomes amigáveis para módulos e alvos
const formatModuleName = (log: AuditLog): string => {
  const { module, target } = log;

  // 1. Módulos Específicos
  if (module === 'AUTH') return 'Arco Portus';
  if (module === 'CFTV') return 'Sistema de CFTV';

  // 2. Módulo "FILES" é mapeado pelo seu "target" (categoria)
  if (module === 'FILES' && target) {
    const targetMap: { [key: string]: string } = {
      'legislacao': 'Legislação',
      'normas-e-procedimentos': 'Normas e Procedimentos',
      'documentos-registros': 'Documentos e Registros',
      'diagnostico-ear': 'Diagnóstico do EAR'
    };
    return targetMap[target] || target; // Retorna o nome amigável ou o próprio target
  }

  // 3. Padrão
  return module;
};

// --- MUDANÇA: Configuração dos novos Cards ---
const cardConfig: {
  [key: string]: { icon: React.ElementType, color: string, label: string, severity: string }
} = {
  total: { icon: BarChart, color: "text-blue-600 bg-blue-100", label: "Total", severity: "all" },
  alta: { icon: ShieldAlert, color: "text-red-600 bg-red-100", label: "Severidade Alta", severity: "ALTA" },
  media: { icon: Shield, color: "text-yellow-600 bg-yellow-100", label: "Severidade Média", severity: "MEDIA" },
  baixa: { icon: ShieldCheck, color: "text-green-600 bg-green-100", label: "Severidade Baixa", severity: "BAIXA" },
};

const Auditoria = () => {
  // --- MUDANÇA: Estado de filtros simplificado ---
  const [filters, setFilters] = useState<AuditFilters>({
    startDate: "",
    endDate: "",
    severity: "all",
  });

  const [searchTerm, setSearchTerm] = useState(""); // Barra de pesquisa
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, pageSize: 20, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- MUDANÇA: Função de busca de Logs atualizada ---
  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      // Passa os filtros, o termo de pesquisa e a página
      const response = await auditService.listLogs(filters, searchTerm, page, pagination.pageSize);
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError("Falha ao carregar os registros.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm, pagination.pageSize]); // Depende dos filtros e da pesquisa

  // Função de busca de Stats (sem mudanças)
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await auditService.getAuditStats();
      setStats(data);
    } catch (err) {
      console.error("Falha ao carregar estatísticas:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Efeito para buscar os dados ao carregar ou filtrar
  useEffect(() => {
    fetchStats();
    fetchLogs(1); // Busca na página 1 ao mudar filtros
  }, [filters, searchTerm, fetchStats]); // Removido fetchLogs para evitar loop, chamado manualmente

  // --- MUDANÇA: Handler de filtros (inclui severidade) ---
  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  // --- MUDANÇA: Limpar filtros (inclui severidade) ---
  const handleClearFilters = () => {
    setFilters({ startDate: "", endDate: "", severity: "all" });
    setSearchTerm("");
  };

  // --- MUDANÇA: Nova Função de Exportar PDF ---
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // 1. Busca TODOS os logs que correspondem aos filtros atuais
      const response = await auditService.listLogs(
        filters,
        searchTerm,
        1,
        pagination.totalItems > 0 ? pagination.totalItems : 1000 // Pede todos
      );

      const doc = new jsPDF();
      doc.text("Relatório de Auditoria - Arco Portus", 14, 16);

      // 2. Prepara os dados para a tabela
      const tableColumn = ["Data/Hora", "Usuário", "Ação", "Módulo", "Alvo", "Severidade", "Detalhe"];
      const tableRows = response.data.map(log => [
        format(new Date(log.createdAt), 'dd/MM/yy HH:mm', { locale: ptBR }),
        log.userName,
        log.action,
        formatModuleName(log),
        log.companyName || 'N/A',
        log.severity,
        log.details
      ]);

      // 3. Gera a tabela no PDF
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [38, 38, 38] }, // Cor do cabeçalho
        columnStyles: {
          6: { cellWidth: 80 } // Coluna de "Detalhe" mais larga
        }
      });

      doc.save(`auditoria_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error("Falha ao exportar PDF:", error);
      // Adicionar um toast de erro aqui seria ideal
    } finally {
      setIsExporting(false);
    }
  };

  // --- MUDANÇA: Renderização dos Novos Cards de Estatística ---
  const renderStatCards = () => {
    if (isStatsLoading) {
      return Array(4).fill(0).map((_, i) => (
        <Card key={`skeleton-${i}`}><CardContent className="p-4"><div className="h-12 w-full bg-muted animate-pulse rounded-md"></div></CardContent></Card>
      ));
    }

    const cardsData = [
      { key: 'total', config: cardConfig.total, count: stats?.total ?? 0 },
      { key: 'alta', config: cardConfig.alta, count: stats?.bySeverity.ALTA ?? 0 },
      { key: 'media', config: cardConfig.media, count: stats?.bySeverity.MEDIA ?? 0 },
      { key: 'baixa', config: cardConfig.baixa, count: stats?.bySeverity.BAIXA ?? 0 },
    ];

    return cardsData.map(card => {
      const isActive = filters.severity === card.config.severity;
      return (
        <Card
          key={card.key}
          onClick={() => handleFilterChange('severity', card.config.severity)}
          className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${isActive ? 'ring-2 ring-primary shadow-lg' : 'shadow-md'}`}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${card.config.color}`}>
                <card.config.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold">{card.count}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{card.config.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <Sidebar />

          <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
            <div className="bg-secondary text-white text-center py-4 sm:py-6 rounded-lg shadow-md px-4">
              <h1 className="text-lg sm:text-2xl font-bold">SISTEMA DE AUDITORIA</h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1">Monitoramento e rastreabilidade de ações</p>
            </div>

            {/* --- MUDANÇA: Cards de estatística/filtro --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {renderStatCards()}
            </div>

            <Card className="shadow-lg">
              <CardHeader className="bg-muted/30 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Registros de Atividade
                  </CardTitle>
                  <Button
                    variant="outline"
                    className="hover:bg-destructive hover:text-destructive-foreground text-xs sm:text-sm w-full sm:w-auto"
                    onClick={handleClearFilters}
                  >
                    Limpar Filtros e Pesquisa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {/* --- MUDANÇA: Filtros Simplificados --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Pesquisar em todos os registros..."
                      className="pl-10 focus:ring-2 focus:ring-primary text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {/* --- MUDANÇA: Botão de Excel removido --- */}
                  <Button
                    variant="outline"
                    className="text-xs sm:text-sm"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">Exportar PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-secondary/10 border-b-2 border-secondary">
                      <tr>
                        {/* --- MUDANÇA: Centralização --- */}
                        <th className="text-left p-2 sm:p-4">Data/Hora</th>
                        <th className="text-center p-2 sm:p-4">Usuário</th>
                        <th className="text-center p-2 sm:p-4">Ação</th>
                        <th className="text-center p-2 sm:p-4">Módulo</th>
                        <th className="text-center p-2 sm:p-4">Alvo</th>
                        <th className="text-left p-2 sm:p-4">Detalhe</th>
                        <th className="text-center p-2 sm:p-4">Severidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan={7} className="text-center p-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                      ) : error ? (
                        <tr><td colSpan={7} className="text-center p-8 text-red-600"><ServerCrash className="h-5 w-5 mx-auto mb-2" />{error}</td></tr>
                      ) : logs.length === 0 ? (
                        <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">Nenhum registro encontrado.</td></tr>
                      ) : (
                        logs.map((log, index) => (
                          <tr key={log.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                            {/* --- MUDANÇA: Centralização e Formatação --- */}
                            <td className="p-2 sm:p-4 text-xs whitespace-nowrap">{format(new Date(log.createdAt), 'dd/MM/yy HH:mm:ss', { locale: ptBR })}</td>
                            <td className="p-2 sm:p-4 font-medium text-xs text-center">{log.userName}</td>
                            <td className="p-2 sm:p-4 text-xs text-center">{log.action}</td>
                            <td className="p-2 sm:p-4 text-xs text-center">{formatModuleName(log)}</td>
                            <td className="p-2 sm:p-4 text-xs text-center">{log.companyName || 'N/A'}</td>
                            <td className="p-2 sm:p-4 text-xs text-muted-foreground whitespace-pre-wrap">{log.details}</td>
                            <td className="p-2 sm:p-4 text-center">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${log.severity === "ALTA" ? 'bg-red-100 text-red-800 border-red-300' :
                                  log.severity === "MEDIA" ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                    'bg-blue-100 text-blue-800 border-blue-300'
                                  }`}
                              >
                                {log.severity}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-muted/20 text-xs sm:text-sm">
                  <span className="text-muted-foreground font-medium">
                    Mostrando {logs.length} de {pagination.totalItems} registros
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover-lift" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled className="bg-secondary text-white">
                      {pagination.page}
                    </Button>
                    <Button variant="outline" size="sm" className="hover-lift" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto">
          © 2025_V02 Arco Security I  Academy  I  Solutions - Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Auditoria;