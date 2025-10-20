// src/components/FileThumbnail.tsx

import { useState, useEffect } from 'react';
import { fileService } from '@/services/fileService';
import { FileText, Image as ImageIcon, Film, Music, FileArchive, FileSpreadsheet, FileCode, FileQuestion, Loader2 } from 'lucide-react'; // Adicionado Loader2

interface FileThumbnailProps {
    filePath: string | null | undefined;
    mimeType: string | null | undefined;
    fileName: string;
}

// --- FallbackIcon (sem alterações) ---
const FallbackIcon = ({ mimeType, fileName }: { mimeType: string; fileName: string }) => {
    let IconComponent = FileQuestion;
    // ... (lógica para escolher o ícone permanece a mesma) ...
    if (!mimeType) IconComponent = FileText;
    else if (mimeType.startsWith('image/')) IconComponent = ImageIcon;
    else if (mimeType.startsWith('video/')) IconComponent = Film;
    else if (mimeType.startsWith('audio/')) IconComponent = Music;
    else if (mimeType.includes('pdf')) IconComponent = FileText;
    else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('vnd.openxmlformats-officedocument.spreadsheetml') || mimeType.endsWith('.xlsx') || mimeType.endsWith('.xls') || mimeType.endsWith('.csv')) IconComponent = FileSpreadsheet;
    else if (mimeType.includes('word') || mimeType.includes('vnd.openxmlformats-officedocument.wordprocessingml') || mimeType.endsWith('.docx') || mimeType.endsWith('.doc')) IconComponent = FileText;
    else if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) IconComponent = FileArchive;
    else if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('typescript') || mimeType.includes('html') || mimeType.includes('css')) IconComponent = FileCode;

    return (
        <div className="w-12 h-16 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center flex-shrink-0 border border-border/20" title={fileName}>
            <IconComponent className="w-6 h-6" />
        </div>
    );
};

// --- Loading State Component ---
const LoadingThumbnail = ({ fileName }: { fileName: string }) => {
    return (
        <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 border border-border/20" title={`Loading ${fileName}...`}>
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
    );
}


const FileThumbnail = ({ filePath, mimeType, fileName }: FileThumbnailProps) => {
    const [objectUrl, setObjectUrl] = useState<string | null>(null); // Armazena a blob URL
    const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
    const [fetchError, setFetchError] = useState(false); // Estado de erro na busca
    const safeMimeType = mimeType ?? '';

    const isPdf = safeMimeType.includes('pdf');
    const isImage = safeMimeType.startsWith('image/');
    const isPreviewable = isPdf || isImage;

    useEffect(() => {
        // Só busca se for previewable e tiver um path
        if (!isPreviewable || !filePath) {
            setIsLoading(false); // Se não for previewable, não há o que carregar
            return;
        }

        let isActive = true; // Flag para evitar setar estado em componente desmontado
        let tempUrl: string | null = null; // Guarda a URL temporária para revogar

        const fetchBlob = async () => {
            setIsLoading(true);
            setFetchError(false);
            setObjectUrl(null); // Limpa URL antiga

            try {
                // Usa a função downloadFile que já retorna um Blob via Axios autenticado
                const blob = await fileService.downloadFile(filePath);
                if (isActive) {
                    tempUrl = URL.createObjectURL(blob);
                    setObjectUrl(tempUrl);
                }
            } catch (error) {
                console.error(`[FileThumbnail] Erro ao buscar blob para ${fileName}:`, error);
                if (isActive) {
                    setFetchError(true);
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        fetchBlob();

        // --- Função de Limpeza ---
        // Será executada quando o componente for desmontado
        return () => {
            isActive = false;
            if (tempUrl) {
                // Revoga a URL do objeto para liberar memória
                URL.revokeObjectURL(tempUrl);
                console.log(`[FileThumbnail] Revogada object URL para ${fileName}`);
            }
        };
    }, [filePath, isPreviewable]); // Re-executa se o path ou tipo mudar

    // ----- Lógica de Renderização -----

    // Se não tem path (placeholder)
    if (!filePath) {
        return <FallbackIcon mimeType={safeMimeType} fileName={fileName} />;
    }

    // Se for previewable mas ainda está carregando
    if (isPreviewable && isLoading) {
        return <LoadingThumbnail fileName={fileName} />;
    }

    // Se deu erro ao buscar o blob OU não é previewable
    if (fetchError || !isPreviewable) {
        return <FallbackIcon mimeType={safeMimeType} fileName={fileName} />;
    }

    // Se carregou a URL do objeto com sucesso
    if (objectUrl) {
        if (isImage) {
            return (
                <img
                    src={objectUrl} // Usa a object URL
                    alt={`Preview of ${fileName}`}
                    className="w-12 h-16 object-cover rounded-lg bg-gray-200 border border-border/20"
                />
            );
        }

        if (isPdf) {
            return (
                <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 pointer-events-none border border-border/20">
                    <iframe
                        src={`${objectUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} // Usa a object URL
                        className="w-[400%] h-[400%] scale-[0.25] origin-top-left border-0"
                        title={`Preview of ${fileName}`}
                        scrolling="no"
                    />
                </div>
            );
        }
    }

    // Último fallback (caso algo muito estranho aconteça)
    return <FallbackIcon mimeType={safeMimeType} fileName={fileName} />;
};

export default FileThumbnail;