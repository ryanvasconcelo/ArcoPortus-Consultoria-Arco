import { useState, useEffect } from "react";
import { fileService, formatFileSize, Document } from "@/services/fileService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Download,
  Edit3,
  Trash2,
  FileText,
  Plus,
  Search,
  Eye
} from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { FileUploadModal } from "@/components/FileUploadModal";
import { PDFPreviewModal } from "@/components/PDFPreviewModal";
import { EditDocumentModal } from "@/components/EditDocumentModal";

const DocumentManagement = ({ title, category }: { title: string; category: string }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- LÓGICA DE DADOS (JÁ ESTÁ PERFEITA!) ---
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const fetchedDocs = await fileService.listFiles(category);
        setDocuments(fetchedDocs);
      } catch (error) {
        console.error("Falha ao buscar documentos:", error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível buscar a lista de documentos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [category]);

  const handleUploadSubmit = async (fileData: { file: File; name: string; description: string }) => {
    try {
      const newDocument = await fileService.uploadFile({ ...fileData, category });
      setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
      setShowUploadForm(false);
      toast({ title: "Sucesso!", description: "Seu documento foi enviado e salvo." });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ title: "Falha no Upload", description: "Não foi possível salvar o documento.", variant: "destructive" });
      throw error;
    }
  };

  const handleEdit = async (data: { name: string; description: string }) => {
    if (!selectedDocument) return;
    try {
      const updatedDocument = await fileService.updateFile(selectedDocument.id, data);
      setDocuments(documents.map(doc => (doc.id === selectedDocument.id ? updatedDocument : doc)));
      setShowEditModal(false);
      setSelectedDocument(null);
      toast({ title: "Documento atualizado", description: "As informações foram salvas com sucesso." });
    } catch (error) {
      console.error("Falha ao editar o documento:", error);
      toast({ title: "Erro", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const originalDocuments = [...documents];
    setDocuments(documents.filter(doc => doc.id !== id));
    try {
      await fileService.deleteFile(id);
      toast({ title: "Documento removido", description: "O arquivo foi excluído com sucesso." });
    } catch (error) {
      console.error("Falha ao excluir o documento:", error);
      toast({ title: "Erro", description: "Não foi possível excluir o arquivo.", variant: "destructive" });
      setDocuments(originalDocuments);
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      toast({ title: "Preparando download...", description: `Baixando ${doc.name}` });

      // 1. Pede ao nosso serviço para buscar o arquivo de forma segura
      const fileBlob = await fileService.downloadFile(doc.path);

      // 2. Cria uma URL temporária para o arquivo que está na memória
      const url = window.URL.createObjectURL(fileBlob);

      // 3. Cria um link invisível, clica nele e depois o remove
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name); // Usa o nome original do arquivo
      document.body.appendChild(link);
      link.click();

      // Limpa a URL da memória
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Falha no download:", error);
      toast({ title: "Erro", description: "Não foi possível baixar o arquivo.", variant: "destructive" });
    }
  };

  // --- ESTRUTURA JSX (AGORA CORRIGIDA) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <div className="flex-1 min-w-0">
            {/* ... Seu conteúdo de Card, Input, Tabela, etc. ... */}
            <div className="bg-secondary text-white text-center py-4 rounded-t-lg mb-6">
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciar Documentos</CardTitle>
                  <Button onClick={() => setShowUploadForm(true)} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Documento
                  </Button>
                </div>
              </CardHeader>
            </Card>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar documentos..." className="pl-10" />
              </div>
            </div>
            <Card>
              <CardHeader className="hidden md:block">
                <div className="grid grid-cols-2 gap-4">
                  <h3 className="text-lg font-semibold">Descrição</h3>
                  <h3 className="text-lg font-semibold">Anexo</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-3">
                          <span className="w-8 h-8 bg-secondary text-white rounded-lg flex items-center justify-center text-base flex-shrink-0">
                            {doc.mimetype.includes('pdf') ? '📄' : '📋'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm md:text-base truncate">{doc.description}</h4>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">
                              <span className="block md:inline truncate">{doc.name}</span>
                              <span className="hidden md:inline"> • </span>
                              <span className="block md:inline">
                                {formatFileSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          // CORREÇÃO: Remova a chamada para handlePreview(doc) daqui.
                          // Apenas abra o modal, como você já estava fazendo.
                          onClick={() => { setSelectedDocument(doc); setShowPreview(true); }}
                          className="flex-1 md:flex-initial"
                        >
                          <Eye className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Preview</span>
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => handleDownload(doc)} className="flex-1 md:flex-initial">
                          <Download className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Baixar</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedDocument(doc); setShowEditModal(true); }} className="flex-1 md:flex-initial">
                          <Edit3 className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Editar</span>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDocumentToDelete(doc)} className="flex-1 md:flex-initial">
                          <Trash2 className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Excluir</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main >
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto">
          © 2025_V02 Arco Security I  Academy  I  Solutions - Todos os direitos reservados.
        </div>
      </footer>

      {/* OS MODAIS AGORA ESTÃO DENTRO DO RETURN PRINCIPAL */}
      {
        showUploadForm && (
          <FileUploadModal
            title={`Novo Documento - ${title}`}
            onClose={() => setShowUploadForm(false)}
            onSubmit={handleUploadSubmit}
          />
        )
      }
      {
        showPreview && selectedDocument && (
          <PDFPreviewModal
            fileName={selectedDocument.name}
            // ---> A MÁGICA ACONTECE AQUI <---
            // Passamos o 'path' do documento, não a URL completa
            filePath={selectedDocument.path}
            onClose={() => {
              setShowPreview(false);
              setSelectedDocument(null);
            }}
          />
        )}
      {
        showEditModal && selectedDocument && (
          <EditDocumentModal
            document={selectedDocument}
            onClose={() => { setShowEditModal(false); setSelectedDocument(null); }}
            onSubmit={handleEdit}
          />
        )
      }
      <ConfirmationModal
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => {
          if (documentToDelete) {
            handleDelete(documentToDelete.id);
          }
        }}
        title="Confirmar Exclusão"
        message={
          <>
            <p>Você tem certeza que deseja excluir permanentemente o arquivo?</p>
            <p className="font-semibold mt-2 break-all">{documentToDelete?.name}</p>
            <p className="text-xs text-muted-foreground mt-1">Esta ação não pode ser desfeita.</p>
          </>
        }
        isLoading={isDeleting}
      />
    </div >
  );
};

export default DocumentManagement;