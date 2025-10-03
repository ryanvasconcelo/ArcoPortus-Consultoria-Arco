import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Calendar } from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import ArcoPortusFooter from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

const Auditoria = () => {
  const auditLogs = [
    {
      id: "1",
      timestamp: "2024-10-03 14:30:25",
      usuario: "João Silva",
      acao: "Upload de Documento",
      modulo: "Normas e Procedimentos",
      detalhe: "Adicionou: Razão Social e CNPJ.pdf",
      ip: "192.168.1.100"
    },
    {
      id: "2",
      timestamp: "2024-10-03 13:15:10",
      usuario: "Maria Santos",
      acao: "Exclusão de Câmera",
      modulo: "Sistema CFTV",
      detalhe: "Removeu câmera CAM-025",
      ip: "192.168.1.105"
    },
    {
      id: "3",
      timestamp: "2024-10-03 11:45:33",
      usuario: "Pedro Costa",
      acao: "Edição de Documento",
      modulo: "Legislação",
      detalhe: "Atualizou: Lei Portuária 2024.pdf",
      ip: "192.168.1.102"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />

          <div className="flex-1 min-w-0">
            <div className="bg-secondary text-white text-center py-4 rounded-t-lg mb-6">
              <h1 className="text-xl font-bold">SISTEMA DE AUDITORIA</h1>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros de Auditoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Período</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input type="date" className="flex-1" />
                      <Input type="date" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Módulo</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="normas">Normas e Procedimentos</SelectItem>
                        <SelectItem value="cftv">Sistema CFTV</SelectItem>
                        <SelectItem value="legislacao">Legislação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ação</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                        <SelectItem value="edicao">Edição</SelectItem>
                        <SelectItem value="exclusao">Exclusão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Usuário</label>
                    <Input placeholder="Nome do usuário" />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Registro de Atividades</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-medium text-sm">Data/Hora</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-sm">Usuário</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-sm">Ação</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-sm hidden md:table-cell">Módulo</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-sm hidden lg:table-cell">Detalhe</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-sm hidden xl:table-cell">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, index) => (
                        <tr key={log.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="p-3 sm:p-4 text-sm">{log.timestamp}</td>
                          <td className="p-3 sm:p-4 text-sm">{log.usuario}</td>
                          <td className="p-3 sm:p-4">
                            <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${log.acao.includes('Upload') ? 'bg-green-100 text-green-800' :
                              log.acao.includes('Edição') ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {log.acao}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-sm hidden md:table-cell">{log.modulo}</td>
                          <td className="p-3 sm:p-4 text-sm hidden lg:table-cell">{log.detalhe}</td>
                          <td className="p-3 sm:p-4 text-sm text-muted-foreground hidden xl:table-cell">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 text-sm text-muted-foreground border-t">
                  Mostrando {auditLogs.length} de {auditLogs.length} registros
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ArcoPortusFooter />
    </div>
  );
};

export default Auditoria;