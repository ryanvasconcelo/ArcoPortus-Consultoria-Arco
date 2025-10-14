import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react"; // Removida a importação duplicada e o 'Target' não utilizado
import ArcoPortusHeader from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Dashboards from "@/assets/icons/dashboards.png";
import aresp from "@/assets/icons/aresp.png";
import ear from "@/assets/icons/ear.png";
import normas from "@/assets/icons/normas.png";
import registros from "@/assets/icons/registros.png";
import treinamento from "@/assets/icons/treinamento.png";
import ocorrencias from "@/assets/icons/treinamento.png";
import legislacao from "@/assets/icons/legislacao.png";
import cftv from "@/assets/icons/cftv.png";
import rotinas from "@/assets/icons/rotinas.png";
import ArcoPortusFooter from "@/components/Footer";

const ArcoPortusHome = () => {
  const solutions = [
    {
      title: "Dashboards",
      icon: Dashboards,
      description: "Visualização de dados e relatórios",
      action: "Acessar",
      href: "/dashboard",
      featured: true
    },
    {
      title: "ARESP",
      icon: aresp,
      description: "Acesso ao sistema ARESP",
      action: "Acessar",
      href: "https://app.accia.com.br/site/login",
      external: true
    },
    {
      title: "DIAGNÓSTICO DO EAR",
      icon: ear,
      description: "Estudo de Avaliação de Riscos",
      action: "Acessar",
      href: "/diagnostico-ear"
    },
    {
      title: "NORMAS E PROCEDIMENTOS",
      icon: normas,
      description: "Documentação normativa",
      action: "Acessar",
      href: "/normas-procedimentos"
    },
    {
      title: "DOCUMENTOS E REGISTROS",
      icon: registros,
      description: "Gestão documental",
      action: "Acessar",
      href: "/documentos-registros"
    },
    {
      title: "TREINAMENTOS",
      icon: treinamento,
      description: "Capacitação e certificação",
      action: "Acessar",
      href: "https://unicasp.woli.com.br/pt-BR/Login/Index?returnUrl=%2F",
      external: true
    },
    {
      title: "GESTÃO DE OCORRENCIAS",
      icon: ocorrencias,
      description: "Controle operacional",
      action: "Acessar",
      href: "https://app.accia.com.br/site/login",
      external: true
    },
    {
      title: "LEGISLAÇÃO",
      icon: legislacao,
      description: "Base legal e normativa",
      action: "Acessar",
      href: "/legislacao"
    },
    {
      title: "SISTEMA DE CFTV",
      icon: cftv,
      description: "Monitoramento e segurança",
      action: "Acessar",
      href: "/sistema-cftv"
    },
    {
      title: "GESTÃO DE ROTINAS OPERACIONAIS",
      icon: rotinas,
      description: "Operações portuárias",
      action: "Acessar",
      href: "https://v2.findme.id/login",
      external: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-20">
        {/* Hero Carousel */}
        <div className="mb-8">
          <HeroCarousel />
        </div>

        {/* Área do Cliente */}
        <div className="bg-secondary text-white text-center py-4 rounded-t-lg">
          <h2 className="text-xl font-bold">ÁREA DO CLIENTE</h2>
        </div>

        {/* Solutions Grid */}
        <div className="bg-white border border-border rounded-b-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {solutions.map((solution, index) => {
              const IconSrc = solution.icon;
              return (
                <a
                  key={index}
                  href={solution.href}
                  target={solution.external ? "_blank" : "_self"}
                  rel={solution.external ? "noopener noreferrer" : undefined}
                  className="no-underline"
                >
                  <Card
                    key={index}
                    className={`transition-all duration-200 corporate-card hover-lift group cursor-pointer animate-scale-in flex flex-col h-full ${solution.featured ? 'bg-secondary text-white' : NaN}`}
                  >
                    <CardContent className="flex flex-col flex-grow justify-between p-6 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        {/* Ícone */}
                        <div className="w-16 h-16 mx-auto flex items-center justify-center">
                          <img src={IconSrc} alt={solution.title} className="w-full h-full object-fill" />
                        </div>
                        {/* Título e descrição */}
                        <div className="min-h-[80px] flex flex-col justify-start">
                          <h3 className={`font-bold text-sm mb-2 ${solution.featured ? 'text-white' : 'text-foreground'}`}>
                            {solution.title}
                          </h3>
                          <p className={`text-xs ${solution.featured ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {solution.description}
                          </p>
                        </div>

                      </div>

                      {/* Botão */}
                      <Button className={`mt-6 w-full ${solution.featured ? 'bg-white text-secondary hover:bg-white/90' : 'btn-primary'}`} onClick={() => {
                        if (solution.external) {
                          window.open(solution.href, '_blank');
                        } else {
                          window.location.href = solution.href;
                        }
                      }}>
                        {solution.action}
                        {solution.external && <ExternalLink className="h-4 w-4 ml-2" />}
                      </Button>
                    </CardContent>

                  </Card>
                </a>

              );
            })}
          </div>
        </div>
      </main>

      <ArcoPortusFooter />
    </div>
  );
};

export default ArcoPortusHome;