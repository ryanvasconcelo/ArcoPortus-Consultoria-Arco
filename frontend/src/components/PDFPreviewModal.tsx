import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PDFPreviewModalProps {
  onClose: () => void;
  fileName: string;
  fileUrl?: string;
}

export function PDFPreviewModal({ onClose, fileName, fileUrl }: PDFPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-6xl h-[90vh] glass-card border-white/10 animate-scale-in flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-xl font-semibold">
            Preview - {fileName}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          {fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={fileName}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">📄</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preview Indisponível</h3>
                  <p className="text-sm text-muted-foreground">
                    O arquivo ainda não foi carregado no sistema.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
