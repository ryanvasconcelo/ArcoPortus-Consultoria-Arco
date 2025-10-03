import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import arcoPortusLogo from "@/assets/arco-portus-logo.png";

const ArcoPortusLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/arco-portus");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full filter blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold">
                ARCO | <span className="text-secondary">Uma solução para cada necessidade</span>
              </h1>
              <p className="text-xl text-gray-300">
                Soluções especializadas para cada área do seu negócio
              </p>
            </div>

            {/* Services Grid - Professional Layout */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <img src={arcoPortusLogo} alt="Arco Portus" className="h-12 mb-3 object-contain" />
                <h3 className="font-bold text-lg mb-1">Arco Portus</h3>
                <p className="text-sm text-gray-300">Documentação portuária</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <div className="h-12 mb-3 flex items-center">
                  <span className="text-3xl font-bold text-secondary">ACCIA</span>
                </div>
                <h3 className="font-bold text-lg mb-1">ACCIA</h3>
                <p className="text-sm text-gray-300">Gestão empresarial</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <div className="h-12 mb-3 flex items-center">
                  <span className="text-2xl font-bold text-green-400">✓ ArcoMoki</span>
                </div>
                <h3 className="font-bold text-lg mb-1">ArcoMoki</h3>
                <p className="text-sm text-gray-300">Checklist digital</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <div className="h-12 mb-3 flex items-center">
                  <span className="text-2xl font-bold text-blue-400">ArcoView</span>
                </div>
                <h3 className="font-bold text-lg mb-1">ArcoView</h3>
                <p className="text-sm text-gray-300">Monitoramento</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <div className="h-12 mb-3 flex items-center">
                  <span className="text-2xl font-bold text-purple-400">GuardControl</span>
                </div>
                <h3 className="font-bold text-lg mb-1">GuardControl</h3>
                <p className="text-sm text-gray-300">Controle de acesso</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <div className="h-12 mb-3 flex items-center">
                  <span className="text-2xl font-bold text-yellow-400">UNICASP</span>
                </div>
                <h3 className="font-bold text-lg mb-1">UNICASP</h3>
                <p className="text-sm text-gray-300">Educação cooperativa</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <div className="h-12 mb-3 flex items-center">
                  <span className="text-2xl font-bold text-orange-400">CGA</span>
                </div>
                <h3 className="font-bold text-lg mb-1">CGA</h3>
                <p className="text-sm text-gray-300">Central de gestão</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-10 shadow-2xl">
            <div className="mb-8 text-center">
              <img src={arcoPortusLogo} alt="Arco Portus" className="h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Acesse sua conta</h2>
              <p className="text-gray-600">Entre com suas credenciais</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300 focus:border-secondary focus:ring-secondary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-300 focus:border-secondary focus:ring-secondary pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg"
              >
                Acessar
              </Button>

              <div className="text-center">
                <a href="#" className="text-sm text-secondary hover:underline">
                  Esqueci minha senha
                </a>
              </div>
            </form>

            {/* Certifications */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-center items-center gap-6 opacity-70">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="text-xs text-gray-600">PSP</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <p className="text-xs text-gray-600">ISPS CODE</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-xs text-gray-600">LGPD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-10">
        © 2023 Arco Consultoria em Segurança - Todos os direitos reservados.
      </div>
    </div>
  );
};

export default ArcoPortusLogin;