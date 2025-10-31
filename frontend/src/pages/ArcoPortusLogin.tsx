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
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import api from "@/services/api";
import logoArco from "@/assets/Arco-Solutions-bgwhite.svg";


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
      await api.post('/auth/forgot-password', { email: forgotEmail });

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
    <div className="h-screen relative overflow-hidden bg-slate-900 box-border">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={arcoBg}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Header Text - Topo Direito */}
      <div className="absolute top-8 right-7 lg:top-16 lg:right-60 z-20 text-center max-w-md lg:max-w-lg px-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-light text-white -mb-1">
          Plataforma de
        </h1>
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wide -mb-1">
          GERENCIAMENTO DE OPERAÇÕES
        </h2>
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white uppercase tracking-wide mb-1">
          DE SEGURANÇA PORTUÁRIA
        </h2>
        <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#FDB913]">
          Safety | Security
        </p>
      </div>

      {/* Login Card - Centro Direita */}
      <div className="relative z-10 h-full flex items-center justify-end sm:px-8 lg:px-16 mt-12">
        <div className="w-full max-w-sm lg:max-w-md lg:mr-32">
          <div className="relative w-full max-w-xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 animate-scale-in">
            <div className="mb-2 text-center">
              <div className="relative inline-block mb-6">
                <img src={arcoPortusLogo} alt="Arco Portus" className="h-16 sm:h-20 mx-auto relative z-10" />
                <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full"></div>
              </div>
              <p className="text-gray-500 text-sm sm:text-base">Acesse sua conta para continuar</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
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
          </div>
          {/* Certificações - Fora do Card */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/60 mb-2">Certificações e Conformidades</p>
            <div className="flex justify-center items-center">
              <img src={certifies} alt="Certificações" className="w-full sm:w-64 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer com Logo ARCO */}
      <div className="absolute bottom-4 left-0 right-0 z-20 text-center px-4 sm:bottom-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-white/80 text-xs sm:text-sm">
            <img src={logoArco} alt="" className="w-20 mx-auto pb-2" />
            <p>© 2025_V02 Arco Security I Academy I Solutions - Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Modal Esqueci Senha */}
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