// src/components/ConfirmationModal.tsx

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode; // Usamos ReactNode para mensagens mais ricas
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar Exclusão",
    cancelText = "Cancelar",
    isLoading = false,
}: ConfirmationModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-md glass-card border-red-500/20 animate-scale-in">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-destructive/10 p-2 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="text-sm text-muted-foreground">{message}</div>
                </CardContent>

                <CardFooter className="flex gap-3 pt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {isLoading ? "Excluindo..." : confirmText}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}