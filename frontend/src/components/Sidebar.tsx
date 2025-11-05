import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Camera,
  BarChart3,
  GraduationCap,
  ClipboardCheck,
  Shield
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ✅ CORREÇÃO #8: Função auxiliar para verificar permissão
  const hasPermission = (requiredPermission: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(requiredPermission);
  };

  const menuItems = [
    { path: "https://app.accia.com.br/site/login", label: "ARESP", icon: ClipboardCheck, external: true },
    // ✅ CORREÇÃO #8: Adicionar permissões para ocultar áreas sem acesso
    { path: "/diagnostico-ear", label: "DIAGNÓSTICO DO EAR", icon: FileText, permission: 'VIEW:DIAGNOSTIC' },
    { path: "/normas-procedimentos", label: "NORMAS E PROCEDIMENTOS", icon: FileText, permission: 'VIEW:NORMS' },
    { path: "/documentos-registros", label: "DOCUMENTOS E REGISTROS", icon: FileText, permission: 'VIEW:REGISTERS' },
    { path: "https://app.accia.com.br/site/login", label: "GESTÃO DE OCORRENCIAS", icon: FileText, external: true },
    { path: "/legislacao", label: "LEGISLAÇÃO", icon: FileText, permission: 'VIEW:LEGISLATION' },
    { path: "https://v2.findme.id/login", label: "GESTÃO DE ROTINAS OPERACIONAIS", icon: FileText, external: true },
    { path: "/sistema-cftv", label: "SISTEMA DE CFTV", icon: Camera, permission: 'VIEW:CFTV' },
    { path: "/auditoria", label: "AUDITORIA", icon: Shield, permission: 'VIEW:AUDIT' },
  ];

  return (
    <aside className="w-full lg:w-80 space-y-4">
      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          {menuItems.map((item) => {
            // ✅ CORREÇÃO #8: Ocultar item se o usuário não tiver a permissão necessária
            if (item.permission && !hasPermission(item.permission)) {
              return null; // Não renderiza o item
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.label}
                onClick={() =>
                  item.external
                    ? window.open(item.path, "_blank")
                    : navigate(item.path)
                }
                variant={isActive ? "default" : "outline"}
                className={`w-full justify-start text-sm ${isActive ? "btn-primary" : ""}`}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}

          <div className="pt-4 space-y-3">
            {/* Dashboard - Visível apenas para quem tem permissão */}
            {hasPermission('VIEW:DASHBOARDS') && (
              <div className="bg-muted p-4 rounded-lg">
                <Button
                  className="w-full bg-secondary text-white hover:bg-secondary/90 flex-col h-auto py-3"
                  onClick={() => navigate("/dashboard")}
                >
                  <BarChart3 className="h-4 w-4 mb-1" />
                  <span className="text-xs">Dashboards</span>
                  <span className="text-xs">Acessar</span>
                </Button>
              </div>
            )}

            {/* Treinamentos - Sempre visível (link externo) */}
            <div
              className="bg-muted p-4 rounded-lg text-center cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => window.open("https://unicasp.woli.com.br/pt-BR/Login/Index?returnUrl=%2F", "_blank")}
            >
              <GraduationCap className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm font-medium">TREINAMENTOS</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default Sidebar;