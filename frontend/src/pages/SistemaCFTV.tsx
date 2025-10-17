import { useState, useEffect, useMemo } from "react";
import { cameraService, Camera } from "@/services/cameraService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { RecordingTimer } from "@/components/RecordingTimer";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileSpreadsheet,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Video,
  CheckCircle,
  XCircle,
  Wrench, // Corrigido: 'Tool' foi trocado por 'Wrench'
  Download, // Corrigido: 'Download' foi adicionado de volta à lista
} from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { EnhancedCameraModal } from "@/components/EnhancedCameraModal";
import { AddCameraModal } from "@/components/AddCameraModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { InstructionsModal } from "@/components/InstructionsModal";
import api from "@/services/api";

const ITEMS_PER_PAGE = 7;

type StatusFilter = 'all' | 'operacional' | 'inativa';

const SistemaCFTV = () => {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const data = await cameraService.listCameras();
      setCameras(data);
    } catch (error) {
      console.error("Falha ao buscar câmeras:", error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível buscar a lista de câmeras do servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleSubmitCamera = async (cameraData: any) => {
    try {
      if (editingCamera) {
        const updatedCamera = await cameraService.updateCamera(editingCamera.id, cameraData);
        setCameras(cameras.map(c => (c.id === editingCamera.id ? updatedCamera : c)));
        setSelectedCamera(updatedCamera);
        toast({ title: "Câmera atualizada", description: "Dados da câmera atualizados com sucesso!" });
      } else {
        const newCamera = await cameraService.createCamera(cameraData);
        setCameras(prev => [newCamera, ...prev]);
        toast({ title: "Câmera adicionada", description: "Nova câmera cadastrada com sucesso!" });
      }
      setIsAddCameraOpen(false);
      setEditingCamera(null);
    } catch (error) {
      console.error("Falha ao salvar câmera:", error);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar os dados da câmera.", variant: "destructive" });
    }
  };

  const handleDeleteCamera = async (id: string) => {
    setIsDeleting(true);
    try {
      await cameraService.deleteCamera(id);
      setCameras(cameras.filter(c => c.id !== id));
      setSelectedCamera(null);
      toast({ title: "Câmera removida", description: "Câmera excluída com sucesso." });
    } catch (error) {
      console.error("Falha ao excluir câmera:", error);
      toast({ title: "Erro ao Excluir", description: "Não foi possível excluir a câmera.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setCameraToDelete(null);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await cameraService.importCameras(file);
      toast({ title: "Importação Concluída", description: result.message });
      setIsImportModalOpen(false);
      await fetchCameras();
    } catch (error) {
      console.error("Falha na importação:", error);
      toast({ title: "Erro na Importação", description: "O arquivo enviado está fora do padrão.", variant: "destructive" });
      setIsImportModalOpen(false);
      throw error;
    }
  };

  const statusData = useMemo(() => {
    const total = cameras.length;
    if (total === 0) return { total: 0, operacional: 0, inativa: 0 };
    const operacionalCount = cameras.filter(c => c.isActive).length;
    const inativaCount = total - operacionalCount;
    return { total, operacional: operacionalCount, inativa: inativaCount };
  }, [cameras]);

  const handleExport = async () => {
    try {
      const response = await api.get('/api/cameras/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'export_cameras.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Exportação Concluída", description: "O arquivo de câmeras foi baixado." });
    } catch (error) {
      console.error("Falha na exportação:", error);
      toast({ title: "Erro na Exportação", description: "Não foi possível gerar o arquivo.", variant: "destructive" });
    }
  };

  const filteredCameras = useMemo(() => {
    let filtered = cameras;
    if (statusFilter === 'operacional') {
      filtered = filtered.filter(camera => camera.isActive);
    } else if (statusFilter === 'inativa') {
      filtered = filtered.filter(camera => !camera.isActive);
    }
    if (searchTerm) {
      filtered = filtered.filter(camera =>
        camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [cameras, statusFilter, searchTerm]);

  const paginatedCameras = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCameras.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCameras, currentPage]);

  const totalPages = Math.ceil(filteredCameras.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  if (isLoading) {
    return (<div className="flex h-screen items-center justify-center"><p>Carregando sistema de câmeras...</p></div>);
  }

  const totalCameras = cameras.length;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <ArcoPortusHeader />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <div className="bg-secondary text-white text-center py-3 sm:py-4 rounded-t-lg mb-4 sm:mb-6">
                <h1 className="text-lg sm:text-xl font-bold px-4">SISTEMA DE CFTV</h1>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card onClick={() => setStatusFilter('all')} className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle><Video className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{statusData.total}</div></CardContent>
                </Card>
                <Card onClick={() => setStatusFilter('operacional')} className={`cursor-pointer transition-all ${statusFilter === 'operacional' ? 'ring-2 ring-green-500' : 'hover:border-green-500/50'}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Operacional</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{statusData.operacional}</div></CardContent>
                </Card>
                <Card onClick={() => setStatusFilter('inativa')} className={`cursor-pointer transition-all ${statusFilter === 'inativa' ? 'ring-2 ring-red-500' : 'hover:border-red-500/50'}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Inativas</CardTitle><XCircle className="h-4 w-4 text-red-500" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{statusData.inativa}</div></CardContent>
                </Card>
                <Card className="cursor-not-allowed opacity-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Manutenção</CardTitle><Wrench className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">0</div></CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Pesquisar por nome, local ou IP..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={() => { setEditingCamera(null); setIsAddCameraOpen(true); }} className="flex-1"><Plus className="h-4 w-4 mr-2" />Nova Câmera</Button>
                      <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="flex-1"><Upload className="h-4 w-4 mr-2" />Importar câmeras</Button>
                      <Button variant="outline" onClick={handleExport} className="flex-1"><Download className="h-4 w-4 mr-2" />Exportar</Button>
                      <Button variant="outline" onClick={() => setIsInstructionsOpen(true)} className="flex-1"><FileSpreadsheet className="h-4 w-4 mr-2" />Modelo</Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={selectedCamera ? "lg:col-span-2" : "col-span-3 transition-all duration-300"}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Nº Câmera</th>
                              <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Local</th>
                              <th className="text-center p-2 sm:p-4 font-medium text-xs sm:text-sm">Unidade</th>
                              <th className="text-center p-2 sm:p-4 font-medium text-xs sm:text-sm">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedCameras.map((camera) => (
                              <tr key={camera.id} className={`border-t cursor-pointer hover:bg-muted/40 transition-colors ${selectedCamera?.id === camera.id ? 'bg-secondary/10' : ''}`} onClick={() => setSelectedCamera(camera)}>
                                <td className="p-2 sm:p-4 text-xs sm:text-sm font-medium">{camera.name}</td>
                                <td className="p-2 sm:p-4 text-xs sm:text-sm truncate max-w-xs">{camera.location || '-'}</td>
                                <td className="p-2 sm:p-4 text-xs sm:text-sm text-center">{camera.businessUnit || '-'}</td>
                                <td className="p-2 sm:p-4 text-center">
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap ${camera.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{camera.isActive ? 'Operacional' : 'Inativa'}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between p-4 border-t">
                        <span className="text-xs text-muted-foreground">Página {currentPage} de {totalPages}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline ml-2">Anterior</span></Button>
                          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><span className="hidden sm:inline mr-2">Próxima</span><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedCamera && (
                  <div className="lg:col-span-1 animate-fade-in">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base truncate">{selectedCamera.name}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCamera(null)} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Fabricante:</span><span className="font-medium">{selectedCamera.fabricante || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Modelo:</span><span className="font-medium">{selectedCamera.model || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tipo:</span><span className="font-medium">{selectedCamera.type || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Área:</span><span className="font-medium">{selectedCamera.area || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">IP:</span><span className="font-mono">{selectedCamera.ipAddress || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Analítico:</span><span className={`font-medium ${selectedCamera.hasAnalytics ? 'text-blue-600' : ''}`}>{selectedCamera.hasAnalytics ? 'Sim' : 'Não'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tempo Gravado:</span><RecordingTimer createdAt={selectedCamera.createdAt} initialDays={selectedCamera.recordingDays} deactivatedAt={selectedCamera.deactivatedAt} isActive={selectedCamera.isActive} /></div>
                        <div className="pt-4 flex gap-2 border-t">
                          <Button size="sm" variant="outline" onClick={() => { setEditingCamera(selectedCamera); setIsAddCameraOpen(true); }} className="flex-1"><Edit className="h-4 w-4 mr-2" /> Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => setCameraToDelete(selectedCamera)} className="flex-1"><Trash2 className="h-4 w-4 mr-2" /> Excluir</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
          <div className="container mx-auto">© 2025_V02 Arco Security I  Academy  I  Solutions - Todos os direitos reservados.</div>
        </footer>

        {isAddCameraOpen && (<EnhancedCameraModal editData={editingCamera} onClose={() => { setIsAddCameraOpen(false); setEditingCamera(null); }} onSubmit={handleSubmitCamera} />)}
        {isImportModalOpen && (<AddCameraModal onClose={() => setIsImportModalOpen(false)} onImport={handleImport} />)}
        <ConfirmationModal isOpen={!!cameraToDelete} onClose={() => setCameraToDelete(null)} onConfirm={() => cameraToDelete && handleDeleteCamera(cameraToDelete.id)} title="Confirmar Exclusão" message={<>Tem certeza que deseja excluir a câmera <strong>{cameraToDelete?.name}</strong>?</>} isLoading={isDeleting} />
        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
          title="Instruções para Importação"
          downloadUrl="/modelo_importacao_cameras.xlsx"
          downloadFilename="Modelo_Importacao_Cameras.xlsx"
        >
          <ul className="space-y-2 list-decimal pl-4">
            <li>Abra o modelo de planilha e preencha as informações das câmeras, uma por linha.</li>
            <li>A coluna <strong>"Nº Câmera"</strong> é obrigatória para cada registro.</li>
            <li>Para as colunas "Em Funcionamento ?" e "POSSUI ANÁLITICO?", use apenas os textos "Sim" ou "Não".</li>
            <li>Salve o arquivo preenchido, mantendo o formato <strong>.xlsx</strong>.</li>
            <li>Clique no botão "Importar" e selecione o seu arquivo salvo.</li>
          </ul>
        </InstructionsModal>
      </div>
    </TooltipProvider>
  );
};

export default SistemaCFTV;