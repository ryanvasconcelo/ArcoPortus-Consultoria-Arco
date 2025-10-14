import ArcoPortusHeader from "@/components/Header";
import ArcoPortusFooter from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import headerImg from "@/assets/BannerCGA04.png";

const CondicoesUso = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Image */}
        <div
          className="h-64 rounded-lg mb-8 flex items-center justify-center text-white relative"
          style={{
            backgroundImage: `url(${headerImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Informações que coletamos</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1.1. Informações Pessoais:</h3>
                  <p className="text-muted-foreground">
                    Quando você acessa a Plataforma, podemos coletar informações pessoais que você nos fornece voluntariamente,
                    como seu nome, endereço de e-mail, número de telefone e outras informações de contato.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">1.2. Informações de Acesso:</h3>
                  <p className="text-muted-foreground">
                    Podemos coletar informações sobre o seu dispositivo, como endereço IP, navegador, sistema operacional,
                    data e hora de acesso à Plataforma.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Como Usamos Suas Informações</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">2.1. Fornecimento de Serviços:</h3>
                  <p className="text-muted-foreground">
                    Utilizamos suas informações para fornecer os serviços da Plataforma, responder às suas solicitações
                    e melhorar a experiência do usuário.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2.2. Comunicações:</h3>
                  <p className="text-muted-foreground">
                    Podemos utilizar suas informações para enviar informações relacionadas à Plataforma, atualizações,
                    ofertas especiais e outros comunicados que possam ser do seu interesse.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Compartilhamento de Informações</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">3.1. Parceiros de Negócios:</h3>
                  <p className="text-muted-foreground">
                    Podemos compartilhar suas informações com parceiros de negócios confiáveis que nos auxiliam na
                    operação da Plataforma e na prestação de serviços.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3.2. Requisitos Legais:</h3>
                  <p className="text-muted-foreground">
                    Reservamo-nos o direito de compartilhar suas informações quando exigido por lei, regulamentação ou processo legal.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies e tecnologias similares para melhorar a funcionalidade da Plataforma, analisar o uso
                e personalizar sua experiência. Você pode controlar o uso de cookies nas configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Segurança das Informações</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado,
                uso indevido ou divulgação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Seus Direitos</h2>
              <p className="text-muted-foreground">
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos
                ou fazer perguntas sobre esta Política de Privacidade, entre em contato conosco através das informações
                de contato fornecidas abaixo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Alterações nesta Política de Privacidade</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de atualizar esta Política de Privacidade periodicamente para refletir mudanças
                em nossas práticas de privacidade. A data de vigência será atualizada para refletir a data da revisão mais recente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Contato</h2>
              <p className="text-muted-foreground">
                Se você tiver alguma dúvida ou preocupação relacionada a esta Política de Privacidade ou ao uso de suas
                informações pessoais, entre em contato conosco.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      <ArcoPortusFooter />
    </div>
  );
};

export default CondicoesUso;