import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import solutionsImage from "@/assets/solutions-image.jpg";
import { RiFolderChartFill } from '@remixicon/react';
import { useNavigate } from 'react-router-dom'
// Importe suas imagens de logo aqui
import acciaLogo from "@/assets/accia-logo.png";
import guardControlLogo from "@/assets/guardcontroll-logo.png";
import arcoViewLogo from "@/assets/arcoview-controll.png";
import arcomokiLogo from "@/assets/checklist-facil-logo.jpg";
import unicaspLogo from "@/assets/unicasp-logo.png";
import arcoPorusLogo from "@/assets/arco-portus-logo.png";

const solutions = [
  {
    title: "Accia",
    titleImage: acciaLogo,
    description: "Sistema de Gestão e Análise de Risco de Segurança Corporativa",
    link: "/accia" // Nova propriedade para navegação
  },
  {
    title: "Guard Control",
    titleImage: guardControlLogo,
    description: "Gestão e Controle de Equipamento e Operações de Segurança e Facilities em tempo real",
    link: "/guard-control"
  },
  {
    title: "Arco View",
    titleImage: arcoViewLogo,
    description: "Solução de Monitoramento por Drones Automatizados",
    link: "/arco-view"
  },
  {
    title: "Arcomoki",
    titleImage: arcomokiLogo,
    description: "Sistema de Formulários Eletrônicos para Gestão de Processos e Controle de Qualidade",
    link: "/arcomoki"
  },
  {
    title: "Unicasp",
    titleImage: unicaspLogo,
    description: "Sua Plataforma de Educação Corporativa para Capacitação e Aprendizado de Equipes",
    link: "/unicasp"
  },
  {
    title: "Arco Portus",
    titleImage: arcoPorusLogo,
    description: "Plataforma de Gerenciamento de Operações de Segurança Portuária e Controle de Acesso",
    link: "/arco-portus"
  }
];

const SolutionsGrid = () => {
  // Opção 1: Usando React Router
  const navigate = useNavigate();

  const handleCardClick = (link) => {
    navigate(link);
  };

  // Opção 2: Função para navegação simples (sem React Router)
  const handleCardClickSimple = (link) => {
    window.location.href = link;
  };

  // Opção 3: Abrir em nova aba
  const handleCardClickNewTab = (link) => {
    window.open(link, '_blank');
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Side - Company Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold mb-2">
                <span className="text-secondary">CGA</span>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                CENTRAL DE GESTÃO ARCO
              </div>
              <h2 className="heading-secondary mb-4">
                Gestão Unificada das Soluções
              </h2>
              <p className="text-corporate text-lg mb-6">
                <span className="text-primary font-semibold">de Segurança, Serviços</span>
                <br />
                <span className="text-primary font-semibold">e Treinamentos</span>
              </p>
            </div>

            <div className="relative group overflow-hidden rounded-2xl shadow-medium hover:shadow-strong transition-all duration-500">
              <img
                src={solutionsImage}
                alt="Gestão Unificada"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Tudo em um</h3>
                <p className="text-primary text-3xl font-bold">Só Lugar!</p>
              </div>
            </div>
          </div>

          {/* Right Side - Solutions Grid */}
          <div className="lg:col-span-8">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
              {solutions.map((solution, index) => (
                <Card
                  key={solution.title}
                  className="corporate-card hover-lift group cursor-pointer animate-scale-in flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCardClick(solution.link)} // Adiciona o evento de clique
                >
                  <CardHeader className="pb-3">
                    <div className="mb-3">
                      <img
                        src={solution.titleImage}
                        alt={solution.title}
                        className="w-48 h-16 object-contain mx-auto mb-4 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex-col">
                    <CardDescription className="text-corporate text-sm leading-relaxed group-hover:text-primary transition-colors flex-1">
                      {solution.description}
                    </CardDescription>

                    <div className="mt-auto">
                      <Button
                        className="w-full btn-primary group-hover:shadow-glow"
                        onClick={(e) => {
                          e.stopPropagation(); // Previne a propagação do evento para o card
                          handleCardClick(solution.link);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        ACESSAR
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Dashboards Section */}
            <div className="mt-8">
              <Card className="corporate-card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover-lift">
                <CardContent className="p-8 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="flex text-2xl font-bold text-foreground mb-2 gap-2">
                        <div className="flex items-center justify-center">
                          <RiFolderChartFill size={24} />
                        </div>
                        Dashboards
                      </h3>
                      <p className="text-corporate">
                        Visualização completa de dados e métricas em tempo real
                      </p>
                    </div>
                    <Button className="btn-secondary hover-glow">
                      Acessar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsGrid;