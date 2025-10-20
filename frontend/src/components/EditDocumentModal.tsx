import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you use Textarea for description
import { Label } from "@/components/ui/label";
import { Document } from "@/services/fileService"; // Import the correct Document type

interface EditDocumentModalProps {
  // --- CORREÇÃO: Use the imported Document type ---
  document: Document;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void> | void; // Allow async submit
}

export const EditDocumentModal = ({ document, onClose, onSubmit }: EditDocumentModalProps) => {
  const [name, setName] = useState(document.name);
  const [description, setDescription] = useState(document.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, description });
      // onClose(); // Let the parent component handle closing on success if needed
    } catch (error) {
      // Error handling can be done here or in the parent component's onSubmit
      console.error("Failed to submit edit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form if the document prop changes
  useEffect(() => {
    setName(document.name);
    setDescription(document.description);
  }, [document]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 min-h-[80px]" // Example styling
                required
              />
            </div>
            {/* Display non-editable info like upload date or size if desired */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">Upload:</Label>
              {/* Use createdAt instead of uploadDate */}
              <span className="col-span-3 text-sm text-muted-foreground">
                {new Date(document.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {/* You might display size or mimetype here as well */}

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};