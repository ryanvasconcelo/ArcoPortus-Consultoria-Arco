import { useState } from "react";
import { X, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EnhancedCameraModalProps {
  onClose: () => void;
  onSubmit: (cameraData: any) => void;
  editData?: any;
}

export function EnhancedCameraModal({ onClose, onSubmit, editData }: EnhancedCameraModalProps) {
  const [formData, setFormData] = useState({
    unidadeNegocio: editData?.unidadeNegocio || "",
    numeroCamera: editData?.numeroCamera || "",
    localInstalacao: editData?.localInstalacao || "",
    emFuncionamento: editData?.emFuncionamento || "Sim",
    tipo: editData?.tipo || "Bullet",
    areaExternaInterna: editData?.areaExternaInterna || "Externa",
    fabricante: editData?.fabricante || "",
    modelo: editData?.modelo || "",
    possuiAnalitico: editData?.possuiAnalitico || "Não",
    diasGravacao: editData?.diasGravacao || "30",
    ip: editData?.ip || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <Card className="w-full max-w-3xl glass-card border-white/10 animate-scale-in my-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {editData ? "Editar Câmera" : "Adicionar Câmera"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidadeNegocio">Unidade de Negócio *</Label>
                <Input
                  id="unidadeNegocio"
                  value={formData.unidadeNegocio}
                  onChange={(e) => handleChange("unidadeNegocio", e.target.value)}
                  placeholder="Ex: Porto Chibatão"
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCamera">Nº Câmera *</Label>
                <Input
                  id="numeroCamera"
                  value={formData.numeroCamera}
                  onChange={(e) => handleChange("numeroCamera", e.target.value)}
                  placeholder="Ex: CAM-001"
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localInstalacao">Local de Instalação *</Label>
                <Input
                  id="localInstalacao"
                  value={formData.localInstalacao}
                  onChange={(e) => handleChange("localInstalacao", e.target.value)}
                  placeholder="Ex: Portaria 02"
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emFuncionamento">Em Funcionamento? *</Label>
                <Select value={formData.emFuncionamento} onValueChange={(value) => handleChange("emFuncionamento", value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bullet">Bullet</SelectItem>
                    <SelectItem value="Dome">Dome</SelectItem>
                    <SelectItem value="Mini Dome">Mini Dome</SelectItem>
                    <SelectItem value="PTZ">PTZ</SelectItem>
                    <SelectItem value="Speed Dome">Speed Dome</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaExternaInterna">Área Externa / Interna *</Label>
                <Select value={formData.areaExternaInterna} onValueChange={(value) => handleChange("areaExternaInterna", value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Externa">Externa</SelectItem>
                    <SelectItem value="Interna">Interna</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabricante">Fabricante *</Label>
                <Select value={formData.fabricante} onValueChange={(value) => handleChange("fabricante", value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Selecione o fabricante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intelbras">Intelbras</SelectItem>
                    <SelectItem value="Hikvision">Hikvision</SelectItem>
                    <SelectItem value="Axis">Axis</SelectItem>
                    <SelectItem value="Dahua">Dahua</SelectItem>
                    <SelectItem value="Giga Security">Giga Security</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleChange("modelo", e.target.value)}
                  placeholder="Ex: VIP 1230 B"
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="possuiAnalitico">Possui Analítico? *</Label>
                <Select value={formData.possuiAnalitico} onValueChange={(value) => handleChange("possuiAnalitico", value)}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diasGravacao">Dias de Gravação *</Label>
                <Input
                  id="diasGravacao"
                  type="number"
                  value={formData.diasGravacao}
                  onChange={(e) => handleChange("diasGravacao", e.target.value)}
                  placeholder="Ex: 30"
                  className="glass-input"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip">Endereço IP</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={(e) => handleChange("ip", e.target.value)}
                  placeholder="Ex: 192.168.1.100"
                  className="glass-input"
                />
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
                {editData ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}