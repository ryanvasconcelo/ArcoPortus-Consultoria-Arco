import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, Shield } from "lucide-react";
import Header from "../components/Header"
import Blockchain from "../assets/blockchain.png"
import LogoAS from "../assets/Arco-Solutions.png"
import Intux from "../assets/intux-logo.webp"
import QRCode from "../assets/qrcode.png"


const WhistleblowerChannel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      <div className="container mx-auto px-32 py-16">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-amber-950 p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-4 mb-8">
                <MessageSquare className="h-8 w-8" />
                <h1 className="text-2xl lg:text-4xl font-bold">
                  Canal de Denúncia
                </h1>
              </div>

              <div className="space-y-6">

                <div className="max-w-4xl mx-auto space-y-4 text-lg">
                  <div className="space-y-2">
                    <p>Sua opinião é muito importante para nós!
                      Nossa solução precisa da sua participação. Se você presenciar ou sofrer algo que prejudique qualquer certificação <strong>DENUNCIE!</strong>
                    </p>
                  </div>

                  <p className="text-xl font-semibold mt-8">
                    Acesse através dos meios abaixo:
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Access Methods */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* QR Code */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg inline-block">
                  <div className="w-64 h-64 bg-gradient-to-br from-black/10 to-black/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <img src={QRCode} alt="" />
                  </div>
                  <p className="text-sm text-black/70 font-medium">
                    Acesso rápido pelo celular
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Direct Access */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Acesso Direto
                </h3>
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    Clique no link abaixo para acessar o canal de denúncia
                  </p>

                  <Button
                    className="w-full gradient-primary hover-lift text-lg py-6"
                    onClick={() => window.open('https://web.intuix.com.br/report-channel?customerId=42034f5f-9b75-4508-97bd-7c6af9de6bac', '_blank')}
                  >
                    <MessageSquare className="mr-3 h-5 w-5" />
                    Acessar Canal de Denúncia
                  </Button>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>✓ Canal seguro e confidencial</p>
                    <p>✓ Denúncia anônima disponível</p>
                    <p>✓ Suporte 24 horas</p>
                    <p>✓ Protocolo blockchain</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Footer */}
          <div className="mt-16 max-w-6xl mx-auto">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-between items-center gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <img src={LogoAS} alt="Logo Arco Solution" className="w-20" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <img src={Intux} alt="certificacao intux" className="w-28" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <img src={Blockchain} alt="certificacao blockchain" className="w-36" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto">
          © 2023 Arco Consultoria em Segurança - Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default WhistleblowerChannel;