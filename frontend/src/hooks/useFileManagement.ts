// src/hooks/useFileManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { fileService, FileData, formatFileSize } from '@/services/fileService';

// Tipos adaptados para o frontend (com size já formatado)
export interface Document extends Omit<FileData, 'size' | 'mimeType' | 'uploadDate'> {
    size: string;
    type: string;
    uploadDate: string;
}

interface UseFileManagement {
    documents: Document[];
    isLoading: boolean;
    loadDocuments: () => Promise<void>;
    handleUpload: (file: File, name: string, description: string, item?: string) => Promise<void>;
    handleEdit: (id: string, name: string, description: string) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleDownload: (doc: Document) => void;
    getDownloadUrl: (id: string) => string;
}

export const useFileManagement = (category: string): UseFileManagement => {
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const convertToFileDocument = (file: FileData): Document => ({
        ...file,
        size: formatFileSize(file.size),
        type: file.mimeType.includes('pdf') ? 'PDF' : file.mimeType.includes('spreadsheet') ? 'Excel' : 'DOC',
    });

    // Função para carregar os documentos
    const loadDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fileService.listFiles(category);
            setDocuments(data.map(convertToFileDocument));
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
            toast({
                title: "Erro ao carregar",
                description: "Não foi possível carregar a lista de documentos.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [category, toast]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    // Função para upload
    const handleUpload = async (file: File, name: string, description: string, item?: string) => {
        try {
            const uploadedFile = await fileService.uploadFile(file, name, description, category, item);
            setDocuments(prev => [convertToFileDocument(uploadedFile), ...prev]);
            toast({
                title: "Sucesso",
                description: "Documento enviado com sucesso!"
            });
        } catch (error) {
            console.error('Erro no upload:', error);
            toast({
                title: "Erro no envio",
                description: "Não foi possível enviar o documento. Verifique o tamanho e permissões.",
                variant: "destructive"
            });
            throw error; // Propaga o erro para o modal (se necessário)
        }
    };

    // Função para edição (apenas metadados)
    const handleEdit = async (id: string, name: string, description: string) => {
        try {
            const updatedFile = await fileService.updateFile(id, name, description);
            const updatedDoc = convertToFileDocument(updatedFile);

            setDocuments(prev =>
                prev.map(doc => (doc.id === id ? updatedDoc : doc))
            );

            toast({
                title: "Documento atualizado",
                description: "As informações foram salvas com sucesso."
            });
        } catch (error) {
            console.error('Erro na edição:', error);
            toast({
                title: "Erro na edição",
                description: "Não foi possível atualizar o documento. Verifique as permissões.",
                variant: "destructive"
            });
            throw error;
        }
    };

    // Função para exclusão
    const handleDelete = async (id: string) => {
        try {
            await fileService.deleteFile(id);
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            toast({
                title: "Documento removido",
                description: "O documento foi excluído com sucesso."
            });
        } catch (error) {
            console.error('Erro ao deletar:', error);
            toast({
                title: "Erro ao excluir",
                description: "Não foi possível excluir o documento. Verifique as permissões.",
                variant: "destructive"
            });
            throw error;
        }
    };

    // Função para download (apenas notifica, a tag <a> faz o trabalho)
    const handleDownload = (doc: Document) => {
        toast({
            title: "Download iniciado",
            description: `Baixando ${doc.name}...`
        });
    };

    const getDownloadUrl = fileService.getDownloadUrl;

    return {
        documents,
        isLoading,
        loadDocuments,
        handleUpload,
        handleEdit,
        handleDelete,
        handleDownload,
        getDownloadUrl
    };
};