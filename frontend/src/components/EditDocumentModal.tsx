import { useState } from "react";
import { X, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface EditDocumentModalProps {
  document: {
    id: string;
    name: string;
    description: string;
    uploadDate: string;
    size: string;
    type: string;
  };
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
}

export function EditDocumentModal({ document, onClose, onSubmit }: EditDocumentModalProps) {
  const [formData, setFormData] = useState({
    name: document.name,
    description: document.description
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl glass-card border-white/10 animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Editar Documento
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Documento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Razão Social e CNPJ.pdf"
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: 1.1.1 Razão Social e CNPJ"
                  className="glass-input min-h-[100px]"
                  required
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="text-sm text-muted-foreground">
                  <strong>Informações do Arquivo:</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tamanho:</span> {document.size}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span> {document.type}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Upload:</span> {document.uploadDate}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 gradient-primary hover-lift"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}