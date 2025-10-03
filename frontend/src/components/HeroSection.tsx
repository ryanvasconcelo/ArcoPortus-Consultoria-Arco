import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-secondary via-secondary-light to-secondary overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Tecnologia e Inovação"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="text-primary">Segurança</span> e{" "}
              <span className="text-primary">Inovação</span>
              <br />
              <span className="text-white/90 text-3xl lg:text-5xl">
                gerando informações integradas
              </span>
            </h1>

            <p className="text-white/80 text-lg lg:text-xl mb-8 leading-relaxed max-w-lg">
              Soluções corporativas avançadas para gestão unificada,
              monitoramento em tempo real e análise de dados integrada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="btn-primary text-lg px-8 py-4 hover-glow">
                Explorar Soluções
              </Button>
              <Button variant="outline" className="text-lg border-white hover:bg-gray-300 hover:text-secondary text-lg px-8 py-4">
                Saiba Mais
              </Button>
            </div>
          </div>

          <div className="relative lg:block animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl"></div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 rounded-full">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[0, 1, 2, 3, 4].map((dot, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-primary scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;