import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Camera,
  FileText,
  Plus,
  Search,
  Download,
  Upload,
  Filter,
  Edit,
  Trash2,
  FileSpreadsheet
} from "lucide-react";
import { useState } from "react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { EnhancedCameraModal } from "@/components/EnhancedCameraModal";
import { AddCameraModal } from "@/components/AddCameraModal";
import { useToast } from "@/hooks/use-toast";

const SistemaCFTV = () => {
  const { toast } = useToast();
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    unidadeNegocio: "all",
    numeroCamera: "",
    localInstalacao: "",
    emFuncionamento: "all",
    tipo: "all",
    areaExternaInterna: "all",
    fabricante: "all",
    modelo: "",
    possuiAnalitico: "all",
    diasGravacao: "all"
  });

  const [cameras, setCameras] = useState([
    {
      id: "1",
      unidadeNegocio: "Porto Chibatão",
      numeroCamera: "CAM-001",
      localInstalacao: "Portaria 02",
      emFuncionamento: "Sim",
      tipo: "Bullet",
      areaExternaInterna: "Externa",
      fabricante: "Intelbras",
      modelo: "VIP 1230 B",
      possuiAnalitico: "Não",
      diasGravacao: "30",
      ip: "192.168.1.10"
    },
    {
      id: "2",
      unidadeNegocio: "Porto Chibatão",
      numeroCamera: "CAM-002",
      localInstalacao: "Portaria 03",
      emFuncionamento: "Sim",
      tipo: "PTZ",
      areaExternaInterna: "Interna",
      fabricante: "Hikvision",
      modelo: "DS-2DE4A425IW-DE",
      possuiAnalitico: "Sim",
      diasGravacao: "60",
      ip: "192.168.1.11"
    },
    {
      id: "3",
      unidadeNegocio: "Porto Chibatão",
      numeroCamera: "CAM-003",
      localInstalacao: "Pier",
      emFuncionamento: "Em Manutenção",
      tipo: "Dome",
      areaExternaInterna: "Externa",
      fabricante: "Axis",
      modelo: "M3046-V",
      possuiAnalitico: "Sim",
      diasGravacao: "45",
      ip: "192.168.1.12"
    }
  ]);

  const totalCameras = 856;
  const statusData = [
    { label: "Operacional", value: 45, color: "bg-green-500" },
    { label: "Em Manutenção", value: 30, color: "bg-yellow-500" },
    { label: "Defeituosa", value: 15, color: "bg-red-500" },
    { label: "Offline", value: 10, color: "bg-gray-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="bg-secondary text-white text-center py-3 sm:py-4 rounded-t-lg mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl font-bold px-4">SISTEMA DE CFTV</h1>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Camera className="h-5 w-5 sm:h-8 sm:w-8 text-secondary mb-1 sm:mb-2" />
                      <div className="text-lg sm:text-2xl font-bold">{totalCameras}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">TOTAL</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {statusData.map((status, index) => (
                <Card key={index}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${status.color} flex-shrink-0`}></div>
                      <div>
                        <div className="text-lg sm:text-2xl font-bold">{status.value}%</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{status.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status Message */}
            <Card className="mb-4 sm:mb-6">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center text-red-600 font-medium text-sm">
                  [Em construção]
                </div>
              </CardContent>
            </Card>

            {/* Control Panel */}
            <Card className="mb-4 sm:mb-6">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">Controle de Câmeras</CardTitle>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex-1 sm:flex-none text-sm"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    <Button
                      onClick={() => setIsAddCameraOpen(true)}
                      className="bg-secondary hover:bg-secondary/90 text-xs sm:text-sm col-span-2 sm:col-span-1"
                    >
                      <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                      Nova Câmera
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportModalOpen(true)}
                      className="text-xs sm:text-sm"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Importar Excel</span>
                      <span className="sm:hidden">Importar</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = 'user-uploads://DADOS_CFTV_DIGIFORT_V03.xlsx';
                        link.download = 'Modelo_Importacao_Cameras.xlsx';
                        link.click();
                        toast({
                          title: "Download iniciado",
                          description: "Modelo de importação baixado com sucesso!"
                        });
                      }}
                      className="text-xs sm:text-sm"
                    >
                      <Download className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Baixar Modelo</span>
                      <span className="sm:hidden">Modelo</span>
                    </Button>
                    <Button variant="outline" className="text-xs sm:text-sm">
                      <Download className="h-4 w-4 mr-1 sm:mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Filters */}
            {showFilters && (
              <Card className="mb-4 sm:mb-6 animate-fade-in">
                <CardContent className="p-3 sm:pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Unidade de Negócio</label>
                      <Select value={filters.unidadeNegocio} onValueChange={(value) => setFilters({ ...filters, unidadeNegocio: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="Porto Chibatão">Porto Chibatão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Nº Câmera</label>
                      <Input
                        placeholder="Ex: CAM-001"
                        value={filters.numeroCamera}
                        onChange={(e) => setFilters({ ...filters, numeroCamera: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Local de Instalação</label>
                      <Input
                        placeholder="Ex: Portaria"
                        value={filters.localInstalacao}
                        onChange={(e) => setFilters({ ...filters, localInstalacao: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Em Funcionamento?</label>
                      <Select value={filters.emFuncionamento} onValueChange={(value) => setFilters({ ...filters, emFuncionamento: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                          <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Tipo</label>
                      <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Bullet">Bullet</SelectItem>
                          <SelectItem value="Dome">Dome</SelectItem>
                          <SelectItem value="PTZ">PTZ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Área</label>
                      <Select value={filters.areaExternaInterna} onValueChange={(value) => setFilters({ ...filters, areaExternaInterna: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="Externa">Externa</SelectItem>
                          <SelectItem value="Interna">Interna</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Fabricante</label>
                      <Select value={filters.fabricante} onValueChange={(value) => setFilters({ ...filters, fabricante: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Intelbras">Intelbras</SelectItem>
                          <SelectItem value="Hikvision">Hikvision</SelectItem>
                          <SelectItem value="Axis">Axis</SelectItem>
                          <SelectItem value="Dahua">Dahua</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Modelo</label>
                      <Input
                        placeholder="Ex: VIP 1230"
                        value={filters.modelo}
                        onChange={(e) => setFilters({ ...filters, modelo: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Possui Analítico?</label>
                      <Select value={filters.possuiAnalitico} onValueChange={(value) => setFilters({ ...filters, possuiAnalitico: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Dias de Gravação</label>
                      <Select value={filters.diasGravacao} onValueChange={(value) => setFilters({ ...filters, diasGravacao: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="7">7 dias</SelectItem>
                          <SelectItem value="15">15 dias</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="45">45 dias</SelectItem>
                          <SelectItem value="60">60 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3 sm:mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({
                        unidadeNegocio: "all",
                        numeroCamera: "",
                        localInstalacao: "",
                        emFuncionamento: "all",
                        tipo: "all",
                        areaExternaInterna: "all",
                        fabricante: "all",
                        modelo: "",
                        possuiAnalitico: "all",
                        diasGravacao: "all"
                      })}
                      className="text-xs sm:text-sm"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search */}
            <div className="mb-4 sm:mb-6 px-2 sm:px-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar câmeras..."
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* Cameras Table */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Unidade</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Nº Câmera</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Local</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Status</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Tipo</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Área</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Fabricante</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Modelo</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Analítico</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Dias</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">IP</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cameras.map((camera, index) => (
                        <tr key={camera.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{camera.unidadeNegocio}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm font-medium">{camera.numeroCamera}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{camera.localInstalacao}</td>
                          <td className="p-2 sm:p-4">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap ${camera.emFuncionamento === 'Sim' ? 'bg-green-100 text-green-800' :
                              camera.emFuncionamento === 'Em Manutenção' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {camera.emFuncionamento}
                            </span>
                          </td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{camera.tipo}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{camera.areaExternaInterna}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{camera.fabricante}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{camera.modelo}</td>
                          <td className="p-2 sm:p-4">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap ${camera.possuiAnalitico === 'Sim' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {camera.possuiAnalitico}
                            </span>
                          </td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm">{camera.diasGravacao}</td>
                          <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground font-mono">{camera.ip || '-'}</td>
                          <td className="p-2 sm:p-4">
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCamera(camera);
                                  setIsAddCameraOpen(true);
                                }}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setCameras(cameras.filter(c => c.id !== camera.id));
                                  toast({
                                    title: "Câmera removida",
                                    description: "Câmera excluída com sucesso."
                                  });
                                }}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                  1 a {cameras.length} de {cameras.length} Registros
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

      {/* Add/Edit Camera Modal */}
      {isAddCameraOpen && (
        <EnhancedCameraModal
          editData={editingCamera}
          onClose={() => {
            setIsAddCameraOpen(false);
            setEditingCamera(null);
          }}
          onSubmit={(cameraData) => {
            if (editingCamera) {
              setCameras(cameras.map(c => c.id === editingCamera.id ? { ...cameraData, id: editingCamera.id } : c));
              toast({
                title: "Câmera atualizada",
                description: "Dados da câmera atualizados com sucesso!"
              });
            } else {
              setCameras([...cameras, { ...cameraData, id: Date.now().toString() }]);
              toast({
                title: "Câmera adicionada",
                description: "Nova câmera cadastrada com sucesso!"
              });
            }
            setIsAddCameraOpen(false);
            setEditingCamera(null);
          }}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <AddCameraModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={(importedCameras) => {
            setCameras([...cameras, ...importedCameras]);
            setIsImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SistemaCFTV;