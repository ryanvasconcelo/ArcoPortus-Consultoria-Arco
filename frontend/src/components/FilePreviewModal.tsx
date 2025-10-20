import { useState, useEffect } from "react";
// Importa ícones necessários
import { X, Loader2, AlertTriangle, FileText, Download } from "lucide-react";
import { fileService } from "@/services/fileService";
import { Button } from "@/components/ui/button"; // Importar Button para o fallback
import { useToast } from "@/hooks/use-toast"; // (necessário no topo)

// --- ALTERAÇÃO 1: Renomear interface e adicionar mimeType ---
interface FilePreviewModalProps {
  fileName: string;
  filePath: string;
  mimeType: string | null | undefined; // <-- Adicionado
  onClose: () => void;
}

// --- ALTERAÇÃO 2: Renomear componente ---
export function FilePreviewModal({ fileName, filePath, mimeType, onClose }: FilePreviewModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null); // Renomeado fileUrl para objectUrl
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determina o tipo e se é visualizável
  const safeMimeType = mimeType ?? '';
  const isPdf = safeMimeType.includes('pdf');
  const isImage = safeMimeType.startsWith('image/');
  const isPreviewable = isPdf || isImage; // Só buscamos Blob para tipos visualizáveis

  useEffect(() => {
    // Só executa se for previewable e tiver path
    if (!isPreviewable || !filePath) {
      setIsLoading(false); // Marca como não carregando se não for visualizável
      return;
    }

    let isActive = true;
    let tempUrl: string | null = null;

    const fetchFileBlob = async () => {
      setIsLoading(true);
      setError(null);
      setObjectUrl(null); // Limpa URL anterior

      try {
        // Busca o Blob usando o serviço (já faz autenticação)
        const blob = await fileService.downloadFile(filePath);

        // Verifica o tamanho do blob - Navegadores têm limites para Object URLs
        if (blob.size === 0) {
          throw new Error("Arquivo recebido está vazio.");
        }
        // console.log(`Blob size for ${fileName}: ${blob.size}`); // Log para debug de tamanho

        if (isActive) {
          tempUrl = URL.createObjectURL(blob);
          setObjectUrl(tempUrl);
        }

      } catch (err: any) {
        console.error("Erro ao carregar preview:", err);
        if (isActive) {
          // Tenta dar uma mensagem de erro mais específica
          const errMsg = err.message || "Não foi possível carregar o preview do arquivo.";
          setError(errMsg.includes('Blob size') ? "O arquivo pode ser muito grande para visualização." : errMsg);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchFileBlob();

    // Função de limpeza para revogar a URL do objeto
    return () => {
      isActive = false;
      if (tempUrl) {
        URL.revokeObjectURL(tempUrl);
        setObjectUrl(null); // Garante limpeza do estado
      }
    };
    // Dependências: re-executa se o path ou tipo mudar
  }, [filePath, isPreviewable]);

  // Função de download para o botão de fallback
  const handleDownloadClick = async () => {
    const { toast } = useToast(); // (dentro do componente)
    try {
      toast({ title: "Preparando download...", description: `Baixando ${fileName}` }); // Precisa importar useToast ou passar como prop
      const blob = await fileService.downloadFile(filePath);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("Falha no download:", downloadError);
      toast({ title: "Erro", description: "Não foi possível baixar o arquivo.", variant: "destructive" }); // Precisa importar useToast ou passar como prop
    }
  };


  return (
    // Overlay e posicionamento central
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8 z-[100] animate-fade-in">
      {/* --- ALTERAÇÃO 3: Aplicar tamanho no container principal --- */}
      <div className="bg-card w-[90vw] max-w-[1400px] h-[90vh] rounded-lg flex flex-col shadow-2xl overflow-hidden"> {/* Max-width para telas grandes */}

        {/* Header */}
        <header className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0"> {/* Reduzido padding e shrink */}
          <h2 className="font-semibold truncate text-sm sm:text-base" title={fileName}>{fileName}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 rounded-2">
            <X className="h-auto w-5" />
          </Button>
        </header>

        {/* Corpo (Conteúdo ou Fallback) */}
        {/* Container que cresce para preencher espaço e centraliza conteúdo */}
        <div className="flex-1 bg-muted/20 flex items-center justify-center overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="text-destructive-foreground bg-destructive/80 p-4 rounded flex items-center gap-2 max-w-md text-center mx-auto">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* --- ALTERAÇÃO 4: Lógica do Tradutor Universal --- */}
          {!isLoading && !error && ( // Só renderiza conteúdo se não estiver carregando e sem erro
            <>
              {isPreviewable && objectUrl ? ( // Se for previewable e tiver URL
                <>
                  {isImage && (
                    <img
                      src={objectUrl} // Usa a object URL
                      alt={`Preview of ${fileName}`}
                      // Estilos para centralizar e limitar tamanho, permitindo zoom/pan do navegador
                      className="max-w-full max-h-full object-contain block"
                    />
                  )}
                  {isPdf && (
                    <iframe
                      src={`${objectUrl}#view=FitH`} // Usa a object URL
                      title={`Preview of ${fileName}`}
                      className="w-full h-full border-0" // Ocupa todo o espaço
                    />
                  )}
                </>
              ) : ( // Se NÃO for previewable (mesmo sem erro)
                <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-1">Preview não disponível</p>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    O tipo de arquivo ({safeMimeType || 'desconhecido'}) não pode ser exibido no navegador.
                  </p>
                  {/* Adicionado botão de download no fallback */}
                  <Button onClick={handleDownloadClick}>
                    <Download className="mr-2 h-4 w-4" /> Fazer Download
                  </Button>
                </div>
              )}
            </>
          )}
        </div> {/* Fim do corpo flex-1 */}
      </div> {/* Fim do container principal */}
    </div> // Fim do overlay
  );
}