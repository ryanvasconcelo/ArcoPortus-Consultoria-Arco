import logoArco from "@/assets/Arco-Solutions-bgwhite.svg";

const ArcoPortusFooter = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img src={logoArco} alt="" className="w-32" />
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="/condicoes-uso" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover transition-colors font-medium">
              Condições de Uso
            </a>
            <a href="/politica-cookies" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover transition-colors font-medium">
              Política de Cookies
            </a>
            <a href="/politica-privacidade" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover transition-colors font-medium">
              Política de Privacidade
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/80">
          © 2025_V02 Arco Security I  Academy  I  Solutions - Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default ArcoPortusFooter;