import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Clock,
  Send
} from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Simular envio
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });

    // Limpar formulário
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      mensagem: ''
    });
  };

  const handleClearForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      mensagem: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-4">
              Entre em Contato
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos aqui para ajudar! Entre em contato conosco através de qualquer um dos canais abaixo.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="glass-card border-white/10 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="w-full h-2 bg-gradient-to-r from-primary via-primary-glow to-amber-950 rounded-full mb-6"></div>
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Send className="h-6 w-6 text-primary" />
                  Envie sua Mensagem
                </CardTitle>
                <p className="text-muted-foreground">
                  Preencha o formulário e entraremos em contato em breve
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium">
                      Seu nome <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="glass-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Seu email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="glass-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-sm font-medium">
                      Telefone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      placeholder="Seu número de telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="glass-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem" className="text-sm font-medium">
                      Mensagem <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      placeholder="Sua mensagem"
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      className="glass-input min-h-[120px] resize-none"
                      rows={5}
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <Button
                      type="submit"
                      className="gradient-primary hover-lift px-8"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClearForm}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Limpar formulário
                    </Button>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-xs text-muted-foreground">
                      * Indica uma pergunta obrigatória
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-muted-foreground">contato@consultoriaarco.com.br</p>
                      <p className="text-muted-foreground">suporte@consultoriaarco.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Telefone</h3>
                      <p className="text-muted-foreground">+55 (11) 9999-9999</p>
                      <p className="text-muted-foreground">+55 (11) 8888-8888</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Globe className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Website</h3>
                      <p className="text-muted-foreground">www.consultoriaarco.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Horário de Atendimento</h3>
                      <p className="text-muted-foreground">Segunda a Sexta: 8h às 18h</p>
                      <p className="text-muted-foreground">Sábado: 8h às 12h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="hover-lift flex items-center gap-2"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      className="hover-lift flex items-center gap-2"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                    <Button
                      variant="outline"
                      className="hover-lift flex items-center gap-2"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      className="hover-lift flex items-center gap-2"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="container mx-auto">
          © 2023 Arco Consultoria em Segurança - Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Contact;