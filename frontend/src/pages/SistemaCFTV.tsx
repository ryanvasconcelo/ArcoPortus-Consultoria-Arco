import { useState, useEffect, useMemo } from "react";
import { cameraService, Camera } from "@/services/cameraService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RecordingTimer } from "@/components/RecordingTimer";
import {
  Plus, Search, Edit, Trash2, Upload, X,
  ChevronLeft, ChevronRight, Video, CheckCircle, XCircle, Wrench, Download, Loader2, AlertTriangle
} from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { EnhancedCameraModal } from "@/components/EnhancedCameraModal";
import { AddCameraModal } from "@/components/AddCameraModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const ITEMS_PER_PAGE = 7;
type StatusFilter = 'all' | 'operacional' | 'inativa';

const SistemaCFTV = () => {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteManyOpen, setIsDeleteManyOpen] = useState(false);
  const [isDeletingMany, setIsDeletingMany] = useState(false);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);

  const handleSelectCamera = (id: string, isChecked: boolean) => {
    setSelectedCameras(prev => {
      if (isChecked) {
        return [...prev, id];
      } else {
        return prev.filter(cameraId => cameraId !== id);
      }
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = paginatedCameras.map(camera => camera.id);
      setSelectedCameras(allIds);
    } else {
      setSelectedCameras([]);
    }
  };

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const data = await cameraService.listCameras();
      setCameras(data);
    } catch (error) {
      console.error("Falha ao buscar câmeras:", error);
      toast({ title: "Erro ao Carregar", description: "Não foi possível buscar a lista de câmeras.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleSubmitCamera = async (cameraData: Partial<Camera>) => {
    try {
      if (editingCamera) {
        const updatedCamera = await cameraService.updateCamera(editingCamera.id, cameraData);
        setCameras(cameras.map(c => (c.id === editingCamera.id ? updatedCamera : c)));
        if (selectedCamera?.id === editingCamera.id) {
          setSelectedCamera(updatedCamera);
        }
        toast({ title: "Câmera atualizada", description: "Dados atualizados com sucesso!" });
      } else {
        const newCamera = await cameraService.createCamera(cameraData);
        setCameras(prev => [newCamera, ...prev]);
        toast({ title: "Câmera adicionada", description: "Nova câmera cadastrada!" });
      }
      setIsAddCameraOpen(false);
      setEditingCamera(null);
    } catch (error: any) {
      console.error("Falha ao salvar câmera:", error);
      const serverMessage = error.response?.data?.message || "Não foi possível salvar os dados da câmera.";
      toast({ title: "Erro ao Salvar", description: serverMessage, variant: "destructive" });
    }
  };

  const handleDeleteCamera = async (id: string) => {
    setIsDeleting(true);
    try {
      await cameraService.deleteCamera(id);
      setCameras(cameras.filter(c => c.id !== id));
      if (selectedCamera?.id === id) {
        setSelectedCamera(null);
      }
      toast({ title: "Câmera removida", description: "Câmera excluída com sucesso." });
    } catch (error: any) {
      console.error("Falha ao excluir câmera:", error);
      const serverMessage = error.response?.data?.message || "Não foi possível excluir a câmera.";
      toast({ title: "Erro ao Excluir", description: serverMessage, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setCameraToDelete(null);
    }
  };

  const handleDeleteManyCameras = async () => {
    setIsDeletingMany(true);
    try {
      const result = await cameraService.deleteManyCameras(selectedCameras);
      toast({ title: "Exclusão em Massa Concluída", description: result.message || `${result.count} câmeras foram excluídas.` });
      setIsDeleteManyOpen(false);
      setSelectedCameras([]);
      await fetchCameras();
    } catch (error: any) {
      console.error("Falha ao excluir câmeras em massa:", error);
      const serverMessage = error.response?.data?.message || "Não foi possível excluir as câmeras.";
      toast({ title: "Erro na Exclusão", description: serverMessage, variant: "destructive" });
    } finally {
      setIsDeletingMany(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await cameraService.importCameras(file);
      toast({ title: "Importação Concluída", description: result.message || "Câmeras importadas." });
      setIsImportModalOpen(false);
      await fetchCameras();
    } catch (error: any) {
      console.error("Falha na importação:", error);
      const serverMessage = error.response?.data?.message || "O arquivo enviado está fora do padrão ou ocorreu um erro.";
      toast({ title: "Erro na Importação", description: serverMessage, variant: "destructive" });
      setIsImportModalOpen(false);
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
      const blob = await cameraService.exportCameras();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'export_cameras.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Exportação Concluída", description: "O arquivo de câmeras foi baixado." });
    } catch (error: any) {
      console.error("Falha na exportação:", error);
      const serverMessage = error.response?.data?.message || "Não foi possível gerar o arquivo.";
      toast({ title: "Erro na Exportação", description: serverMessage, variant: "destructive" });
    }
  };

  // ✅ CORREÇÃO #6: Download do Template
  const handleDownloadTemplate = async () => {
    try {
      const blob = await cameraService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_importacao_cameras.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Download Concluído", description: "O template de importação foi baixado." });
    } catch (error: any) {
      console.error("Falha no download do template:", error);
      const serverMessage = error.response?.data?.message || "Não foi possível baixar o template.";
      toast({ title: "Erro no Download", description: serverMessage, variant: "destructive" });
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
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(camera =>
        camera.name.toLowerCase().includes(lowerSearchTerm) ||
        camera.location?.toLowerCase().includes(lowerSearchTerm) ||
        camera.ipAddress?.toLowerCase().includes(lowerSearchTerm)
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
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Carregando sistema de câmeras...</span>
      </div>
    );
  }

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

              {/* Cards de Status */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card onClick={() => setStatusFilter('all')} className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statusData.total}</div>
                  </CardContent>
                </Card>
                <Card onClick={() => setStatusFilter('operacional')} className={`cursor-pointer transition-all ${statusFilter === 'operacional' ? 'ring-2 ring-green-500' : 'hover:border-green-500/50'}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Operacional</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statusData.operacional}</div>
                  </CardContent>
                </Card>
                <Card onClick={() => setStatusFilter('inativa')} className={`cursor-pointer transition-all ${statusFilter === 'inativa' ? 'ring-2 ring-red-500' : 'hover:border-red-500/50'}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inativas</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statusData.inativa}</div>
                  </CardContent>
                </Card>
                <Card className="cursor-not-allowed opacity-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
              </div>

              {/* Barra de Ações */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Pesquisar por nome, local ou IP..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={() => { setEditingCamera(null); setIsAddCameraOpen(true); }} className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />Nova
                      </Button>
                      <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="flex-1">
                        <Upload className="h-4 w-4 mr-2" />Importar
                      </Button>
                      <Button variant="outline" onClick={handleExport} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />Exportar
                      </Button>
                      <Button variant="outline" onClick={handleDownloadTemplate} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />Template
                      </Button>
                      <Button variant="destructive" onClick={() => setIsDeleteManyOpen(true)} className="flex-1" disabled={selectedCameras.length === 0}>
                        <Trash2 className="h-4 w-4 mr-2" />Excluir ({selectedCameras.length})
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Layout Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={selectedCamera ? "lg:col-span-2" : "col-span-1 lg:col-span-3 transition-all duration-300"}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-center p-2 sm:p-4 font-medium text-xs sm:text-sm w-10">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary rounded" checked={selectedCameras.length === paginatedCameras.length && paginatedCameras.length > 0} onChange={handleSelectAll} />
                              </th>
                              <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Nº Câmera</th>
                              <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">Local</th>
                              <th className="text-center p-2 sm:p-4 font-medium text-xs sm:text-sm">Unidade</th>
                              <th className="text-center p-2 sm:p-4 font-medium text-xs sm:text-sm">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedCameras.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-10 text-muted-foreground">
                                  Nenhuma câmera encontrada{searchTerm ? ` para "${searchTerm}"` : ''}{statusFilter !== 'all' ? ` com status "${statusFilter}"` : ''}.
                                </td>
                              </tr>
                            ) : (
                              paginatedCameras.map((camera) => (
                                <tr key={camera.id} className={`border-t cursor-pointer hover:bg-muted/40 transition-colors ${selectedCameras.includes(camera.id) ? 'bg-secondary/10' : ''}`} onClick={() => setSelectedCamera(camera)}>
                                  <td className="p-2 sm:p-4 text-center">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 text-primary rounded" checked={selectedCameras.includes(camera.id)} onChange={(e) => handleSelectCamera(camera.id, e.target.checked)} onClick={(e) => e.stopPropagation()} />
                                  </td>
                                  <td className="p-2 sm:p-4 text-xs sm:text-sm font-medium">{camera.name}</td>
                                  <td className="p-2 sm:p-4 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-xs">{camera.location || '-'}</td>
                                  <td className="p-2 sm:p-4 text-xs sm:text-sm text-center">{camera.businessUnit || '-'}</td>
                                  <td className="p-2 sm:p-4 text-center">
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap ${camera.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {camera.isActive ? 'Operacional' : 'Inativa'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                          <span className="text-xs text-muted-foreground">Página {currentPage} de {totalPages} ({filteredCameras.length} {filteredCameras.length === 1 ? 'câmera' : 'câmeras'})</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {selectedCamera && (
                  <div className="lg:col-span-1 animate-fade-in">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-base truncate">{selectedCamera.name}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCamera(null)} className="h-7 w-7 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabricante:</span>
                          <span className="font-medium truncate ml-2">{selectedCamera.fabricante || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Modelo:</span>
                          <span className="font-medium truncate ml-2">{selectedCamera.model || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium truncate ml-2">{selectedCamera.type || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Área:</span>
                          <span className="font-medium truncate ml-2">{selectedCamera.area || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IP:</span>
                          <span className="font-mono ml-2">{selectedCamera.ipAddress || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Analítico:</span>
                          <span className={`font-medium ml-2 ${selectedCamera.hasAnalytics ? 'text-blue-600' : ''}`}>
                            {selectedCamera.hasAnalytics ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tempo Gravado:</span>
                          <RecordingTimer
                            createdAt={selectedCamera.createdAt}
                            initialHours={selectedCamera.recordingHours}
                            deactivatedAt={selectedCamera.deactivatedAt}
                            isActive={selectedCamera.isActive}
                          />
                        </div>
                        <div className="pt-4 flex gap-2 border-t">
                          <Button size="sm" variant="outline" onClick={() => { setEditingCamera(selectedCamera); setIsAddCameraOpen(true); }} className="flex-1">
                            <Edit className="h-4 w-4 mr-1 sm:mr-2" /> Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setCameraToDelete(selectedCamera)} className="flex-1">
                            <Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> Excluir
                          </Button>
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

        {isAddCameraOpen && (
          <EnhancedCameraModal
            editData={editingCamera}
            onClose={() => { setIsAddCameraOpen(false); setEditingCamera(null); }}
            onSubmit={handleSubmitCamera}
          />
        )}
        {isImportModalOpen && (
          <AddCameraModal onClose={() => setIsImportModalOpen(false)} onImport={handleImport} />
        )}
        <ConfirmationModal
          isOpen={!!cameraToDelete}
          onClose={() => setCameraToDelete(null)}
          onConfirm={() => cameraToDelete && handleDeleteCamera(cameraToDelete.id)}
          title="Confirmar Exclusão"
          message={<>Tem certeza que deseja excluir a câmera <strong>{cameraToDelete?.name}</strong>?</>}
          isLoading={isDeleting}
        />
        <ConfirmationModal
          isOpen={isDeleteManyOpen}
          onClose={() => setIsDeleteManyOpen(false)}
          onConfirm={handleDeleteManyCameras}
          title={`Confirmar Exclusão de ${selectedCameras.length} Câmera(s)`}
          message={
            <>
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <p className="text-lg font-bold text-center text-destructive">AÇÃO IRREVERSÍVEL!</p>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Você tem certeza que deseja excluir as <strong>{selectedCameras.length} câmeras selecionadas</strong>?
              </p>
              <p className="text-xs text-muted-foreground mt-4 text-center">Esta ação não pode ser desfeita.</p>
            </>
          }
          isLoading={isDeletingMany}
          confirmButtonVariant="destructive"
        />
      </div>
    </TooltipProvider>
  );
};

export default SistemaCFTV;