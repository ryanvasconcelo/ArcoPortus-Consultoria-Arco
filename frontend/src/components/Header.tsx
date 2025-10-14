import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileCard } from "@/components/UserProfileCard";
import ArcoPortusLogo from "@/assets/arco-portus-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();

  // ADICIONAMOS UM LOG PARA VER O QUE REALMENTE ESTÁ CHEGANDO
  console.log("Header renderizou com o usuário:", user);

  // Se o usuário ainda não carregou, renderizamos um header "placeholder" ou nada
  // Isso evita o erro fatal
  if (!user) {
    return (
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 h-[88px]">
          {/* Pode colocar um skeleton loader aqui */}
        </div>
      </header>
    );
  }

  // Usamos optional chaining (?.) para acessar 'company.name' de forma segura
  const profileCardUser = {
    name: user.name,
    email: user.email,
    role: user.role,
    company: user?.company?.name || "Empresa não informada", // Se 'user' ou 'company' for nulo, usa um valor padrão
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={ArcoPortusLogo} alt="Arco Portus" className="h-12 w-auto" />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => `transition-colors font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-primary'}`}
            >
              INÍCIO
            </NavLink>
            <NavLink
              to="/gestao-arquivos"
              className={({ isActive }) => `transition-colors font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-primary'}`}
            >
              GESTÃO DE ARQUIVOS
            </NavLink>
            <NavLink
              to="/canal-denuncias"
              className={({ isActive }) => `transition-colors font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-primary'}`}
            >
              CANAL DE DENÚNCIAS
            </NavLink>
            <NavLink
              to="/contato"
              className={({ isActive }) => `transition-colors font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-foreground hover:text-primary'}`}
            >
              FALE CONOSCO
            </NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            <UserProfileCard
              user={profileCardUser}
              onLogout={signOut}
            />
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;