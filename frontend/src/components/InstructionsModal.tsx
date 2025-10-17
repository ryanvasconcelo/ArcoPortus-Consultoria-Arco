import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Info, Download } from "lucide-react";
import React from "react";

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    downloadUrl: string;
    downloadFilename: string;
    children: React.ReactNode;
}

export function InstructionsModal({
    isOpen,
    onClose,
    title,
    downloadUrl,
    downloadFilename,
    children,
}: InstructionsModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-lg glass-card border-white/10 animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        {title}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground space-y-2">
                        {children}
                    </div>
                    <div className="pt-4 border-t">
                        <Button asChild className="w-full gradient-primary hover-lift">
                            <a href={downloadUrl} download={downloadFilename}>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar Modelo
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}