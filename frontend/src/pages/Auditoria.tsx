import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Loader2, ServerCrash, BarChart, ShieldAlert, ShieldCheck, Shield, X } from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { auditService, AuditLog, AuditStats, AuditFilters, PaginationInfo } from "../services/auditService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

// Helper para Nome Amigável do Módulo
const formatModuleName = (log: AuditLog): string => {
  const { module, target } = log;
  if (module === 'AUTH') return 'Arco Portus';
  if (module === 'CFTV') return 'Sistema de CFTV';
  if (module === 'FILES' && target) {
    const targetMap: { [key: string]: string } = {
      'legislacao': 'Legislação', 'normas-e-procedimentos': 'Normas e Procedimentos',
      'documentos-registros': 'Documentos e Registros', 'diagnostico-ear': 'Diagnóstico do EAR'
    };
    return targetMap[target] || target;
  }
  return module;
};

// Configuração dos Cards (Design com círculo colorido)
const cardConfig: {
  [key: string]: { icon: React.ElementType; color: string; label: string; severity: string; };
} = {
  total: { icon: BarChart, color: "text-blue-600 bg-blue-100", label: "Total", severity: "all" },
  alta: { icon: ShieldAlert, color: "text-red-600 bg-red-100", label: "Severidade Alta", severity: "ALTA" },
  media: { icon: Shield, color: "text-yellow-600 bg-yellow-100", label: "Severidade Média", severity: "MEDIA" },
  baixa: { icon: ShieldCheck, color: "text-green-600 bg-green-100", label: "Severidade Baixa", severity: "BAIXA" },
};

// Lista de módulos para o dropdown
const modulos = [
  { value: "all", label: "Todos Módulos" },
  { value: "AUTH", label: "Arco Portus" },
  { value: "diagnostico-ear", label: "DIAGNÓSTICO DO EAR" },
  { value: "normas-e-procedimentos", label: "NORMAS E PROCEDIMENTOS" },
  { value: "documentos-registros", label: "DOCUMENTOS E REGISTROS" },
  { value: "legislacao", label: "LEGISLAÇÃO" },
  { value: "CFTV", label: "SISTEMA DE CFTV" },
];

const Auditoria = () => {
  const [filters, setFilters] = useState<AuditFilters>({
    startDate: "", endDate: "", severity: "all", modulo: "all", usuario: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, pageSize: 7, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null); // Definido aqui

  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auditService.listLogs(filters, searchTerm, page, pagination.pageSize);
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError("Falha ao carregar os registros.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm, pagination.pageSize]);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await auditService.getAuditStats();
      setStats(data);
    } catch (err) { console.error("Falha ao carregar estatísticas:", err); }
    finally { setIsStatsLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLogs(1); // Re-fetches logs when dependencies change
  }, [filters, searchTerm, fetchStats]);

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: "", endDate: "", severity: "all", modulo: "all", usuario: ""
    });
    setSearchTerm("");
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast.info("Iniciando exportação...", { description: "Buscando todos os registros para gerar o PDF." });
    try {
      const response = await auditService.listLogs(
        filters, searchTerm, 1, pagination.totalItems > 0 ? pagination.totalItems : 1000
      );
      const doc = new jsPDF();
      doc.text("Relatório de Auditoria - Arco Portus", 14, 16);
      const tableColumn = ["Data/Hora", "Usuário", "Ação", "Módulo", "Alvo", "Severidade", "Detalhe"];
      const tableRows = response.data.map(log => [
        format(new Date(log.createdAt), 'dd/MM/yy HH:mm', { locale: ptBR }),
        log.userName, log.action, formatModuleName(log),
        log.target || 'N/A',
        log.severity, log.details
      ]);
      (doc as any).autoTable({
        head: [tableColumn], body: tableRows, startY: 20,
        styles: { fontSize: 8 }, headStyles: { fillColor: [38, 38, 38] },
        columnStyles: { 6: { cellWidth: 80 } }
      });
      doc.save(`auditoria_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Falha ao exportar PDF:", error);
      toast.error("Falha ao exportar PDF", { description: "Ocorreu um erro ao gerar o relatório." });
    } finally { setIsExporting(false); }
  };

  const renderStatCards = () => {
    if (isStatsLoading) {
      return Array(4).fill(0).map((_, i) => (
        <Card key={`skeleton-${i}`} className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0 bg-muted h-8 w-8 animate-pulse"></div>
              <div>
                <div className="text-lg sm:text-2xl font-bold bg-muted h-7 w-12 rounded animate-pulse"></div>
                <div className="text-[10px] sm:text-xs bg-muted h-4 w-20 rounded mt-1 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ));
    }
    const cardsData = [
      { key: "total", config: cardConfig.total, count: stats?.total ?? 0, },
      { key: "alta", config: cardConfig.alta, count: stats?.bySeverity.ALTA ?? 0, },
      { key: "media", config: cardConfig.media, count: stats?.bySeverity.MEDIA ?? 0, },
      { key: "baixa", config: cardConfig.baixa, count: stats?.bySeverity.BAIXA ?? 0, },
    ];
    return cardsData.map((card) => {
      const isActive = filters.severity === card.config.severity;
      return (
        <Card
          key={card.key}
          onClick={() => handleFilterChange("severity", card.config.severity)}
          className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary shadow-md' : 'shadow-sm'}`}
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {renderStatCards()}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <CardTitle className="text-base sm:text-lg font-semibold">Filtros de Auditoria</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-muted-foreground hover:text-black" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-1" /> Limpar Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} placeholder="Data inicial" />
                  <Input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} placeholder="Data final" />
                  <Select value={filters.modulo} onValueChange={(value) => handleFilterChange("modulo", value)}>
                    <SelectTrigger><SelectValue placeholder="Todos Módulos" /></SelectTrigger>
                    <SelectContent>
                      {modulos.map((mod) => (<SelectItem key={mod.value} value={mod.value}>{mod.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Nome do usuário" value={filters.usuario} onChange={(e) => handleFilterChange("usuario", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar em detalhes, ações, alvos..."
                  className="pl-10 focus:ring-2 focus:ring-primary text-sm"
                  value={searchTerm} // Binds input value to the state
                  onChange={(e) => setSearchTerm(e.target.value)} // Updates state on change
                />
              </div>
              <Button variant="secondary" className="text-xs sm:text-sm hover:bg-secondary/90" onClick={handleExportPDF} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-1 sm:mr-2" />}
                <span className="hidden sm:inline">Exportar PDF</span> <span className="sm:hidden">PDF</span>
              </Button>
            </div>

            <Card className="shadow-sm overflow-hidden border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm text-muted-foreground">Data/Hora</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm text-muted-foreground">Usuário</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm text-muted-foreground">Ação</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm text-muted-foreground">Módulo</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm text-muted-foreground">Alvo</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm text-muted-foreground">Detalhe</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-xs sm:text-sm text-muted-foreground">Severidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (<tr><td colSpan={7} className="text-center p-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>)
                        : error ? (<tr><td colSpan={7} className="text-center p-8 text-red-600"><ServerCrash className="h-5 w-5 mx-auto mb-2" />{error}</td></tr>)
                          : logs.length === 0 ? (<tr><td colSpan={7} className="text-center p-8 text-muted-foreground">Nenhum registro encontrado.</td></tr>)
                            : (logs.map((log, index) => (
                              <tr key={log.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                                <td className="p-3 sm:p-4 text-xs sm:text-sm whitespace-nowrap">{format(new Date(log.createdAt), 'dd/MM/yy HH:mm:ss', { locale: ptBR })}</td>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm">{log.userName}</td>
                                <td className="p-3 sm:p-4">
                                  <Badge variant="outline" className="text-[10px] sm:text-xs font-medium"> {log.action} </Badge>
                                </td>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm">{formatModuleName(log)}</td>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium">{log.target || 'N/A'}</td>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{log.details}</td>
                                <td className="p-3 sm:p-4">
                                  {/* --- MUDANÇA: Novo Estilo de Badge de Severidade --- */}
                                  <Badge
                                    variant="outline" // Usa outline para a borda
                                    className={`
                                  text-[10px] sm:text-xs font-semibold rounded-full px-2.5 py-0.5 border-2  // Forma e Padding
                                  ${log.severity === "ALTA" ? "bg-red-100 text-red-700 border-red-200" :
                                        log.severity === "MEDIA" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                          "bg-blue-100 text-blue-700 border-blue-200" // Baixa usa azul
                                      }
                                `}
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
                <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-muted/50 text-xs sm:text-sm">
                  <span className="text-muted-foreground font-medium"> Mostrando {logs.length} de {pagination.totalItems} registros </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover:bg-accent" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}> Anterior </Button>
                    <Button variant="outline" size="sm" disabled className="bg-secondary text-white"> {pagination.page} </Button>
                    <Button variant="outline" size="sm" className="hover:bg-accent" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}> Próximo </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-md border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
              Os logs de auditoria são mantidos por 30 dias e depois excluídos automaticamente.
            </div>

          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto"> © 2025_V02 Arco Security I Academy I Solutions - Todos os direitos reservados. </div>
      </footer>
    </div>
  );
};

export default Auditoria;