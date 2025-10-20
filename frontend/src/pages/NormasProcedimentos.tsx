import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, Trash2, Search, ChevronDown, ChevronRight, Eye } from "lucide-react"; // Eye já importado
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { FileUploadModal } from "@/components/FileUploadModal";
import { FilePreviewModal } from "@/components/FilePreviewModal"; // Modal de Preview importado
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { fileService, Document } from "@/services/fileService";

// --- O MAPA (A FONTE DA VERDADE DA UI) ---
const documentStructure = {
  "01. DOCUMENTAÇÃO PRELIMINAR": {
    "1.1 INSTALAÇÃO PORTUÁRIA": ["1.1.1 Razão Social e CNPJ"],
    "1.2 SÓCIOS/PROPRIETÁRIOS/REPRESENTANTES": ["1.2.1 Carteira de Identidade", "1.2.2 CPF", "1.2.3 Estatuto (Comprovação de quem são os representantes legais)"],
    "1.3 SUPERVISORES DE SEGURANÇA PORTUÁRIA (SSP)": ["1.3.1 Carteira de Identidade", "1.3.2 CPF", "1.3.3 Certidão Negativa de Antecedentes Criminais expedida pela Justiça Federal", "1.3.4 Certidão Negativa de Antecedentes Criminais Expedidas pela Justiça Estadual", "1.3.5 Certificados do CESSP e CASSP do SSP", "1.3.6 Informações contidas no Global Integrated Shipping Information System (GISIS)"]
  },
  "02. ESTUDO DE AVALIAÇÃO DE RISCOS (EAR)": { "": ["2.1 Possui EAR aprovado e atualizado?"] },
  "03. PLANO DE SEGURANÇA PORTUÁRIA (PSP)": { "": ["3.1 Possui PSP aprovado e atualizado?"] },
  "04. SEGURANÇA": { "": ["4.16 Há procedimentos para os operadores do CFTV no caso de detecção de intrusão ou outra ocorrência anormal na instalação portuária?", "4.38 A equipe de segurança realiza patrulhas rotineiras em todas as áreas (notadamente nas controladas e restritas)?"] },
  "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)": { "": ["5.8 Os sistemas de controle de acesso e registro são auditáveis (registro por no mínimo 90 dias)?", "5.10 O controle dessas chaves e dos lacres está implementado? É adequado?", "5.13 Ocorre a exigência de termo de responsabilidade para a execução de serviços nos recursos críticos por pessoal externo, alertando para a vedação do acesso indevido às informações da instalação portuária?", "5.25 O uso de mídias e redes sociais é restrito às atividades de divulgação institucional?", "5.28 Há adestramento inicial (novos colaboradores) e contínuo (manutenção de uma cultura de segurança) no que tange à proteção na área de TI?", "5.29 Existe controle de presença nesses adestramentos?", "5.33 Existe plano de contingência para o Setor de TI?"] }
};

interface SelectedItem { category: string; subcategory: string; item: string; }

const NormasProcedimentos = () => {
  const { toast } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState<Document | null>(null);

  useEffect(() => {
    const fetchUploadedDocuments = async () => {
      setIsLoading(true);
      try {
        const fetchedDocs = await fileService.listFiles('normas-e-procedimentos');
        // Filtra documentos que realmente tem um path (remove placeholders que podem ter sido criados por seed antigo)
        setUploadedDocs(fetchedDocs.filter(doc => doc.path && doc.path !== ''));
      } catch (error) {
        console.error("Falha ao buscar documentos:", error);
        toast({ title: "Erro ao carregar documentos", description: "Não foi possível buscar a lista de arquivos.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUploadedDocuments();
  }, [toast]); // O toast raramente muda, mas é uma dependência listada

  // Função para recarregar os documentos após upload ou delete
  const reloadDocuments = async () => {
    try {
      const fetchedDocs = await fileService.listFiles('normas-e-procedimentos');
      setUploadedDocs(fetchedDocs.filter(doc => doc.path && doc.path !== ''));
    } catch (error) {
      console.error("Falha ao recarregar documentos:", error);
      toast({ title: "Erro ao atualizar lista", description: "Não foi possível atualizar a lista de arquivos.", variant: "destructive" });
    }
  }

  const handleUploadSubmit = async (fileData: { file: File; name: string; description: string }) => {
    if (!selectedItem) {
      toast({ title: "Erro", description: "Nenhum item selecionado para o upload.", variant: "destructive" });
      return;
    }
    try {
      await fileService.uploadFile({
        ...fileData,
        category: 'normas-e-procedimentos', // SLUG PADRONIZADO
        subcategory: selectedItem.subcategory,
        item: selectedItem.item,
      });
      setShowUploadForm(false);
      setSelectedItem(null);
      toast({ title: "Sucesso!", description: "Seu documento foi enviado e salvo." });
      reloadDocuments(); // Recarrega a lista
    } catch (error: any) {
      console.error("Erro no upload:", error);
      const serverMessage = error.response?.data?.message || "Não foi possível salvar o documento.";
      toast({ title: "Falha no Upload", description: serverMessage, variant: "destructive" });
      // Não re-lança o erro aqui para não quebrar a aplicação se o toast for suficiente
    }
  };

  const handleDelete = async (id: string) => {
    // Não remove otimisticamente para evitar que suma e depois reapareça se der erro
    try {
      await fileService.deleteFile(id);
      toast({ title: "Documento removido", description: "O arquivo foi excluído com sucesso." });
      reloadDocuments(); // Recarrega a lista para remover o item
    } catch (error) {
      console.error("Falha ao excluir o documento:", error);
      toast({ title: "Erro", description: "Não foi possível excluir o arquivo.", variant: "destructive" });
    }
  };

  const handleDownload = async (doc: Document) => {
    // ... (seu código handleDownload permanece o mesmo) ...
    try {
      toast({ title: "Preparando download...", description: `Baixando ${doc.name}` });
      const fileBlob = await fileService.downloadFile(doc.path);
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Falha no download:", error);
      toast({ title: "Erro", description: "Não foi possível baixar o arquivo.", variant: "destructive" });
    }
  };

  // Encontra o documento correspondente no inventário (uploadedDocs)
  const getDocumentForItem = (item: string) => {
    // Garante que só retorna documentos que realmente têm um arquivo (path não vazio)
    // Isso é crucial para a lógica de exibição
    return uploadedDocs.find(doc => doc.item === item && doc.path && doc.path !== '');
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Abre o modal de preview apenas se o documento tiver mimetype compatível
  const handlePreview = (doc: Document) => {
    if (doc.mimetype && (doc.mimetype.includes('pdf') || doc.mimetype.startsWith('image/'))) {
      setDocumentToPreview(doc);
      setShowPreview(true);
    } else {
      toast({
        title: "Preview não disponível",
        description: "A pré-visualização só está disponível para arquivos PDF e imagens.",
        variant: "default"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p>Carregando estrutura...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <div className="bg-secondary text-white text-center py-3 sm:py-4 rounded-t-lg mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl font-bold px-4">NORMAS E PROCEDIMENTOS</h1>
            </div>
            <div className="mb-4 sm:mb-6 px-2 sm:px-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar documentos..." className="pl-10 text-sm" />
              </div>
            </div>
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b p-3 sm:p-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm sm:text-lg">Descrição</CardTitle>
                  <CardTitle className="text-sm sm:text-lg">Anexo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* Itera sobre o MAPA estático */}
                  {Object.entries(documentStructure).map(([category, subcategories]) => (
                    <Collapsible key={category} open={openSections[category]}>
                      <CollapsibleTrigger onClick={() => toggleSection(category)} className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors bg-orange-500/5">
                        <div className="flex items-center gap-2">
                          {openSections[category] ? <ChevronDown className="h-4 w-4 text-orange-600" /> : <ChevronRight className="h-4 w-4 text-orange-600" />}
                          <span className="font-semibold text-orange-600 text-left text-xs sm:text-sm break-words">{category}</span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {Object.entries(subcategories).map(([subcategory, items]) => (
                          <div key={subcategory}>
                            {/* Renderiza subcategorias que existem */}
                            {subcategory && (
                              <Collapsible key={subcategory} open={openSections[subcategory]}>
                                <CollapsibleTrigger onClick={() => toggleSection(subcategory)} className="w-full flex items-center justify-between p-3 pl-8 hover:bg-muted/30 transition-colors bg-muted/20">
                                  <div className="flex items-center gap-2">
                                    {openSections[subcategory] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <span className="font-medium text-left text-xs sm:text-sm break-words">{subcategory}</span>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  {items.map((item) => {
                                    const doc = getDocumentForItem(item);
                                    return (
                                      <div key={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 pl-16 hover:bg-muted/20 transition-colors">
                                        <span className="text-xs sm:text-sm break-words pr-2 text-left">{item}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          {doc ? (
                                            <>
                                              {/* Verifica mimetype ANTES de renderizar o botão Eye */}
                                              {doc.mimetype && (doc.mimetype.includes('pdf') || doc.mimetype.startsWith('image/')) && (
                                                <Button size="sm" variant="ghost" onClick={() => handlePreview(doc)} className="h-8 w-8 p-0">
                                                  <Eye className="h-4 w-4 text-purple-600" />
                                                </Button>
                                              )}
                                              <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)} className="h-8 w-8 p-0"><Download className="h-4 w-4 text-blue-600" /></Button>
                                              {/* Botão Excluir agora sempre presente */}
                                              <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="h-8 w-8 p-0"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                            </>
                                          ) : (
                                            <Button size="sm" variant="ghost" onClick={() => { setSelectedItem({ category, subcategory, item }); setShowUploadForm(true); }} className="h-8 w-8 p-0">
                                              <Upload className="h-4 w-4 text-green-600" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                            {/* Renderiza itens que não têm subcategoria */}
                            {!subcategory && items.map((item) => {
                              const doc = getDocumentForItem(item);
                              return (
                                <div key={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 pl-12 hover:bg-muted/20 transition-colors">
                                  <span className="text-xs sm:text-sm break-words pr-2 text-left">{item}</span>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {doc ? (
                                      <>
                                        {/* Verifica mimetype ANTES de renderizar o botão Eye */}
                                        {doc.mimetype && (doc.mimetype.includes('pdf') || doc.mimetype.startsWith('image/')) && (
                                          <Button size="sm" variant="ghost" onClick={() => handlePreview(doc)} className="h-8 w-8 p-0"><Eye
                                            className="h-4 w-4 text-purple-600" />
                                          </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)} className="h-8 w-8 p-0"><Download className="h-4 w-4 text-blue-600" /></Button>
                                        {/* Botão Excluir agora sempre presente */}
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="h-8 w-8 p-0"><Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </>
                                    ) : (
                                      <Button size="sm" variant="ghost" onClick={() => { setSelectedItem({ category, subcategory, item }); setShowUploadForm(true); }} className="h-8 w-8 p-0">
                                        <Upload className="h-4 w-4 text-green-600" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
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
      {/* Modal de Upload */}
      {showUploadForm && (
        <FileUploadModal
          title={`Upload - ${selectedItem?.item || 'Novo Documento'}`}
          onClose={() => { setShowUploadForm(false); setSelectedItem(null); }}
          onSubmit={handleUploadSubmit}
        />
      )}
      {/* Modal de Preview */}
      {showPreview && documentToPreview && (
        <FilePreviewModal
          fileName={documentToPreview.name}
          filePath={documentToPreview.path}
          mimeType={documentToPreview.mimetype ?? ''}
          onClose={() => {
            setShowPreview(false);
            setDocumentToPreview(null);
          }}
        />
      )}
    </div>
  );
};

export default NormasProcedimentos;