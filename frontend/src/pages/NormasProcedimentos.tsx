import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Download,
  Edit3,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  FileText
} from "lucide-react";
import ArcoPortusHeader from "@/components/Header";
import ArcoPortusFooter from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { FileUploadModal } from "@/components/FileUploadModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Document {
  id: string;
  category: string;
  subcategory?: string;
  item?: string;
  description: string;
  fileName?: string;
  uploadDate?: string;
  size?: string;
}

const NormasProcedimentos = () => {
  const { toast } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      category: "01. DOCUMENTAÇÃO PRELIMINAR",
      subcategory: "1.1 INSTALAÇÃO PORTUÁRIA",
      item: "1.1.1 Razão Social e CNPJ",
      description: "1.1.1 Razão Social e CNPJ",
      fileName: "Razao_Social_CNPJ.pdf",
      uploadDate: "2024-01-15",
      size: "2.3 MB"
    }
  ]);

  const documentStructure = {
    "01. DOCUMENTAÇÃO PRELIMINAR": {
      "1.1 INSTALAÇÃO PORTUÁRIA": [
        "1.1.1 Razão Social e CNPJ"
      ],
      "1.2 SÓCIOS/PROPRIETÁRIOS/REPRESENTANTES": [
        "1.2.1 Carteira de Identidade",
        "1.2.2 CPF",
        "1.2.3 Estatuto (Comprovação de quem são os representantes legais)"
      ],
      "1.3 SUPERVISORES DE SEGURANÇA PORTUÁRIA (SSP)": [
        "1.3.1 Carteira de Identidade",
        "1.3.2 CPF",
        "1.3.3 Certidão Negativa de Antecedentes Criminais expedida pela Justiça Federal",
        "1.3.4 Certidão Negativa de Antecedentes Criminais Expedidas pela Justiça Estadual",
        "1.3.5 Certificados do CESSP e CASSP do SSP",
        "1.3.6 Informações contidas no Global Integrated Shipping Information System (GISIS)"
      ]
    },
    "02. ESTUDO DE AVALIAÇÃO DE RISCOS (EAR)": {
      "": [
        "2.1 Possui EAR aprovado e atualizado?"
      ]
    },
    "03. PLANO DE SEGURANÇA PORTUÁRIA (PSP)": {
      "": [
        "3.1 Possui PSP aprovado e atualizado?"
      ]
    },
    "04. SEGURANÇA": {
      "": [
        "4.16 Há procedimentos para os operadores do CFTV no caso de detecção de intrusão ou outra ocorrência anormal na instalação portuária?",
        "4.38 A equipe de segurança realiza patrulhas rotineiras em todas as áreas (notadamente nas controladas e restritas)?"
      ]
    },
    "05. COMUNICAÇÕES E TECNOLOGIA DA INFORMAÇÃO (TI)": {
      "": [
        "5.8 Os sistemas de controle de acesso e registro são auditáveis (registro por no mínimo 90 dias)?",
        "5.10 O controle dessas chaves e dos lacres está implementado? É adequado?",
        "5.13 Ocorre a exigência de termo de responsabilidade para a execução de serviços nos recursos críticos por pessoal externo, alertando para a vedação do acesso indevido às informações da instalação portuária?",
        "5.25 O uso de mídias e redes sociais é restrito às atividades de divulgação institucional?",
        "5.28 Há adestramento inicial (novos colaboradores) e contínuo (manutenção de uma cultura de segurança) no que tange à proteção na área de TI?",
        "5.29 Existe controle de presença nesses adestramentos?",
        "5.33 Existe plano de contingência para o Setor de TI?"
      ]
    }
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
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
      description: `Baixando ${doc.fileName}...`
    });
  };

  const getDocumentForItem = (item: string) => {
    return documents.find(doc => doc.item === item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <Sidebar />

          <div className="flex-1">
            <div className="bg-secondary text-white text-center py-4 rounded-t-lg mb-6">
              <h1 className="text-xl font-bold">NORMAS E PROCEDIMENTOS</h1>
            </div>

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

            {/* Document Structure with Collapsible Sections */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Descrição</CardTitle>
                  <CardTitle className="text-lg">Anexo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {Object.entries(documentStructure).map(([category, subcategories]) => (
                    <Collapsible key={category} open={openSections[category]}>
                      <CollapsibleTrigger
                        onClick={() => toggleSection(category)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors bg-orange-500/5"
                      >
                        <div className="flex items-center gap-2">
                          {openSections[category] ? (
                            <ChevronDown className="h-4 w-4 text-orange-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-orange-600" />
                          )}
                          <span className="font-semibold text-orange-600">{category}</span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {Object.entries(subcategories).map(([subcategory, items]) => (
                          <div key={subcategory}>
                            {subcategory && (
                              <Collapsible open={openSections[subcategory]}>
                                <CollapsibleTrigger
                                  onClick={() => toggleSection(subcategory)}
                                  className="w-full flex items-center justify-between p-3 pl-8 hover:bg-muted/30 transition-colors bg-muted/20"
                                >
                                  <div className="flex items-center gap-2">
                                    {openSections[subcategory] ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <span className="font-medium text-sm">{subcategory}</span>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  {items.map((item) => {
                                    const doc = getDocumentForItem(item);
                                    return (
                                      <div
                                        key={item}
                                        className="flex items-center justify-between p-3 pl-16 hover:bg-muted/20 transition-colors border-l-2 border-transparent hover:border-primary"
                                      >
                                        <span className="text-sm">{item}</span>
                                        <div className="flex items-center gap-2">
                                          {doc ? (
                                            <>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDownload(doc)}
                                                className="h-8"
                                              >
                                                <Download className="h-4 w-4 text-blue-600" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(doc.id)}
                                                className="h-8"
                                              >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                              </Button>
                                            </>
                                          ) : (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => {
                                                setSelectedItem(item);
                                                setShowUploadForm(true);
                                              }}
                                              className="h-8"
                                            >
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
                            {!subcategory && items.map((item) => {
                              const doc = getDocumentForItem(item);
                              return (
                                <div
                                  key={item}
                                  className="flex items-center justify-between p-3 pl-12 hover:bg-muted/20 transition-colors border-l-2 border-transparent hover:border-primary"
                                >
                                  <span className="text-sm">{item}</span>
                                  <div className="flex items-center gap-2">
                                    {doc ? (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDownload(doc)}
                                          className="h-8"
                                        >
                                          <Download className="h-4 w-4 text-blue-600" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDelete(doc.id)}
                                          className="h-8"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setShowUploadForm(true);
                                        }}
                                        className="h-8"
                                      >
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

      <ArcoPortusFooter />

      {showUploadForm && (
        <FileUploadModal
          title={`Upload - ${selectedItem}`}
          onClose={() => {
            setShowUploadForm(false);
            setSelectedItem(null);
          }}
          onSubmit={(fileData) => {
            const doc: Document = {
              id: Date.now().toString(),
              category: "",
              item: selectedItem || "",
              description: fileData.description,
              fileName: fileData.name,
              uploadDate: new Date().toISOString().split('T')[0],
              size: `${(fileData.file.size / 1024 / 1024).toFixed(1)} MB`
            };

            setDocuments([...documents, doc]);
            setShowUploadForm(false);
            setSelectedItem(null);

            toast({
              title: "Sucesso",
              description: "Documento enviado com sucesso!"
            });
          }}
        />
      )}
    </div>
  );
};

export default NormasProcedimentos;
