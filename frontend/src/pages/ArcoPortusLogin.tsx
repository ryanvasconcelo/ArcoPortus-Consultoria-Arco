import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import arcoPortusLogo from "@/assets/arco-portus-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
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
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/30 rounded-full filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-primary/30 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-7xl grid lg:grid-cols-[1.1fr,1fr] gap-16 items-center">
          <div className="text-white space-y-10">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <div className="text-6xl font-black tracking-tight leading-tight">
                  ARCO
                  <div className="h-1 w-24 bg-gradient-to-r from-secondary via-primary to-accent rounded-full mt-2"></div>
                </div>
              </div>
              <h1 className="text-3xl font-light text-gray-200">
                Uma solução para cada <span className="font-semibold text-secondary">necessidade</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl">
                Ecossistema completo de soluções integradas para transformar a gestão do seu negócio
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { name: "Arco Portus", desc: "Documentação portuária", color: "from-yellow-500 to-yellow-600", logo: arcoPortusLogo },
                { name: "ACCIA", desc: "Gestão empresarial", color: "from-blue-500 to-blue-600" },
                { name: "ArcoMoki", desc: "Checklist digital", color: "from-green-500 to-green-600" },
                { name: "ArcoView", desc: "Monitoramento visual", color: "from-cyan-500 to-cyan-600" },
                { name: "GuardControl", desc: "Controle de acesso", color: "from-purple-500 to-purple-600" },
                { name: "UNICASP", desc: "Educação cooperativa", color: "from-amber-500 to-amber-600" },
                { name: "CGA", desc: "Central de gestão", color: "from-orange-500 to-orange-600" },
              ].map((service, idx) => (
                <div
                  key={service.name}
                  className="group relative bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:bg-white/10 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
                  {service.logo ? (
                    <img src={service.logo} alt={service.name} className="h-10 mb-3 object-contain" />
                  ) : (
                    <div className={`h-10 mb-3 flex items-center text-xl font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                      {service.name}
                    </div>
                  )}
                  <h3 className="font-bold text-base mb-1 text-white group-hover:text-secondary transition-colors">{service.name}</h3>
                  <p className="text-xs text-gray-400">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl"></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 animate-scale-in">
              <div className="mb-10 text-center">
                <div className="relative inline-block mb-6">
                  <img src={arcoPortusLogo} alt="Arco Portus" className="h-20 mx-auto relative z-10" />
                  <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full"></div>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Bem-vindo</h2>
                <p className="text-gray-500 text-base">Acesse sua conta para continuar</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-base transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl pr-14 text-base transition-all"
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
                  className="w-full h-14 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? "Acessando..." : "Acessar Plataforma"}
                </Button>

                <div className="text-center pt-2">
                  {/* --- MODIFICAÇÃO INÍCIO --- */}
                  {/* 5. Conecta o link para abrir o modal */}
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
                  {/* --- MODIFICAÇÃO FIM --- */}
                </div>
              </form>
              <div className="mt-10 pt-8 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center mb-4">Certificações e Conformidades</p>
                <div className="flex justify-center items-center gap-8">
                  {[
                    { icon: "🏆", label: "PSP" },
                    { icon: "🛡️", label: "ISPS CODE" },
                    { icon: "✓", label: "LGPD" }
                  ].map((cert) => (
                    <div key={cert.label} className="text-center group">
                      <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">{cert.icon}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{cert.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-sm z-10">
        <p>© 2024 Arco Consultoria em Segurança - Todos os direitos reservados</p>
      </div>

      {/* --- MODIFICAÇÃO INÍCIO --- */}
      {/* 6. Renderiza o modal condicionalmente */}
      {isForgotModalOpen && (
        <ForgotPasswordModal
          onClose={() => setIsForgotModalOpen(false)}
          onSubmit={handleForgotPasswordSubmit}
        />
      )}
      {/* --- MODIFICAÇÃO FIM --- */}
    </div>
  );
};

export default ArcoPortusLogin;