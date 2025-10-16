import { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { fileService } from "@/services/fileService"; // Importe nosso serviço

interface PDFPreviewModalProps {
  fileName: string;
  filePath: string; // Vamos receber o 'path' seguro do arquivo
  onClose: () => void;
}

export function PDFPreviewModal({ fileName, filePath, onClose }: PDFPreviewModalProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Usa o mesmo serviço do download para buscar o arquivo de forma segura
        const blob = await fileService.downloadFile(filePath);

        // 2. Cria uma URL local e temporária para o arquivo que está na memória
        const url = window.URL.createObjectURL(blob);
        setFileUrl(url);

      } catch (err) {
        console.error("Erro ao carregar preview:", err);
        setError("Não foi possível carregar o preview do arquivo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFile();

    // 3. Efeito de limpeza: revoga a URL da memória quando o modal for fechado
    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl);
      }
    };
  }, [filePath]); // O efeito roda sempre que o 'filePath' mudar

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card w-full max-w-4xl h-[90vh] rounded-lg flex flex-col shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold truncate">{fileName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Conteúdo (Iframe, Loading ou Erro) */}
        <div className="flex-1 bg-muted/20 flex items-center justify-center">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {error && <div className="text-destructive flex items-center gap-2"><AlertTriangle /> {error}</div>}
          {fileUrl && !isLoading && !error && (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-full"
              frameBorder="0"
            />
          )}
        </div>
      </div>
    </div>
  );
}