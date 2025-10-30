import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import backgroundImage from "@/assets/background-login.png";
import arcoPortusLogo from "@/assets/arco-portus-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import api from "@/services/api";

const ArcoPortusLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn({ email, password });
      navigate("/");
    } catch (error) {
      console.error("Falha no login:", error);
      toast({
        variant: "destructive",
        title: "Falha na autenticação",
        description: "Credenciais inválidas. Verifique seu e-mail e senha.",
      });
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (forgotEmail: string) => {
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });

      toast({
        title: "Verifique seu e-mail",
        description: "Se o e-mail estiver cadastrado, um link para redefinição foi enviado.",
      });
      setIsForgotModalOpen(false);
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível processar sua solicitação no momento.",
      });
    }
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-end px-6 md:px-12 lg:px-24">
        <div className="w-full max-w-md mr-0 md:mr-12 lg:mr-24">
          {/* Header */}
          <header className="text-right mb-8 space-y-3 animate-slide-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Plataforma de</h1>
            <h2 className="text-lg md:text-xl font-light tracking-wider text-foreground/90">
              GERENCIAMENTO DE OPERAÇÕES
            </h2>
            <h2 className="text-lg md:text-xl font-light tracking-wider text-foreground/90">
              DE SEGURANÇA PORTUÁRIA
            </h2>
            <p className="text-primary text-xl md:text-2xl font-semibold mt-2">Safety | Security</p>
          </header>

          {/* Login Card */}
          <article
            className="bg-card/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-border/20 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="text-center">
                <img src={arcoPortusLogo} alt="Arco Portus" className="h-16 mx-auto mb-2" />
                <h1 className="text-4xl font-bold tracking-tight">
                  ARCO<span className="text-primary">PORTUS</span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 mx-auto mt-2 rounded-full" />
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-5 w-full animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-secondary/50 border-border/50 backdrop-blur-sm focus:border-primary focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-secondary/50 border-border/50 backdrop-blur-sm focus:border-primary focus:ring-primary transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all hover:shadow-glow"
              >
                {isLoading ? "Acessando..." : "Acessar"}
              </Button>

              <div className="text-center pt-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotModalOpen(true);
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Esqueci minha senha →
                </a>
              </div>
            </form>
          </article>

          {/* Certification Badges */}
          <div
            className="flex items-center justify-center gap-6 mt-8 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {[
              { icon: "🏆", label: "PSP" },
              { icon: "🛡️", label: "ISPS CODE" },
              { icon: "✓", label: "LGPD" },
            ].map((cert) => (
              <div key={cert.label} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-secondary/30 border-2 border-border flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl font-bold text-center text-foreground">{cert.icon}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{cert.label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-center mb-2">
              <div className="text-2xl font-bold text-foreground">
                <span className="text-primary">▲</span> ARCO
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 Arco Consultoria em Segurança - Todos os direitos reservados.
            </p>
          </footer>
        </div>
      </div>

      {/* Modal */}
      {isForgotModalOpen && (
        <ForgotPasswordModal
          onClose={() => setIsForgotModalOpen(false)}
          onSubmit={handleForgotPasswordSubmit}
        />
      )}
    </main>
  );
};

export default ArcoPortusLogin;
