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

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/aresp", label: "ARESP", icon: ClipboardCheck },
    { path: "/diagnostico-ear", label: "DIAGNÓSTICO DO EAR", icon: FileText },
    { path: "/normas-procedimentos", label: "NORMAS E PROCEDIMENTOS", icon: FileText },
    { path: "/documentos-registros", label: "DOCUMENTOS E REGISTROS", icon: FileText },
    { path: "/gestao-rotinas", label: "GESTÃO DE ROTINAS OPERACIONAIS", icon: FileText },
    { path: "/legislacao", label: "LEGISLAÇÃO", icon: FileText },
    { path: "/sistema-cftv", label: "SISTEMA DE CFTV", icon: Camera },
    { path: "/auditoria", label: "AUDITORIA", icon: Shield },
  ];

  return (
    <aside className="w-full lg:w-80 space-y-4">
      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={isActive ? "default" : "outline"}
                className={`w-full justify-start text-sm ${isActive ? "btn-primary" : ""
                  }`}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}

          <div className="pt-4 space-y-3">
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
            <div
              className="bg-muted p-4 rounded-lg text-center cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => window.open("https://unicasp.edu.br", "_blank")}
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