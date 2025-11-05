import ArcoPortusHeader from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Camera,
  ClipboardCheck,
  Scale
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GestaoArquivos = () => {
  const navigate = useNavigate();

  const services = [
    {
      path: "https://app.accia.com.br/site/login",
      label: "ARESP",
      icon: ClipboardCheck,
      color: "from-blue-500/20 to-blue-600/20",
      external: true
    },
    {
      path: "/diagnostico-ear",
      label: "DIAGNÓSTICO DO EAR",
      icon: FileText,
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      path: "/normas-procedimentos",
      label: "NORMAS E PROCEDIMENTOS",
      icon: FileText,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      path: "/documentos-registros",
      label: "DOCUMENTOS E REGISTROS",
      icon: FileText,
      color: "from-orange-500/20 to-orange-600/20"
    },
    {
      path: "https://app.accia.com.br/site/login",
      label: "GESTÃO DE OCORRÊNCIAS",
      icon: FileText,
      color: "from-yellow-500/20 to-yellow-600/20",
      external: true
    },
    {
      path: "/legislacao",
      label: "LEGISLAÇÃO",
      icon: FileText,
      color: "from-indigo-500/20 to-indigo-600/20"
    },
    {
      path: "https://v2.findme.id/login",
      label: "GESTÃO DE ROTINAS OPERACIONAIS",
      icon: FileText,
      color: "from-pink-500/20 to-pink-600/20",
      external: true
    },
    // ✅ CORREÇÃO #2: Card de Treinamento REMOVIDO, Card de Auditoria ADICIONADO
    {
      path: "/auditoria",
      label: "AUDITORIA",
      icon: Scale,
      color: "from-amber-500/20 to-amber-600/20"
    },
    {
      path: "/sistema-cftv",
      label: "SISTEMA DE CFTV",
      icon: Camera,
      color: "from-red-500/20 to-red-600/20"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <Sidebar />

          <div className="flex-1">
            <div className="bg-secondary text-white text-center py-6 rounded-lg mb-8">
              <h1 className="text-2xl font-bold">GESTÃO DE ARQUIVOS</h1>
              <p className="text-sm mt-2 opacity-90">Centralize e gerencie toda a documentação do sistema portuário</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={service.label}
                    className={`cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${service.color} border-2 border-border/50`}
                    onClick={() =>
                      service.external
                        ? window.open(service.path, "_blank")
                        : navigate(service.path)
                    }
                  >
                    <CardContent className="p-8 text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="p-4 bg-secondary/10 rounded-full">
                          <Icon className="h-10 w-10 text-secondary" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{service.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        Clique para acessar
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto">
          © 2025_V02 Arco Security I Academy I Solutions - Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default GestaoArquivos;