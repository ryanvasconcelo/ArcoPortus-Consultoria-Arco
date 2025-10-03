import { Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfileCard } from "@/components/UserProfileCard";
import ArcoPortusLogo from "@/assets/arco-portus-logo.png";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={ArcoPortusLogo} alt="" className="h-12 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className={`transition-colors font-medium ${window.location.pathname === '/'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground hover:text-primary'
                }`}
            >
              INÍCIO
            </a>
            <a
              href="/gestao-arquivos"
              className={`transition-colors font-medium ${window.location.pathname === '/admin/users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground hover:text-primary'
                }`}
            >
              GESTÃO DE ARQUIVOS
            </a>
            <a
              href="/canal-denuncias"
              className={`transition-colors font-medium ${window.location.pathname === '/canal-denuncias'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground hover:text-primary'
                }`}
            >
              CANAL DE DENÚNCIAS
            </a>
            <a
              href="/contato"
              className={`transition-colors font-medium ${window.location.pathname === '/contato'
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground hover:text-primary'
                }`}
            >
              FALE CONOSCO
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <UserProfileCard
              user={{
                name: "João Silva",
                email: "joao.silva@empresa.com",
                role: "ADMIN",
                company: "Porto Chibatão S.A."
              }}
              onLogout={() => {
                // Handle logout
                console.log("Logout clicked");
              }}
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