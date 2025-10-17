import { useState, useRef } from "react";
import { X, Upload, File, Check, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AddCameraModalProps {
  onClose: () => void;
  onImport: (file: File) => Promise<void>; // A prop espera uma função que recebe um ARQUIVO
}

export function AddCameraModal({ onClose, onImport }: AddCameraModalProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 1. Estado para guardar o arquivo
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo .xlsx para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      // 2. Chama a função onImport com o arquivo selecionado
      await onImport(selectedFile);
      // O pai (SistemaCFTV) cuidará do toast de sucesso e de fechar o modal
    } catch (error) {
      // O pai também cuida do toast de erro
      setIsImporting(false); // Apenas paramos o loading em caso de erro
    }
  };

  const handleFileSelect = (file: File) => {
    // Validação do tipo de arquivo
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      toast({
        title: "Formato Inválido",
        description: "Por favor, selecione um arquivo .xlsx.",
        variant: "destructive",
      });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-lg glass-card border-white/10 animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar Câmeras
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Área de Upload de Arquivo */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-colors border-border hover:border-primary/50 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <File className="h-8 w-8 text-primary" />
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    Alterar Arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm">
                      Clique para selecionar o arquivo .xlsx
                    </p>
                    <p className="text-xs text-muted-foreground">
                      O arquivo deve seguir o modelo padrão.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isImporting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 gradient-primary hover-lift" disabled={!selectedFile || isImporting}>
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? "Importando..." : "Importar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}