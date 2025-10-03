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
  Trash2
} from "lucide-react";
import { useState } from "react";
import ArcoPortusHeader from "@/components/Header";
import ArcoPortusFooter from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { EnhancedCameraModal } from "@/components/EnhancedCameraModal";
import { useToast } from "@/hooks/use-toast";

const SistemaCFTV = () => {
  const { toast } = useToast();
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    unidadeNegocio: "",
    numeroCamera: "",
    localInstalacao: "",
    emFuncionamento: "",
    tipo: "",
    areaExternaInterna: "",
    fabricante: "",
    possuiAnalitico: ""
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
      diasGravacao: "30"
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
      diasGravacao: "60"
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
      diasGravacao: "45"
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

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-secondary text-white text-center py-4 rounded-t-lg mb-6">
              <h1 className="text-xl font-bold">SISTEMA DE CFTV</h1>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Camera className="h-8 w-8 text-secondary mb-2" />
                      <div className="text-2xl font-bold">{totalCameras}</div>
                      <div className="text-sm text-muted-foreground">TOTAL DE CÂMERAS</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {statusData.map((status, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
                      <div>
                        <div className="text-2xl font-bold">{status.value}%</div>
                        <div className="text-sm text-muted-foreground">{status.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status Message */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="text-center text-red-600 font-medium">
                  [Em construção]
                </div>
              </CardContent>
            </Card>

            {/* Control Panel */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Controle de Câmeras</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button
                      onClick={() => setIsAddCameraOpen(true)}
                      className="btn-secondary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Câmera
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
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Modelo
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Filters */}
            {showFilters && (
              <Card className="mb-6 animate-fade-in">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unidade de Negócio</label>
                      <Select value={filters.unidadeNegocio} onValueChange={(value) => setFilters({ ...filters, unidadeNegocio: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          <SelectItem value="Porto Chibatão">Porto Chibatão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nº Câmera</label>
                      <Input
                        placeholder="Ex: CAM-001"
                        value={filters.numeroCamera}
                        onChange={(e) => setFilters({ ...filters, numeroCamera: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Local de Instalação</label>
                      <Input
                        placeholder="Ex: Portaria"
                        value={filters.localInstalacao}
                        onChange={(e) => setFilters({ ...filters, localInstalacao: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Em Funcionamento?</label>
                      <Select value={filters.emFuncionamento} onValueChange={(value) => setFilters({ ...filters, emFuncionamento: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                          <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value="Bullet">Bullet</SelectItem>
                          <SelectItem value="Dome">Dome</SelectItem>
                          <SelectItem value="PTZ">PTZ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Área</label>
                      <Select value={filters.areaExternaInterna} onValueChange={(value) => setFilters({ ...filters, areaExternaInterna: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          <SelectItem value="Externa">Externa</SelectItem>
                          <SelectItem value="Interna">Interna</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fabricante</label>
                      <Select value={filters.fabricante} onValueChange={(value) => setFilters({ ...filters, fabricante: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value="Intelbras">Intelbras</SelectItem>
                          <SelectItem value="Hikvision">Hikvision</SelectItem>
                          <SelectItem value="Axis">Axis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Possui Analítico?</label>
                      <Select value={filters.possuiAnalitico} onValueChange={(value) => setFilters({ ...filters, possuiAnalitico: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline" onClick={() => setFilters({
                      unidadeNegocio: "",
                      numeroCamera: "",
                      localInstalacao: "",
                      emFuncionamento: "",
                      tipo: "",
                      areaExternaInterna: "",
                      fabricante: "",
                      possuiAnalitico: ""
                    })}>
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar câmeras..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Cameras Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Unidade de Negócio</th>
                        <th className="text-left p-4 font-medium">Nº Câmera</th>
                        <th className="text-left p-4 font-medium">Local de Instalação</th>
                        <th className="text-left p-4 font-medium">Em Funcionamento?</th>
                        <th className="text-left p-4 font-medium">Tipo</th>
                        <th className="text-left p-4 font-medium">Área Externa/Interna</th>
                        <th className="text-left p-4 font-medium">Fabricante</th>
                        <th className="text-left p-4 font-medium">Modelo</th>
                        <th className="text-left p-4 font-medium">Possui Analítico?</th>
                        <th className="text-left p-4 font-medium">Dias de Gravação</th>
                        <th className="text-left p-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cameras.map((camera, index) => (
                        <tr key={camera.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="p-4">{camera.unidadeNegocio}</td>
                          <td className="p-4">{camera.numeroCamera}</td>
                          <td className="p-4">{camera.localInstalacao}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${camera.emFuncionamento === 'Sim' ? 'bg-green-100 text-green-800' :
                              camera.emFuncionamento === 'Em Manutenção' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {camera.emFuncionamento}
                            </span>
                          </td>
                          <td className="p-4">{camera.tipo}</td>
                          <td className="p-4">{camera.areaExternaInterna}</td>
                          <td className="p-4">{camera.fabricante}</td>
                          <td className="p-4">{camera.modelo}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${camera.possuiAnalitico === 'Sim' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {camera.possuiAnalitico}
                            </span>
                          </td>
                          <td className="p-4">{camera.diasGravacao} dias</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCamera(camera);
                                  setIsAddCameraOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
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
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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

      <ArcoPortusFooter />

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
    </div>
  );
};

export default SistemaCFTV;