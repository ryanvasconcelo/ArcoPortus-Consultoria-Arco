import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface Document {
  id: string;
  name: string;
  description: string;
  uploadDate: string;
  size: string;
  type: string;
}

const DocumentManagement = ({ title, category }: { title: string; category: string }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Razão Social e CNPJ.pdf",
      description: "1.1.1 Razão Social e CNPJ",
      uploadDate: "2023-10-15",
      size: "2.3 MB",
      type: "PDF"
    },
    {
      id: "2",
      name: "EAR_Aprovado_2023.pdf",
      description: "2.1 Possui EAR aprovado e atualizado?",
      uploadDate: "2023-09-20",
      size: "15.7 MB",
      type: "PDF"
    }
  ]);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState({
    name: "",
    description: "",
    file: null as File | null
  });

  const handleUpload = () => {
    if (!newDocument.file || !newDocument.name || !newDocument.description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos e selecione um arquivo.",
        variant: "destructive"
      });
      return;
    }

    const doc: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      description: newDocument.description,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(newDocument.file.size / 1024 / 1024).toFixed(1)} MB`,
      type: newDocument.file.type.includes('pdf') ? 'PDF' : 'DOC'
    };

    setDocuments([...documents, doc]);
    setNewDocument({ name: "", description: "", file: null });
    setShowUploadForm(false);

    toast({
      title: "Sucesso",
      description: "Documento enviado com sucesso!"
    });
  };

  const handleEdit = (data: { name: string; description: string }) => {
    if (!selectedDocument) return;

    setDocuments(documents.map(doc =>
      doc.id === selectedDocument.id
        ? { ...doc, name: data.name, description: data.description }
        : doc
    ));

    setShowEditModal(false);
    setSelectedDocument(null);

    toast({
      title: "Documento atualizado",
      description: "As informações foram salvas com sucesso."
    });
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: "Documento removido",
      description: "O documento foi excluído com sucesso."
    });
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${doc.name}...`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="bg-secondary text-white text-center py-4 rounded-t-lg mb-6">
              <h1 className="text-xl font-bold">{title}</h1>
            </div>

            {/* Upload Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciar Documentos</CardTitle>
                  <Button
                    onClick={() => setShowUploadForm(true)}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Documento
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar documentos..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Documents Table */}
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
                            {doc.type === 'PDF' ? '📄' : '📋'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm md:text-base truncate">{doc.description}</h4>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">
                              <span className="block md:inline truncate">{doc.name}</span>
                              <span className="hidden md:inline"> • </span>
                              <span className="block md:inline">{doc.size} • {doc.uploadDate}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowPreview(true);
                          }}
                          className="flex-1 md:flex-initial"
                        >
                          <Eye className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Preview</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                          className="flex-1 md:flex-initial"
                        >
                          <Download className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Baixar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowEditModal(true);
                          }}
                          className="flex-1 md:flex-initial"
                        >
                          <Edit3 className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Editar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(doc.id)}
                          className="flex-1 md:flex-initial"
                        >
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
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto">
          © 2025_V02 Arco Security I  Academy  I  Solutions - Todos os direitos reservados.
        </div>
      </footer>

      {/* File Upload Modal */}
      {showUploadForm && (
        <FileUploadModal
          title={`Novo Documento - ${title}`}
          onClose={() => setShowUploadForm(false)}
          onSubmit={(fileData) => {
            const doc: Document = {
              id: Date.now().toString(),
              name: fileData.name,
              description: fileData.description,
              uploadDate: new Date().toISOString().split('T')[0],
              size: `${(fileData.file.size / 1024 / 1024).toFixed(1)} MB`,
              type: fileData.file.type.includes('pdf') ? 'PDF' : 'DOC'
            };

            setDocuments([...documents, doc]);
            setNewDocument({ name: "", description: "", file: null });
            setShowUploadForm(false);

            toast({
              title: "Sucesso",
              description: "Documento enviado com sucesso!"
            });
          }}
        />
      )}

      {/* PDF Preview Modal */}
      {showPreview && selectedDocument && (
        <PDFPreviewModal
          fileName={selectedDocument.name}
          onClose={() => {
            setShowPreview(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Edit Document Modal */}
      {showEditModal && selectedDocument && (
        <EditDocumentModal
          document={selectedDocument}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDocument(null);
          }}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
};

export default DocumentManagement;