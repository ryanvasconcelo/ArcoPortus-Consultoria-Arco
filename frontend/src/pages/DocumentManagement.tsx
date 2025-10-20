import { useState, useEffect } from "react";
import { fileService, formatFileSize, Document } from "@/services/fileService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Input } from "@/components/ui/input";
import { Download, Edit3, Trash2, Plus, Search, Eye } from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { FileUploadModal } from "@/components/FileUploadModal";
import { FilePreviewModal } from "@/components/FilePreviewModal";
import { EditDocumentModal } from "@/components/EditDocumentModal";
import FileThumbnail from "@/components/FileThumbnail"; // Thumbnail importado

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
  const [searchTerm, setSearchTerm] = useState(""); // Adicionado estado para busca

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const fetchedDocs = await fileService.listFiles(category);
        // Filtra placeholders APENAS se NÃO for a página de Normas
        setDocuments(fetchedDocs.filter(doc => category === 'normas-e-procedimentos' || (doc.path && doc.path !== '')));
      } catch (error) {
        console.error("Falha ao buscar documentos:", error);
        toast({ title: "Erro ao carregar", description: "Não foi possível buscar a lista de documentos.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [category, toast]);

  const handleUploadSubmit = async (fileData: { file: File; name: string; description: string }) => {
    try {
      const newDocument = await fileService.uploadFile({ ...fileData, category });
      setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
      setShowUploadForm(false);
      toast({ title: "Sucesso!", description: "Seu documento foi enviado e salvo." });
    } catch (error: any) {
      console.error("Erro no upload:", error);
      const serverMessage = error.response?.data?.message || "Não foi possível salvar o documento.";
      console.log("Resposta detalhada do servidor:", error.response?.data);
      toast({ title: "Falha no Upload", description: serverMessage, variant: "destructive" });
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

  const handlePreview = (doc: Document) => {
    // Verifica se o mimetype existe e se é PDF ou imagem antes de abrir
    if (doc.mimetype && (doc.mimetype.includes('pdf') || doc.mimetype.startsWith('image/'))) {
      setSelectedDocument(doc);
      setShowPreview(true);
    } else {
      toast({
        title: "Preview não disponível",
        description: "A pré-visualização só está disponível para arquivos PDF e imagens.",
        variant: "default"
      });
    }
  };

  // Filtra os documentos com base no termo de busca
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p>Carregando documentos...</p> {/* Mensagem de Loading */}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <div className="flex-1 min-w-0">
            {/* Cabeçalho da Seção */}
            <div className="bg-secondary text-white text-center py-4 rounded-t-lg mb-6">
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
            {/* Card de Ações (Novo Documento) */}
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
            {/* Barra de Busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* Card da Lista de Documentos */}
            <Card>
              {/* Cabeçalho da Tabela (Visível apenas em telas maiores) */}
              <CardHeader className="hidden md:block border-b">
                <div className="grid grid-cols-6 gap-4 items-center px-4 py-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-3">Descrição / Nome do Arquivo</div>
                  <div className="col-span-1 text-center">Tamanho</div>
                  <div className="col-span-2 text-right pr-4">Ações</div>
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-4"> {/* Ajuste de padding */}
                {/* Exibe mensagem se não houver documentos */}
                {filteredDocuments.length === 0 && !isLoading ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhum documento encontrado{searchTerm ? ' para "' + searchTerm + '"' : ''}.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* --- Início do Loop --- */}
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        {/* Coluna Esquerda: Thumbnail e Descrição */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-4">
                            {/* --- A CORREÇÃO --- */}
                            {/* Usamos optional chaining (?.) e fallback ('') para garantir que mimeType seja sempre uma string */}
                            <FileThumbnail filePath={doc.path} mimeType={doc.mimetype ?? ''} fileName={doc.name} />
                            {/* --- Fim da Correção --- */}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm md:text-base truncate" title={doc.name}>{doc.name}</h4>
                              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                <span className="block md:inline truncate" title={doc.description}>{doc.description}</span>
                                <span className="hidden md:inline"> • </span>
                                {/* Mostra tamanho apenas em telas maiores */}
                                <span className="hidden md:inline">
                                  {formatFileSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                {/* Mostra data em telas menores */}
                                <span className="block md:hidden">
                                  {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Coluna Direita: Ações */}
                        <div className="flex flex-wrap items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                          {/* Adicionado verificação se mimetype existe antes de mostrar botão Preview */}
                          {doc.mimetype && (doc.mimetype.includes('pdf') || doc.mimetype.startsWith('image/')) && (
                            <Button size="sm" variant="outline" onClick={() => handlePreview(doc)} className="flex-1 xs:flex-initial"> {/* Ajuste responsivo */}
                              <Eye className="h-4 w-4 md:mr-1" />
                              <span className="hidden md:inline">Preview</span>
                              <span className="md:hidden">Ver</span> {/* Texto alternativo menor */}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDownload(doc)} className="flex-1 xs:flex-initial">
                            <Download className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Baixar</span>
                            <span className="md:hidden">Baixar</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedDocument(doc); setShowEditModal(true); }} className="flex-1 xs:flex-initial">
                            <Edit3 className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Editar</span>
                            <span className="md:hidden">Editar</span>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDocumentToDelete(doc)} className="flex-1 xs:flex-initial">
                            <Trash2 className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Excluir</span>
                            <span className="md:hidden">Excluir</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {/* --- Fim do Loop --- */}
                  </div>
                )}
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

      {/* Modais */}
      {showUploadForm && (
        <FileUploadModal
          title={`Novo Documento - ${title}`}
          onClose={() => setShowUploadForm(false)}
          onSubmit={handleUploadSubmit}
        />
      )}
      {showPreview && selectedDocument && (
        <FilePreviewModal
          fileName={selectedDocument.name}
          filePath={selectedDocument.path}
          mimeType={selectedDocument.mimetype ?? ''}
          onClose={() => {
            setShowPreview(false);
            setSelectedDocument(null);
          }}
        />
      )}
      {showEditModal && selectedDocument && (
        <EditDocumentModal
          document={selectedDocument}
          onClose={() => { setShowEditModal(false); setSelectedDocument(null); }}
          onSubmit={handleEdit}
        />
      )}
      <ConfirmationModal
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => { if (documentToDelete) { handleDelete(documentToDelete.id); } }}
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
    </div>
  );
};

export default DocumentManagement;