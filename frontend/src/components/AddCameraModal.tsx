
import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface AddCameraModalProps {
  onClose: () => void;
  onImport: (cameras: any[]) => void;
}

export function AddCameraModal({ onClose, onImport }: AddCameraModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const cameras = jsonData.map((row: any) => ({
        unidadeNegocio: row['Unidade de Negócio'] || '',
        numeroCamera: row['Nº Câmera'] || '',
        localInstalacao: row['Local de Instalação'] || '',
        emFuncionamento: row['Em Funcionamento ?'] || 'Sim',
        tipo: row['Tipo'] || 'Bullet',
        areaExternaInterna: row['Área Externa / Interna'] || 'Externa',
        fabricante: row['Fabricante'] || '',
        modelo: row['Modelo'] || '',
        possuiAnalitico: row['POSSUI ANÁLITICO?'] || 'Não',
        diasGravacao: String(row['Dias de gravação'] || '30'),
        ip: row['IP'] || ''
      }));

      setPreviewData(cameras.slice(0, 5));

      for (let i = 0; i <= 100; i += 20) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Arquivo processado",
        description: `${cameras.length} câmeras encontradas.`
      });

      setIsProcessing(false);
    } catch (error) {
      toast({
        title: "Erro ao processar",
        description: "Verifique o formato do arquivo.",
        variant: "destructive"
      });
      setIsProcessing(false);
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const cameras = jsonData.map((row: any) => ({
        id: Date.now().toString() + Math.random(),
        unidadeNegocio: row['Unidade de Negócio'] || '',
        numeroCamera: row['Nº Câmera'] || '',
        localInstalacao: row['Local de Instalação'] || '',
        emFuncionamento: row['Em Funcionamento ?'] || 'Sim',
        tipo: row['Tipo'] || 'Bullet',
        areaExternaInterna: row['Área Externa / Interna'] || 'Externa',
        fabricante: row['Fabricante'] || '',
        modelo: row['Modelo'] || '',
        possuiAnalitico: row['POSSUI ANÁLITICO?'] || 'Não',
        diasGravacao: String(row['Dias de gravação'] || '30'),
        ip: row['IP'] || ''
      }));

      onImport(cameras);

      toast({
        title: "Importação concluída",
        description: `${cameras.length} câmeras importadas!`
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro na importação",
        variant: "destructive"
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Câmeras do Excel
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files);
              if (files[0]) handleFileSelect(files[0]);
            }}
          >
            {file ? (
              <div className="space-y-3">
                <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-medium">{file.name}</p>
                {previewData.length > 0 && (
                  <p className="text-sm text-green-600">✓ {previewData.length}+ câmeras detectadas</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <p>
                  Arraste o Excel ou{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    clique para selecionar
                  </button>
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            accept=".xlsx,.xls"
          />

          {isProcessing && uploadProgress < 100 && (
            <Progress value={uploadProgress} />
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleImport} className="flex-1" disabled={!file || isProcessing}>
              Importar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
