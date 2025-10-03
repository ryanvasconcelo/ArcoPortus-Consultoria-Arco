import ArcoPortusHeader from "@/components/Header";
import ArcoPortusFooter from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const PoliticaCookies = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Image */}
        <div
          className="h-64 rounded-lg mb-8 flex items-center justify-center text-white relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold">Política de Cookies</h1>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">O que são Cookies?</h2>
              <p className="text-muted-foreground">
                Os cookies são pequenos arquivos de dados que se instalam no computador ou dispositivo móvel do usuário
                e que permitem que seja o próprio usuário quem armazene ou recupere as informações geradas por sua
                atividade na rede, através de seu computador ou de seu dispositivo móvel. Deste modo, pode ser melhorada
                e personalizada a experiência do usuário com o site e os serviços que este oferece.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Cookies e Tecnologias Similares</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Este site utiliza cookies para proporcionar a você a melhor experiência de navegação.
                </p>
                <p className="text-muted-foreground">
                  Utilizamos cookies e tecnologias similares para melhorar a funcionalidade da Plataforma, analisar o
                  uso e personalizar sua experiência. Você pode controlar o uso de cookies nas configurações do seu
                  navegador. Nós valorizamos a sua privacidade e a segurança dos seus dados.
                </p>
                <p className="text-muted-foreground">
                  Para saber mais sobre como utilizamos os cookies e como protegemos os seus dados pessoais, consulte
                  nossa Política de Privacidade.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Como gerenciar cookies</h2>
              <p className="text-muted-foreground">
                Você pode configurar seu navegador para aceitar ou recusar cookies, ou para alertá-lo quando um cookie
                estiver sendo enviado. No entanto, se você escolher recusar cookies, isso pode afetar sua experiência
                de navegação e alguns recursos do site podem não funcionar adequadamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Tipos de cookies utilizados</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Cookies essenciais:</h3>
                  <p className="text-muted-foreground">
                    Necessários para o funcionamento básico do site e não podem ser desabilitados.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cookies de performance:</h3>
                  <p className="text-muted-foreground">
                    Coletam informações sobre como você usa o site para melhorar a performance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cookies funcionais:</h3>
                  <p className="text-muted-foreground">
                    Permitem que o site lembre de suas escolhas e forneça recursos aprimorados.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-secondary">Contato</h2>
              <p className="text-muted-foreground">
                Se você tiver dúvidas sobre nossa política de cookies, entre em contato conosco através do
                email: suporte@consultoriaarco.com.br
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      <ArcoPortusFooter />
    </div>
  );
};

export default PoliticaCookies;