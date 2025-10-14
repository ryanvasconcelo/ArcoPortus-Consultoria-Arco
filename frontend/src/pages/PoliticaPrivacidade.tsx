import ArcoPortusHeader from "@/components/Header";
import ArcoPortusFooter from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import headerImg from "@/assets/BannerCGA04.png";
import lgpdCert from "@/assets/selo-LGPD.png";

const PoliticaPrivacidade = () => {
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
              <h2 className="text-xl font-bold mb-4 text-secondary">Política de Privacidade</h2>
              <p className="text-muted-foreground">
                A Arco Consultoria em Segurança ("nós", "nosso", "nossos") respeita a sua privacidade e se preocupa
                com a segurança dos seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos,
                compartilhamos e protegemos as suas informações pessoais quando você utiliza o nosso site ("Plataforma").
                Ao acessar a Plataforma, você aceita as práticas descritas nesta Política de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Garantia e Compromisso</h2>
              <p className="text-muted-foreground">
                Para garantir este compromisso e cumprir as normas de Proteção de Dados, disponibilizamos aos usuários
                que navegam pelo nosso site as Políticas de Privacidade da Arco Consultoria em Segurança, de acordo com
                a natureza específica dos serviços que oferecemos, com o objetivo de informá-lo sobre como tratamos seus
                dados pessoais e como protegemos as informações quando interagimos com você.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Suporte Arco</h2>
              <p className="text-muted-foreground">
                Em caso de dúvidas, solicitações, consultas ou outros assuntos relacionados à Proteção de Dados Pessoais,
                entre em contato conosco pelo e-mail suporte@consultoriaarco.com.br.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Coleta de Dados</h2>
              <p className="text-muted-foreground">
                Coletamos informações que você nos fornece diretamente, como quando você preenche formulários, cria uma
                conta ou entra em contato conosco. Também coletamos informações automaticamente através do uso de cookies
                e tecnologias similares.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Uso das Informações</h2>
              <p className="text-muted-foreground">
                Utilizamos suas informações para fornecer e melhorar nossos serviços, comunicar com você, cumprir
                obrigações legais e proteger nossos direitos e os de nossos usuários.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Compartilhamento de Dados</h2>
              <p className="text-muted-foreground">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto conforme
                descrito nesta política ou com seu consentimento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Segurança</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações
                pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Seus Direitos</h2>
              <p className="text-muted-foreground">
                Você tem o direito de acessar, corrigir, excluir ou portar suas informações pessoais. Você também pode
                retirar seu consentimento a qualquer momento.
              </p>
            </section>

            {/* LGPD Certification */}
            <div className="flex justify-center mt-8">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                <div className="p-4">
                  <div className="w-48 h-48 bg-muted rounded-full flex items-center justify-center">
                    <img src={lgpdCert} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <ArcoPortusFooter />
    </div>
  );
};

export default PoliticaPrivacidade;