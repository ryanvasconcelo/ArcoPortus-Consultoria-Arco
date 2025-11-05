import { useState, useEffect } from "react";
import { Camera } from "@/services/cameraService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, Video } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EnhancedCameraModalProps {
  editData: Camera | null;
  onClose: () => void;
  onSubmit: (data: Partial<Camera>) => void;
}

export function EnhancedCameraModal({ editData, onClose, onSubmit }: EnhancedCameraModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    ipAddress: "",
    model: "",
    fabricante: "",
    businessUnit: "",
    type: "",
    area: "",
    hasAnalytics: false,
    isActive: true,
    recordingHours: 0, // Correção #4: Adicionar campo de tempo de gravação (em horas)
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        location: editData.location || "",
        ipAddress: editData.ipAddress || "",
        model: editData.model || "",
        fabricante: editData.fabricante || "",
        businessUnit: editData.businessUnit || "",
        type: editData.type || "",
        area: editData.area || "",
        hasAnalytics: editData.hasAnalytics || false,
        isActive: editData.isActive,
        recordingHours: editData.recordingHours || 0, // Correção #4: Carregar tempo de gravação
      });
    }
  }, [editData]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!editData;


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl glass-card border-white/10 animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Câmera" : "Nova Câmera"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Nº Câmera *</Label><Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="location">Local de Instalação</Label><Input id="location" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="ipAddress">Endereço IP</Label><Input id="ipAddress" value={formData.ipAddress} onChange={(e) => handleChange("ipAddress", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="model">Modelo</Label><Input id="model" value={formData.model} onChange={(e) => handleChange("model", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="fabricante">Fabricante</Label><Input id="fabricante" value={formData.fabricante} onChange={(e) => handleChange("fabricante", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="businessUnit">Unidade de Negócio</Label><Input id="businessUnit" value={formData.businessUnit} onChange={(e) => handleChange("businessUnit", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="type">Tipo</Label><Input id="type" value={formData.type} onChange={(e) => handleChange("type", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="recordingHours">Tempo de Gravação (Horas)</Label><Input id="recordingHours" type="number" value={formData.recordingHours} onChange={(e) => handleChange("recordingHours", e.target.value)} min="0" /></div>
              <div className="space-y-2"><Label htmlFor="area">Área</Label>
                <Select value={formData.area || ""} onValueChange={(value) => handleChange("area", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione a área..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Interna">Interna</SelectItem><SelectItem value="Externa">Externa</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-2"><Switch id="hasAnalytics" checked={formData.hasAnalytics} onCheckedChange={(checked) => handleChange("hasAnalytics", checked)} /><Label htmlFor="hasAnalytics">Possui Analítico?</Label></div>
              <div className="flex items-center space-x-2"><Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleChange("isActive", checked)} /><Label htmlFor="isActive">Ativa/Inativa (Correção #3)</Label></div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
              <Button type="submit" className="flex-1 gradient-primary hover-lift"><Save className="mr-2 h-4 w-4" />Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}