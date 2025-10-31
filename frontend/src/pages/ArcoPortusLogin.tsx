import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import arcoPortusLogo from "@/assets/arco-portus-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import certifies from "@/assets/certifys.png";
import arcoBg from "@/assets/background-login.png";

// --- MODIFICAÇÃO INÍCIO ---
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal"; // 1. Importa o novo modal
import api from "@/services/api"; // 2. Importa nossa instância da API
// --- MODIFICAÇÃO FIM ---

const ArcoPortusLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // --- MODIFICAÇÃO INÍCIO ---
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false); // 3. Estado para controlar o modal
  // --- MODIFICAÇÃO FIM ---

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

  // --- MODIFICAÇÃO INÍCIO ---
  // 4. Nova função para lidar com o envio do modal de "Esqueci minha senha"
  const handleForgotPasswordSubmit = async (forgotEmail: string) => {
    try {
      // Chama nosso novo endpoint no backend
      await api.post('/auth/forgot-password', { email: forgotEmail });

      toast({
        title: "Verifique seu e-mail",
        description: "Se o e-mail estiver cadastrado, um link para redefinição foi enviado.",
      });
      setIsForgotModalOpen(false); // Fecha o modal após o sucesso
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível processar sua solicitação no momento.",
      });
    }
  };
  // --- MODIFICAÇÃO FIM ---

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0">
        <img
          src={arcoBg}
          alt="Background"
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-8xl grid grid-cols-1 lg:grid-cols-[1.1fr,1.3fr] gap-8 lg:gap-16 items-center">
          <div className="text-white space-y-10 hidden lg:block">
            {/* Conteúdo lateral opcional */}
          </div>

          <div className="relative w-full max-w-xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 animate-scale-in">
            <div className="mb-8 text-center">
              <div className="relative inline-block mb-6">
                <img src={arcoPortusLogo} alt="Arco Portus" className="h-16 sm:h-20 mx-auto relative z-10" />
                <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full"></div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Bem-vindo</h2>
              <p className="text-gray-500 text-sm sm:text-base">Acesse sua conta para continuar</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 sm:h-14 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-base transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 sm:h-14 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl pr-14 text-base transition-all"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? "Acessando..." : "Acessar Plataforma"}
              </Button>

              <div className="text-center pt-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotModalOpen(true);
                  }}
                  className="text-sm text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Esqueci minha senha →
                </a>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center mb-4">Certificações e Conformidades</p>
              <div className="flex justify-center items-center">
                <img src={certifies} alt="" className="max-w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-xs sm:text-sm z-10 px-4">
        <p>© 2025_V02 Arco Security I Academy I Solutions - Todos os direitos reservados.</p>
      </div>

      {isForgotModalOpen && (
        <ForgotPasswordModal
          onClose={() => setIsForgotModalOpen(false)}
          onSubmit={handleForgotPasswordSubmit}
        />
      )}
    </div>

  );
};

export default ArcoPortusLogin;