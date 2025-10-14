import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Calendar, Filter, FileText, AlertCircle } from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const Auditoria = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    modulo: "all",
    acao: "all",
    usuario: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  const auditLogs = [
    {
      id: "1",
      timestamp: "2024-10-03 14:30:25",
      usuario: "João Silva",
      acao: "Upload de Documento",
      modulo: "Normas e Procedimentos",
      detalhe: "Adicionou: Razão Social e CNPJ.pdf",
      ip: "192.168.1.100",
      status: "Sucesso"
    },
    {
      id: "2",
      timestamp: "2024-10-03 13:15:10",
      usuario: "Maria Santos",
      acao: "Exclusão de Câmera",
      modulo: "Sistema CFTV",
      detalhe: "Removeu câmera CAM-025",
      ip: "192.168.1.105",
      status: "Sucesso"
    },
    {
      id: "3",
      timestamp: "2024-10-03 11:45:33",
      usuario: "Pedro Costa",
      acao: "Edição de Documento",
      modulo: "Legislação",
      detalhe: "Atualizou: Lei Portuária 2024.pdf",
      ip: "192.168.1.102",
      status: "Sucesso"
    },
    {
      id: "4",
      timestamp: "2024-10-03 10:22:15",
      usuario: "Ana Oliveira",
      acao: "Login",
      modulo: "Sistema",
      detalhe: "Acesso ao sistema via navegador Chrome",
      ip: "192.168.1.108",
      status: "Sucesso"
    },
    {
      id: "5",
      timestamp: "2024-10-03 09:15:42",
      usuario: "Carlos Mendes",
      acao: "Tentativa de Acesso Negado",
      modulo: "Sistema",
      detalhe: "Tentativa de acesso sem permissão ao módulo de Auditoria",
      ip: "192.168.1.112",
      status: "Falha"
    },
    {
      id: "6",
      timestamp: "2024-10-02 16:45:30",
      usuario: "João Silva",
      acao: "Adição de Câmera",
      modulo: "Sistema CFTV",
      detalhe: "Adicionou câmera CAM-156 na Portaria 05",
      ip: "192.168.1.100",
      status: "Sucesso"
    },
    {
      id: "7",
      timestamp: "2024-10-02 15:20:18",
      usuario: "Maria Santos",
      acao: "Download de Relatório",
      modulo: "Sistema",
      detalhe: "Exportou relatório de câmeras em Excel",
      ip: "192.168.1.105",
      status: "Sucesso"
    },
    {
      id: "8",
      timestamp: "2024-10-02 14:10:55",
      usuario: "Pedro Costa",
      acao: "Alteração de Permissões",
      modulo: "Gestão de Usuários",
      detalhe: "Modificou permissões do usuário Ana Oliveira",
      ip: "192.168.1.102",
      status: "Sucesso"
    }
  ];

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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">{auditLogs.length}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">{auditLogs.filter(l => l.status === "Sucesso").length}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Sucesso</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">{auditLogs.filter(l => l.status === "Falha").length}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Falhas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">Hoje</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Período</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="shadow-lg">
              <CardHeader className="bg-muted/30 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Filtros de Auditoria
                  </CardTitle>
                  <Button
                    variant="outline"
                    className="hover:bg-destructive hover:text-destructive-foreground text-xs sm:text-sm w-full sm:w-auto"
                    onClick={() => setFilters({
                      startDate: "",
                      endDate: "",
                      modulo: "all",
                      acao: "all",
                      usuario: ""
                    })}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Data Início</label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Data Fim</label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Módulo</label>
                    <Select value={filters.modulo} onValueChange={(value) => setFilters({ ...filters, modulo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="sistema">Sistema</SelectItem>
                        <SelectItem value="normas">Normas e Procedimentos</SelectItem>
                        <SelectItem value="cftv">Sistema CFTV</SelectItem>
                        <SelectItem value="legislacao">Legislação</SelectItem>
                        <SelectItem value="usuarios">Gestão de Usuários</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Ação</label>
                    <Select value={filters.acao} onValueChange={(value) => setFilters({ ...filters, acao: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                        <SelectItem value="edicao">Edição</SelectItem>
                        <SelectItem value="exclusao">Exclusão</SelectItem>
                        <SelectItem value="download">Download</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Usuário</label>
                    <Input
                      placeholder="Nome do usuário"
                      value={filters.usuario}
                      onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Export */}
            <Card className="shadow-md">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Pesquisar em registros..."
                      className="pl-10 focus:ring-2 focus:ring-primary text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-secondary hover:bg-secondary/90 text-xs sm:text-sm">
                      <Download className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Exportar Excel</span>
                      <span className="sm:hidden">Excel</span>
                    </Button>
                    <Button variant="outline" className="text-xs sm:text-sm">
                      <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Exportar PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card className="shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-secondary/10 border-b-2 border-secondary">
                      <tr>
                        <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">Data/Hora</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">Usuário</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">Ação</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">Módulo</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">Detalhe</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">IP</th>
                        <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, index) => (
                        <tr key={log.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{log.timestamp}</td>
                          <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">{log.usuario}</td>
                          <td className="p-2 sm:p-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] sm:text-xs whitespace-nowrap ${log.acao.includes('Upload') ? 'bg-green-100 text-green-800 border-green-300' :
                                log.acao.includes('Edição') || log.acao.includes('Alteração') ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  log.acao.includes('Exclusão') ? 'bg-red-100 text-red-800 border-red-300' :
                                    log.acao.includes('Login') ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                      log.acao.includes('Download') ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                        'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                            >
                              {log.acao}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{log.modulo}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground max-w-[200px] truncate">{log.detalhe}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground font-mono">{log.ip}</td>
                          <td className="p-2 sm:p-4">
                            <Badge
                              variant={log.status === "Sucesso" ? "default" : "destructive"}
                              className={`text-[10px] sm:text-xs ${log.status === "Sucesso" ? "bg-green-500" : "bg-red-500"}`}
                            >
                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-muted/20 text-xs sm:text-sm">
                  <span className="text-muted-foreground font-medium text-center sm:text-left">
                    Mostrando <span className="text-foreground">{auditLogs.length}</span> de <span className="text-foreground">{auditLogs.length}</span> registros
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover-lift text-xs">
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled className="bg-secondary text-white text-xs">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="hover-lift text-xs">
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto">
          © 2025_V02 Arco Security I  Academy  I  Solutions - Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Auditoria;